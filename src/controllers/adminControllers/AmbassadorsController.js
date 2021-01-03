const AmbassadorDetails = require("../../models/AmbassadorDetails");
const { Colleges, User } = require("../../models");
const { ValidationError, ForeignKeyConstraintError } = require("sequelize");
const sequelize = require("../../config/db");

const AmbassadorController = {
  getAllAmbassadors: async (req, res) => {
    const query = { isActive: true };
    if (req.query.collegeId) {
      query["$college.id$"] = req.query.collegeId;
    }
    if (req.query.isActive) {
      query.isActive = req.query.isActive;
    }
    try {
      const ambassadors = await AmbassadorDetails.findAll({
        where: query,
        include: [
          { model: Colleges, as: "college" },
          { model: User, as: "user", attributes: ["name", "email", "phoneNo"] },
        ],
      });
      res.json({ code: 1, data: ambassadors });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  addNewAmbassador: async (req, res) => {
    if (!req.body.collegeId || !req.body.userId || req.body.isActive) {
      res.status(400).json({ code: 0, message: "bad request" });
    } else {
      try {
        await sequelize.transaction(async (t) => {
          const ambassador = await AmbassadorDetails.findOne({
            where: { userId: req.body.userId },
          });
          let ambassadorPromise = null;
          if (ambassador) {
            if (!ambassador.isActive) {
              ambassador.isActive = true;
              ambassador.startDate = new Date();
              ambassador.endDate = null;
              ambassadorPromise = ambassador.save();
            } else {
              throw new Error("Ambassador Exists");
            }
          } else {
            ambassadorPromise = AmbassadorDetails.create({ ...req.body });
          }
          const userPromise = User.update(
            { isAmbassador: true },
            { where: { id: req.body.userId } }
          );

          await Promise.all([ambassadorPromise, userPromise]);
        });
        res.json({ code: 1, data: { message: "created" } });
      } catch (err) {
        if (err instanceof ValidationError) {
          if (err.errors[0].type == "unique violation")
            res.json({ code: 0, message: "ambassador exists" });
          else res.json({ code: 0, message: err.errors[0].message });
        } else if (err instanceof ForeignKeyConstraintError) {
          if (err.fields[0] == "userId") {
            res.json({ code: 0, message: "invalid user" });
          } else if (err.fields[0] == "collegeId") {
            res.json({ code: 0, message: "invalid College" });
          }
        } else {
          res.json({ code: 0, message: err.message });
        }
      }
    }
  },
  checkCandidateValidity: async (req, res) => {
    const { email } = req.query;
    const user = await User.findOne({
      attributes: ["id"],
      where: { email },
      include: {
        model: AmbassadorDetails,
        as: "ambassador",
        required: true,
        attributes: ["id", "isActive"],
      },
    });
    const isValid = user ? (user.ambassador.isActive ? false : true) : true;
    res.json({
      code: 1,
      data: {
        isValid,
        id: user && user.id,
      },
    });
  },
  deactivateAmbassador: async (req, res) => {
    if (!req.body.ambassadorId) {
      res.status(400).json({ code: 0, message: "bad request" });
    }
    try {
      const { ambassadorId } = req.body;
      await sequelize.transaction(async (t) => {
        const ambassador = await AmbassadorDetails.findByPk(ambassadorId, {
          transaction: t,
        });
        ambassador.isActive = false;
        ambassador.endDate = new Date();
        const updateAmbassadorDetails = ambassador.save({ transaction: t });
        const updateUser = User.update(
          { isAmbassador: false },
          { where: { id: ambassador.id }, transaction: t }
        );
        return await Promise.all([updateAmbassadorDetails, updateUser]);
      });

      res.json({
        code: 1,
        data: { message: "ambassador account deactivated" },
      });
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = AmbassadorController;
