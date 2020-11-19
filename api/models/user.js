'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    usuario: DataTypes.INTEGER,
    contraseña: DataTypes.STRING
  }, {});
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};