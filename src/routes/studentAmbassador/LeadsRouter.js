const leadsController = require("../../controllers/AmbassadorControllers/LeadsController");

const router = require("express").Router();

router.route("/").get(leadsController.getLeads);

router.route("/newLead").post(leadsController.createLead);

module.exports = router;
