const { commisionRate } = require("../../config/ambassadorConfig");
const sequelize = require("../../config/db");
const { Leads } = require("../../models");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment");

const genData = (prevYearStart, data) => {
  const generatedData = [];
  let startMonth = prevYearStart.getMonth() + 1;
  let startYear = prevYearStart.getFullYear();

  for (let i = 0; i <= 12; i++) {
    const existingObj =
      data.find((obj) => obj.month == startMonth && obj.year == startYear) ||
      {};
    const dataObj = { month: startMonth, year: startYear, ...existingObj };
    let { month, year, ...remainingobj } = dataObj;
    remainingobj.label = moment(`${month}-${year}`, "MM-YYYY").format(
      "MMM,YYYY"
    );
    generatedData.push(remainingobj);
    startMonth++;
    if (startMonth > 12) {
      startYear++;
      startMonth = 1;
    }
  }
  return generatedData;
};

const statsController = {
  getStats: async (req, res) => {
    const statsQuery = `select
          format(sum(rent+deposit),2) as totalSales,
          format(sum(if(NOW() - INTERVAL 1 MONTH < orderDate, rent+deposit , 0)),2) as oneMonthSales,
          
          sum(qty) as booksSold,
          
          format((sum(rent+deposit)) * ${commisionRate} ,2) as totalEarning,
          format(sum(if(NOW() - INTERVAL 1 MONTH < orderDate, rent+deposit , 0))*${commisionRate} , 2) as oneMonthEarning
          from (
              select l.ambassador ,o.createdAt as orderDate,o.referralCode,
              oi.bookId ,oi.qty, oi.rent , oi.deposit ,
              u.email, u.name , u.phoneNo,
              l.createdAt as leadCreationDate
              from Orders o inner join OrderItems oi inner join Users u 
              on o.id = oi.orderId and o.userId = u.id 
              LEFT OUTER JOIN Leads l 
              on u.email = l.email WHERE 
              l.ambassador='${req.user.ambassadorId}' OR o.referralCode = (SELECT referralCode from AmbassadorDetails where id='${req.user.ambassadorId}')
              ) as od WHERE time_to_sec(timediff(orderDate , leadCreationDate)) > 0 OR referralCode IS NOT NULL 
              ORDER BY orderDate DESC`;

    const chartsQuery = `SELECT
      
              FORMAT((SUM(rent+deposit)) * ${commisionRate} ,2) as earning,
              MONTH(orderDate) as month,YEAR(orderDate) as year
              FROM (
                  select l.ambassador ,o.createdAt as orderDate,o.referralCode,
                  oi.bookId ,oi.qty, oi.rent , oi.deposit ,
                  u.email, u.name , u.phoneNo,
                  l.createdAt as leadCreationDate
                  from Orders o INNER JOIN OrderItems oi INNER JOIN Users u 
                  on o.id = oi.orderId and o.userId = u.id
                  LEFT OUTER JOIN Leads l 
                  on u.email = l.email 
                  WHERE (l.ambassador='${req.user.ambassadorId}' OR o.referralCode = (select referralCode from AmbassadorDetails where id='${req.user.ambassadorId}')) and 
                  o.createdAt >  DATE_SUB(NOW() - INTERVAL 1 YEAR,INTERVAL DAYOFMONTH(NOW() - INTERVAL 1 YEAR)-1 DAY)
                  ) as od WHERE time_to_sec(timediff(orderDate , leadCreationDate)) > 0  or referralCode IS NOT NULL
                  GROUP BY MONTH(orderDate),YEAR(orderDate)
                  ORDER BY orderDate ASC`;
    try {
      const prevYearStart = moment()
        .subtract(1, "years")
        .startOf("month")
        .toDate();
      const promises = [
        sequelize.query(statsQuery),
        sequelize.query(chartsQuery),
        Leads.count({ where: { ambassador: req.user.ambassadorId } }),
        Leads.findAll({
          attributes: [
            [Sequelize.fn("count", Sequelize.col("id")), "count"],
            [Sequelize.fn("month", Sequelize.col("createdAt")), "month"],
            [Sequelize.fn("year", Sequelize.col("createdAt")), "year"],
          ],
          where: {
            ambassador: req.user.ambassadorId,
            createdAt: {
              [Op.gt]: prevYearStart,
            },
          },
          group: [sequelize.fn("month", Sequelize.col("createdAt"))],
        }),
      ];

      const stats = await Promise.all(promises);

      const earningData = genData(prevYearStart, stats[1][0]);
      const leadsData = genData(
        prevYearStart,
        stats[3].map((data) => data.toJSON())
      );
      res.json({
        code: 1,
        data: {
          stats: { ...stats[0][0][0], leads: stats[2] },
          chartData: { earning: earningData, leads: leadsData },
        },
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
};

module.exports = statsController;
