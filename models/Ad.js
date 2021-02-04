'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ad = sequelize.define('Ad', {
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    video: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    tableName: 'ads'
  });
  Ad.associate = function(models) {
    // associations can be defined here
    Ad.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    Ad.belongsTo(models.Hotel, { as: 'hotel', foreignKey: 'hotelId' });
    Ad.belongsTo(models.Category, { as: 'category', foreignKey: 'categoryId' });
    Ad.belongsTo(models.Category, { as: 'subCategory', foreignKey: 'subCategoryId' });
  };
  return Ad;
};