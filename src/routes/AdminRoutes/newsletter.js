const { NewsLetterSubscriber, Leads } = require("../../models");

const router = require("express").Router();
router.get("/getAllSubscribers", async (req, res) => {
  try {
    const newsLetterSubscribers = NewsLetterSubscriber.findAll({
      attributes: ["id", "name", "email"],
    });
    const leads = Leads.findAll({
      attributes: ["id", "name", "email", "phoneNo"],
    });

    const data = (await Promise.all([newsLetterSubscribers, leads])).reduce(
      (prev, curr) => [...prev, ...curr],
      []
    );
    res.json({ code: 1, data });
  } catch (err) {
    console.log(err);
    res.json({ code: 0, message: "something went wrong" });
  }
});

module.exports = router;
