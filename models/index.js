const BookRent = require("./BookRent");
const BookImages = require("./BookImgs");
const Cart = require("./Cart");
const UserAddress = require("./UserAddress");
const Book = require("./Book");
const User = require("./User");
const Categories = require("./categories");
const SubCategories = require("./subCategories");

Book.belongsTo(BookRent, {
  foreignKey: "rentId",
  as: "rent",
  onDelete: "CASCADE",
});
BookRent.hasOne(Book, {
  foreignKey: "rentId",
  as: "book",
  onDelete: "CASCADE",
});

Book.hasMany(BookImages);

Book.belongsTo(User, { foreignKey: "uploader", as: "upload" });
User.hasMany(Book, { foreignKey: "uploader", as: "Books" });
User.hasMany(UserAddress);
User.hasMany(Cart);

Book.hasMany(Cart);
Cart.belongsTo(Book);

Categories.hasMany(SubCategories, {
  as: "subcategories",
  foreignKey: "parentCategory",
  onDelete: "CASCADE",
});

SubCategories.hasMany(Book, { foreignKey: "subCatId", as: "subCat" });
Book.belongsTo(SubCategories, { foreignKey: "subCatId", as: "subCat" });
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
