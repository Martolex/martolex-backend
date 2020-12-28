const sequelize = require("../../config/db");
const {
  OrderItem,
  Order,
  UserAddress,
  Book,
  User,
  ReturnPayments,
  BookRent,
  SellerData,
} = require("../../models");
const { returnStates } = require("../../utils/enums");
const { itemPrice } = require("../../utils/orderUtils");

const returnsController = {
  getActiveRequests: async (req, res) => {
    try {
      const items = await OrderItem.findAll({
        order: [["returnRequestDate", "DESC"]],
        where: { isReturned: returnStates.RETURN_REQUESTED },
        attributes: ["plan", "qty", "returnRequestDate", "returnDate", "id"],

        include: [
          {
            model: Order,
            as: "order",
            attributes: ["id", "createdAt"],
            include: [{ model: User, as: "user", attributes: ["name", "id"] }],
          },
          { model: Book, as: "book", attributes: ["name"] },
        ],
      });

      res.json({ code: 1, data: items });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  getProcessedRequests: async (req, res) => {
    try {
      const items = await OrderItem.findAll({
        order: [["returnRequestDate", "DESC"]],
        where: { isReturned: returnStates.RETURNED },
        attributes: ["plan", "qty", "returnRequestDate", "returnDate", "id"],

        include: [
          {
            model: Order,
            as: "order",
            attributes: ["id", "createdAt"],
            include: [{ model: User, as: "user", attributes: ["name", "id"] }],
          },
          { model: Book, as: "book", attributes: ["name"] },
        ],
      });

      res.json({ code: 1, data: items });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  getReturnDetails: async (req, res) => {
    try {
      const item = await OrderItem.findByPk(req.params.id, {
        include: [
          {
            model: Order,
            as: "order",
            attributes: ["id", "createdAt"],
            include: [{ model: UserAddress, as: "address" }],
          },
          {
            model: Book,
            as: "book",
            attributes: ["name", "author", "edition", "publisher", "isbn"],
          },
          {
            model: ReturnPayments,
            as: "payments",
            include: {
              model: User,
              as: "paidTo",
              attributes: ["name", "isAdmin"],
            },
          },
        ],
      });
      res.json({ code: 1, data: item });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong " });
    }
  },
  getReturnPaymentDetails: async (req, res) => {
    try {
      const item = await OrderItem.findByPk(req.params.id, {
        attributes: ["id", "plan", "qty", "rent", "deposit"],
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id"],
            include: [
              {
                model: User,
                as: "upload",
                attributes: ["name", "phoneNo", "isAdmin"],
                include: {
                  model: SellerData,
                  as: "sellerDetails",
                },
              },
            ],
          },
        ],
      });
      const returnToSeller = item.rent;
      const returnToBuyer = item.deposit;
      res.json({
        code: 1,
        data: { returnToSeller, returnToBuyer, seller: item.book.upload },
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong " });
    }
  },

  processReturnPayment: async (req, res) => {
    try {
      const result = await sequelize.transaction(async (t) => {
        const { seller, buyer } = req.body;
        const itemId = req.params.id;
        const item = await OrderItem.findByPk(itemId, {
          include: [
            {
              model: Book,
              as: "book",
              attributes: ["id"],
              include: { model: User, as: "upload", attributes: ["id"] },
            },
            {
              model: Order,
              as: "order",
              attributes: ["id"],
              include: { model: User, as: "user", attributes: ["id"] },
            },
          ],
          transaction: t,
        });
        const sellerTransaction = ReturnPayments.create(
          {
            amount: seller.amount,
            receiverType: "SELLER",
            paymentMode: seller.paymentMode,
            paymentRefId: seller.refId,
            orderItemId: itemId,
            userId: item.book.upload.id,
          },
          { transaction: t }
        );

        const buyerTransaction = ReturnPayments.create(
          {
            amount: buyer.amount,
            receiverType: "BUYER",
            paymentMode: buyer.paymentMode,
            paymentRefId: buyer.refId,
            orderItemId: itemId,
            userId: item.order.user.id,
          },
          { transaction: t }
        );

        item.isReturned = returnStates.RETURNED;
        const itemPromise = item.save({ transaction: t });

        await Promise.all([sellerTransaction, buyerTransaction, itemPromise]);
        return true;
      });
      if (result) {
        res.json({
          code: 1,
          data: { message: "Return completed successfully" },
        });
      }
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
};

module.exports = returnsController;
