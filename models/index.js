const BookRent = require("./BookRent");
const BookImages = require("./BookImgs");
const Cart = require("./Cart");
const UserAddress = require("./UserAddress");
const Book = require("./Book");
const Admins = require("./admins");
const User = require("./User");
const Categories = require("./categories");
const SubCategories = require("./subCategories");

Book.hasOne(BookRent);
Book.hasMany(BookImages);

User.hasMany(UserAddress);
User.hasMany(Cart);

Book.hasMany(Cart);
Cart.belongsTo(Book);

Book.belongsTo(Admins, { foreignKey: "uploadedBy" });

Categories.hasMany(SubCategories, {
  as: "subcategories",
  foreignKey: "parentCategory",
  onDelete: "CASCADE",
});
module.exports = {
  BookRent,
  BookImages,
  Cart,
  Book,
  UserAddress,
  User,
  Admins,
  Categories,
  SubCategories,
};
