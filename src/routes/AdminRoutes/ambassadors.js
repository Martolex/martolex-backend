const AmbassadorDetails = require("../../models/AmbassadorDetails");
const { Colleges, User } = require("../../models");
const { ValidationError, ForeignKeyConstraintError } = require("sequelize");
const ambassadorRoutes = require("../studentAmbassador");
const sequelize = require("../../config/db");
const router = require("express").Router();
router.use(
  "/:id",
  (req, res, next) => {
    req.user.ambassadorId = req.params.id;
    next();
  },
  ambassadorRoutes
);

router.route("/").get(async (req, res) => {
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
});

router.route("/new").post(async (req, res) => {
  if (!req.body.collegeId || !req.body.userId || req.body.isActive) {
    res.status(400).json({ code: 0, message: "bad request" });
  } else {
    try {
      AmbassadorDetails.create({ ...req.body });
      User.update({ isAmbassador: true }, { where: { id: req.body.userId } });
      res.json({ code: 1, data: { message: "created" } });
    } catch (err) {
      console.log(err);
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
      }
    }
  }
});

router.route("/isValidCandidate").get(async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({
    attributes: ["id"],
    where: { email },
    include: {
      model: AmbassadorDetails,
      as: "ambassador",
      required: false,
      attributes: ["id"],
    },
  });
  res.json({
    code: 1,
    data: {
      isValid: user ? !user.ambassador : false,
      id: user && user.id,
    },
  });
});

router.route("/deactivate").post(async (req, res) => {
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

    res.json({ code: 1, data: { message: "ambassador account deactivated" } });
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
