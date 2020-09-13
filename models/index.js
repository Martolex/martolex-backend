const BookRent = require("./BookRent");
const BookImages = require("./BookImgs");
const Cart = require("./Cart");
const UserAddress = require("./UserAddress");
const Book = require("./Book");
const User = require("./User");
const Categories = require("./categories");
const SubCategories = require("./subCategories");
const NotFoundBook = require("./NotFoundBook");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

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

BookImages.belongsTo(Book);
Book.hasMany(BookImages, { foreignKey: "BookId", as: "images" });

Book.belongsTo(User, { foreignKey: "uploader", as: "upload" });
User.hasMany(Book, { foreignKey: "uploader", as: "Books" });
UserAddress.belongsTo(User, { foreignKey: "UserId", as: "user" });
User.hasMany(UserAddress, { foreignKey: "UserId", as: "addresses" });

Cart.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Cart, { foreignKey: "userId", as: "cartItems" });

Book.hasMany(Cart, { foreignKey: "BookId", as: "booksincart" });
Cart.belongsTo(Book, { foreignKey: "BookId", as: "book" });

Categories.hasMany(SubCategories, {
  as: "subcategories",
  foreignKey: "parentCategory",
  onDelete: "CASCADE",
});

SubCategories.belongsTo(Categories, {
  as: "category",
  foreignKey: "parentCategory",
  onDelete: "CASCADE",
});

SubCategories.hasMany(Book, { foreignKey: "subCatId", as: "books" });
Book.belongsTo(SubCategories, { foreignKey: "subCatId", as: "subCat" });

Order.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Order, { foreignKey: "userId", as: "orders" });

UserAddress.hasMany(Order, { foreignKey: "addressId", as: "orders" });
Order.belongsTo(UserAddress, { foreignKey: "addressId", as: "address " });

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE",
});
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

Book.hasMany(OrderItem, { foreignKey: "bookId", as: "ordered" });
OrderItem.belongsTo(Book, { foreignKey: "bookId", as: "book" });

module.exports = {
  BookRent,
  BookImages,
  Cart,
  Book,
  UserAddress,
  User,
  Categories,
  SubCategories,
  NotFoundBook,
  Order,
};
