const { NewsLetterSubscriber } = require("../../models");

const router = require("express").Router();

router.post("/subscribe", async (req, res) => {
  try {
    const { name, email } = req.body;
    await NewsLetterSubscriber.create({ name, email });
    res.json({ code: 1, data: { message: "successfully subscribed" } });
  } catch (err) {
    console.log(err);
    res.json({ code: 0, message: "something went wrong" });
  }
});

module.exports = router;
