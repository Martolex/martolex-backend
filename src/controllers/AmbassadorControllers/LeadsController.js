const { Leads, Colleges } = require("../../models");
const { UniqueConstraintError } = require("sequelize");

const leadsController = {
  getLeads: async (req, res) => {
    try {
      const leads = await Leads.findAll({
        where: { ambassador: req.user.ambassadorId },
        include: { model: Colleges, as: "college", attributes: ["name"] },
      });
      res.json({ code: 1, data: leads });
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  createLead: async (req, res) => {
    const addItem = async (lead) =>
      new Promise(async (resolve, reject) => {
        try {
          const savedLead = await Leads.create(lead);
          resolve(savedLead.toJSON());
        } catch (err) {
          if (err instanceof UniqueConstraintError) {
            if (err.errors[0].path === "email") {
              resolve({ ...lead, error: true });
            }
          }
        }
      });

    try {
      if (!req.body.collegeId) {
        res.status(400).json({ code: 0, message: "bad request" });
      } else {
        const { collegeId } = req.body;
        if (!req.body.multiple) {
          const lead = {
            name: req.body.name,
            email: req.body.email,
            phoneNo: req.body.phoneNo,
            ambassador: req.user.ambassadorId,
            collegeId,
          };
          if ((await addItem(lead)).error === true) {
            res.json({
              code: 1,
              data: { errors: { duplicates: [{ email: req.body.email }] } },
            });
          } else {
            res.json({ code: 1, data: { message: "lead added successfully" } });
          }
        } else {
          const leads = req.body.leads.map((lead) => ({
            name: lead.name,
            email: lead.email,
            phoneNo: lead.phoneNo,
            ambassador: req.user.ambassadorId,
            collegeId,
          }));
          let saveStatus = await Promise.all(
            leads.map((lead) => addItem(lead))
          );
          const errors = saveStatus
            .filter((lead) => lead.error === true)
            .map((lead) => ({ email: lead.email }));

          if (errors.length > 0) {
            res.json({ code: 1, data: { errors: { duplicates: errors } } });
          } else {
            res.json({
              code: 1,
              data: { message: "leads added successfully" },
            });
          }
        }
      }
    } catch (err) {
      res.json({ code: 0, message: err });
    }
  },
};

module.exports = leadsController;
