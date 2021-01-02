const {
  UserProfileController,
  UserAddressController,
} = require("../controllers/UserProfileController");

const router = require("express").Router();

router
  .route("/")
  .get(UserProfileController.getProfile)
  .put(UserProfileController.modifyProfile);

router
  .route("/addresses")
  .get(UserAddressController.getUserAddresses)
  .post(UserAddressController.addNewAddress)
  .put(UserAddressController.modifyAddress)
  .delete(UserAddressController.deleteAddress);

router
  .route("/location")
  .get(UserProfileController.getUserLocation)
  .post(UserProfileController.recordUserLocation);

router.route("/sellerRegister").post(UserProfileController.sellerRegistration);

module.exports = router;
