const { User, UserAddress } = require("../models");
const { ValidationError } = require("sequelize");

const router = require("express").Router();

router
  .route("/")
  .get(async (req, res) => {
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: {
        exclude: ["password", "id", "isAdmin"],
      },
      include: { model: UserAddress, as: "addresses" },
    });
    res.json({ code: 1, data: { user } });
  })
  .put(async (req, res) => {
    if (!req.body.phoneNo || !req.body.email) {
      res.json({ code: 0, message: "bad request" });
    }
    try {
      const { email, phoneNo } = req.body;
      await User.update({ email, phoneNo }, { where: { id: req.user.id } });
      res.json({ code: 1, data: { message: "user modif}ied sucessfully" } });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.json({ code: 0, message: err.errors[0].message });
      } else {
        res.json({ code: 0, message: "something went wrong" });
      }
    }
  });

router
  .route("/addresses")
  .get(async (req, res) => {
    const filters = { UserId: req.user.id };
    if (req.query.type) {
      filters = { ...filters, type: req.query.type };
    }
    try {
      console.log(filters);
      const addresses = await UserAddress.findAll({ where: filters });
      res.json({ code: 1, data: addresses });
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  })
  .post(async (req, res) => {
    try {
      if (req.body.isDeleted) {
        res.json({ code: 0, message: "bad request" });
      }
      const address = await UserAddress.create({
        ...req.body,
        UserId: req.user.id,
      });
      res.json({ code: 1, data: { message: "address saved successfully" } });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.json({ code: 0, message: err.errors[0].message });
      } else {
        res.json({ code: 0, message: "something went wrong" });
      }
    }
  })
  .put(async (req, res) => {
    if (!req.body.type || req.body.isDeleted) {
      res.json({ code: 0, message: "bad request" });
    }
    try {
      const { type, ...body } = req.body;
      await UserAddress.update(
        { ...body },
        { where: { UserId: req.user.id, type } }
      );
      res.json({
        code: 1,
        data: { message: `${type} address modified successfully.` },
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.json({ code: 0, message: err.errors[0].message });
      } else {
        res.json({ code: 0, message: "something went wrong" });
      }
    }
  })
  .delete(async (req, res) => {
    if (!req.body.type) {
      res.json({ code: 0, message: "bad request" });
    }
    try {
      await UserAddress.destroy({
        where: { type: req.body.type, UserId: req.user.id },
      });
      res.json({
        code: 1,
        data: { message: `${req.body.type} address deleted` },
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.json({ code: 0, message: err.errors[0].message });
      } else {
        res.json({ code: 0, message: "something went wrong" });
      }
    }
  });

router
  .route("/location")
  .get(async (req, res) => {
    try {
      const location = await User.findOne({
        where: { id: req.user.id },
        attributes: ["location"],
      });
      res.json({ code: 1, data: { location } });
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  })
  .post(async (req, res) => {
    if (!req.body.lat || !req.body.long) {
      res.json({ code: 0, message: "bad request" });
      try {
        await User.update(
          { location: { type: "Point", coordinates: [long, lat] } },
          { where: { id: req.user.id } }
        );
        res.json({ code: 1, data: { message: "location stored" } });
      } catch (err) {
        if (err instanceof ValidationError) {
          res.json({ code: 0, message: err.errors[0].message });
        } else {
          res.json({ code: 0, message: "something went wrong" });
        }
      }
    }
  });

module.exports = router;
