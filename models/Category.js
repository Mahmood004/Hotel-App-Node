'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    tableName: 'categories'
  });
  Category.associate = function(models) {
    // associations can be defined here
    Category.hasMany(models.Ad, { foreignKey: 'categoryId' });
    Category.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    Category.belongsTo(models.Category, { as: 'category', foreignKey: 'parentId' });
  };
  return Category;
};