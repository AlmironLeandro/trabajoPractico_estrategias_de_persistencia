'use strict';
module.exports = (sequelize, DataTypes) => {
  const alumno = sequelize.define('alumno', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    id_carrera: DataTypes.INTEGER
  }, {});
  alumno.associate = function(models) {
    alumno.belongsTo(models.carrera,{ 
      as: 'carrera_Anotada',  // nombre de mi relación
      foreignKey: 'id_carrera'
      })
   };
  return alumno;
};