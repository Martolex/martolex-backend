const { validationResult } = require("express-validator");

const errorFormatter = ({ location, param, msg }) =>
  `${location}.${param} : ${msg}`;

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req).formatWith(errorFormatter);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ code: 0, message: errors.array()[0] });
  };
};

module.exports = validate;
