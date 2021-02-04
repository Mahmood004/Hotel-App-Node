'use strict';
module.exports = (sequelize, DataTypes) => {
  const Hotel = sequelize.define('Hotel', {
    name: DataTypes.STRING,
    logo: DataTypes.STRING,
    address: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    status: DataTypes.STRING
  }, {
    tableName: 'hotels'
  });
  Hotel.associate = function(models) {
    // associations can be defined here
    Hotel.hasMany(models.Ad, { foreignKey: 'hotelId' });
    Hotel.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  };
  return Hotel;
};