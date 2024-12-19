const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AIToken = sequelize.define("AIToken", {
    module: {
        type: DataTypes.STRING(100),
        defaultValue: '',
        primaryKey: true
    },
    access_token: { type: Sequelize.STRING(200) },
    expires_in: { type: Sequelize.INTEGER },
    refresh_token: { type: Sequelize.STRING(200) },
    session_key: { type: Sequelize.STRING(255) },
    refresh_token: { type: Sequelize.STRING(255) },
    scope: { type: Sequelize.TEXT },
    session_secret: { type: Sequelize.STRING(255) },
  });

  return AIToken;
};
