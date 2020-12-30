const mutations = {
  async login(parent, { email, password }, { dataSources }) {
    const { profile, token } = await dataSources.authAPI.signIn(
      email,
      password
    );
    return { token, profile };
  },
  async adminLogin(parent, { email, password }) {
    const { profile, token } = await dataSources.authAPI.signIn(
      email,
      password,
      dataSources.authAPI.scopes.ADMIN
    );
    return { token, profile };
  },
  async ambassadorLogin(parent, { email, password }) {
    const { profile, token } = await dataSources.authAPI.signIn(
      email,
      password,
      dataSources.authAPI.scopes.AMBASSADOR
    );
    return { token, profile };
  },
};

module.exports = mutations;
