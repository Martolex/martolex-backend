const sequelize = require("../../config/db");
const { commisionRate } = require("./config");

const router = require("express").Router();

router.route("/").get(async (req, res) => {
  try {
    const query = `select orderId,email ,name,phoneNo, 
    format(sum(rent+deposit),2) as orderTotal ,sum(qty) as booksCount, orderDate,
    format((sum(rent+deposit)) * ${commisionRate},2) as earning
    from (
        select o.id as orderId,o.createdAt as orderDate,
        oi.bookId ,oi.qty, oi.rent , oi.deposit ,
        u.email, u.name , u.phoneNo,
        l.createdAt as leadCreationDate
        from Orders o inner join orderItems oi inner join Users u INNER join Leads l 
        on o.id = oi.orderId and o.userId = u.id and u.email = l.email WHERE l.ambassador='${req.user.ambassadorId}'
      ) as od WHERE time_to_sec(timediff(orderDate , leadCreationDate)) > 0 GROUP BY orderId order by orderDate DESC`;

    const orders = await sequelize.query(query);
    res.json({ code: 1, data: orders[0] });
  } catch (err) {
    console.log(err);
    res.json({ code: 0, message: "something went wrong" });
  }
});
module.exports = router;
