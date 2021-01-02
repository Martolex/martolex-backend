const { gql, SchemaDirectiveVisitor } = require("apollo-server");
const { defaultFieldResolver } = require("graphql");

const hasRoles = (user) => (requiredRoles) => {
  const roles = getRoles(user);
  return requiredRoles.some((requiredRole) => roles.includes(requiredRole));
};

const authTypes = gql`
  directive @auth(requires: [Role!]!) on OBJECT | FIELD_DEFINITION

  enum Role {
    CUSTOMER
    SELLER
    AMBASSADOR
    ADMIN
    GUEST
    LOGGEDIN
  }
`;

class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type._requiredAuthRole = this.args.requires;
    console.log(type);
  }

  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRole = this.args.requires;
  }

  _hasRoles(user, requiredRoles) {
    return hasRoles(user)(requiredRoles);
  }

  ensureFieldsWrapped(objectType) {
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async (parent, args, context, info) => {
        const requiredRole =
          field._requiredAuthRole || objectType._requiredAuthRole;

        if (!requiredRole) {
          return resolve.apply(this, [parent, args, context, info]);
        }
        const { user } = context;
        if (!this._hasRoles(user, requiredRole)) {
          throw new Error(`Not Authorized to access ${fieldName}`);
        }
        return resolve.apply(this, [parent, args, context, info]);
      };
    });
  }
}

const Roles = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
  AMBASSADOR: "AMBASSADOR",
  ADMIN: "ADMIN",
  GUEST: "GUEST",
  LOGGEDIN: "LOGGEDIN",
};

const getRoles = (user) => {
  const roles = [];
  if (user) {
    roles.push(Roles.LOGGEDIN);
    if (user.isAdmin) {
      roles.push(Roles.ADMIN);
    }
    if (user.isAmbassador) {
      roles.push(Roles.AMBASSADOR);
    }
    if (user.isSeller) {
      roles.push(Roles.SELLER);
    }

    if (!user.isAdmin) {
      roles.push(Roles.CUSTOMER);
    }
  } else {
    roles.push(Roles.GUEST);
  }
  return roles;
};

const directives = {
  auth: AuthDirective,
  authorized: AuthDirective,
  authenticated: AuthDirective,
};

module.exports = { getRoles, authTypes, directives, Roles, hasRoles };
