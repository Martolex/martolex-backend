const { and, or, rule, shield } = require("graphql-shield");

const isAuthenticated = rule()((parent, args, { user }) => {
  return user !== null;
});
const isAdmin = rule()((_, __, { user }) => {
  return user.isAdmin;
});

const isAmbassador = rule()((_, __, { user }) => {
  return user.isAdmin;
});

const permissions = shield({});

module.exports = { permissions };
