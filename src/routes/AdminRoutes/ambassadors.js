const AmbassadorController = require("../../controllers/adminControllers/AmbassadorsController");
const ambassadorRoutes = require("../studentAmbassador");
const router = require("express").Router();
router.use(
  "/:id",
  (req, res, next) => {
    req.user.ambassadorId = req.params.id;
    next();
  },
  ambassadorRoutes
);

router.route("/").get(AmbassadorController.getAllAmbassadors);

router.route("/new").post(AmbassadorController.addNewAmbassador);

router
  .route("/isValidCandidate")
  .get(AmbassadorController.checkCandidateValidity);

router.route("/deactivate").post(AmbassadorController.deactivateAmbassador);
module.exports = router;
