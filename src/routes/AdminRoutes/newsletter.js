const { NewsLetterSubscriber } = require("../../models");

const router = require("express").Router();
router.get("/getAllSubscribers", async (req, res) => {
  try {
    const data = await NewsLetterSubscriber.findAll({
      attributes: ["name", "email"],
    });
    res.json({ code: 1, data });
  } catch (err) {
    res.json({ code: 0, message: "something went wrong" });
  }
});

module.exports = router;
