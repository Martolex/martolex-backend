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
const BookReview = require("./BookReview");
const SellerData = require("./SellerData");
const Tags = require("./Tags");
const BookTags = require("./BookTags");
const ReturnPayments = require("./ReturnPayments");
const NewsLetterSubscriber = require("./NewsLetterSubscriber");
const Colleges = require("./Colleges");
const AmbassadorDetails = require("./AmbassadorDetails");
const Leads = require("./Leads");
const PasswordResetRequests = require("./PasswordResetRequests");

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

PasswordResetRequests.belongsTo(User, { as: "user", foreignKey: "userId" });
User.hasMany(PasswordResetRequests, {
  as: "passwordResets",
  foreignKey: "userId",
});

Tags.belongsToMany(Book, { through: BookTags, as: "books" });
Book.belongsToMany(Tags, { through: BookTags, as: "tags" });

SubCategories.hasMany(Book, { foreignKey: "subCatId", as: "books" });
Book.belongsTo(SubCategories, { foreignKey: "subCatId", as: "subCat" });

Order.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Order, { foreignKey: "userId", as: "orders" });

Order.belongsTo(UserAddress, { foreignKey: "addressId", as: "address" });
UserAddress.hasMany(Order, { foreignKey: "addressId", as: "orders" });

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE",
});
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

Book.hasMany(OrderItem, { foreignKey: "bookId", as: "ordered" });
OrderItem.belongsTo(Book, { foreignKey: "bookId", as: "book" });

Book.hasMany(BookReview, { foreignKey: "bookId", as: "reviews" });
BookReview.belongsTo(Book, { foreignKey: "bookId", as: "book" });

User.hasMany(BookReview, { foreignKey: "userId", as: "reviews" });
BookReview.belongsTo(User, { foreignKey: "userId", as: "user" });

User.belongsTo(SellerData, {
  foreignKey: "sellerId",
  as: "sellerDetails",
  onDelete: "CASCADE",
});
SellerData.hasOne(User, { foreignKey: "sellerId", as: "user" });

OrderItem.hasMany(ReturnPayments, {
  foreignKey: "orderItemId",
  as: "payments",
});

ReturnPayments.belongsTo(OrderItem, { foreignKey: "orderItemId", as: "for" });

ReturnPayments.belongsTo(User, { foreignKey: "userId", as: "paidTo" });
User.hasMany(ReturnPayments, {
  foreignKey: "userId",
  as: "paymentsReceived",
});

//ambassadors

AmbassadorDetails.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
User.hasOne(AmbassadorDetails, { foreignKey: "userId", as: "ambassador" });

Colleges.hasMany(AmbassadorDetails, {
  foreignKey: "collegeId",
  as: "ambassadors",
});

AmbassadorDetails.belongsTo(Colleges, {
  foreignKey: "collegeId",
  as: "college",
});

Leads.belongsTo(Colleges, { foreignKey: "collegeId", as: "college" });
Colleges.hasMany(Leads, { foreignKey: "collegeId", as: "leads" });

Leads.belongsTo(AmbassadorDetails, {
  foreignKey: "ambassador",
  as: "approachedBy",
});
AmbassadorDetails.hasMany(Leads, { foreignKey: "ambassador", as: "leads" });

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
  OrderItem,
  BookReview,
  SellerData,
  Tags,
  Leads,
  AmbassadorDetails,
  BookTags,
  ReturnPayments,
  NewsLetterSubscriber,
  Colleges,
  PasswordResetRequests,
};
