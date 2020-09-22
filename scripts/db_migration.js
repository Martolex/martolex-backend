const db = require("../config/db");

const { Sequelize } = require("sequelize");
const {
  Categories,
  SubCategories,
  Book,
  BookRent,
  BookImages,
} = require("../models");

db.authenticate()
  .then(() => "Connection has been established successfully.")
  .catch((err) => console.log(err));

var oldDb = new Sequelize("martolex", "root", "", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
});

oldDb.query("select * from tbl_category").then(async (category) => {
  for (const cat of category[0]) {
    const newCat = await Categories.create({ name: cat.cat_name });
    const [subCategories] = await oldDb.query(
      `select * from tbl_subcategory where maincat_id = ${cat.cat_id}`
    );
    const newSubCats = await subCategories.map(async (subcat) => {
      const newsubCat = await SubCategories.create({
        name: subcat.subcat_name,
        parentCategory: newCat.id,
      });

      const [books] = await oldDb.query(
        `select * from tbl_book where book_subcatid=${subcat.subcat_id}`
      );
      console.log(books.length);
      for (const book of books) {
        const newBookRent = await BookRent.create({
          oneMonth: book.onemonthrent,
          threeMonth: book.threemonthrent,
          sixMonth: book.sixmonthrent,
          nineMonth: book.ninemonthrent,
          sellPrice: book.book_mrp - 100,
          twelveMonth: book.twelvemonthrent,
          deposit: book.book_mrp,
          mrp: book.book_mrp,
        });
        console.log(`bookid = ${book.book_code} rent created`);
        const newBook = await Book.create({
          name: book.book_name,
          author: book.book_author,
          publisher: book.book_publisher,
          edition: book.book_edition,
          quantity: 3,
          isbn: book.book_isbn,
          description: book.book_desc,
          isApproved: true,
          subCatId: newsubCat.id,
          uploader: "19c1563f-8a7e-456c-9681-6dd910e49d70",
          rentId: newBookRent.id,
        });
        console.log(`bookid = ${book.book_code} book created`);
        const bookImage = await BookImages.create({
          isCover: 1,
          url: `https://www.martolex.com/uploads/book_header_img/${book.book_image}`,
          BookId: newBook.id,
        });
        console.log(`bookid = ${book.book_code} image created`);
      }
      return newsubCat;
    });

    newCat.setSubcategories(newSubCats);
  }
});

// oldDb.query("select * from tbl_book").then((books) => {
//   console.log(books[0][0]);
// });
