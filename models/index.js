const BookRent = require("./BookRent");
const BookImages = require("./BookImgs");
const Cart = require("./Cart");
const UserAddress = require("./UserAddress");
const Book = require("./Book");
const User = require("./User");
const Categories = require("./categories");
const SubCategories = require("./subCategories");

Book.hasOne(BookRent);
Book.hasMany(BookImages);

Book.belongsTo(User, { foreignKey: "uploader", as: "upload" });

User.hasMany(UserAddress);
User.hasMany(Cart);

Book.hasMany(Cart);
Cart.belongsTo(Book);

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
  Categories,
  SubCategories,
};
