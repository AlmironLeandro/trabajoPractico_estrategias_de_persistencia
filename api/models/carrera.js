'use strict';
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define('carrera', {
    nombre: DataTypes.STRING,
  }, {});
  carrera.associate = function (models){
    carrera.hasMany(models.materia,{
        as: "Materias",
        foreignKey: 'id_carrera'
      })
      ,
    carrera.hasMany(models.alumno,{
         as: "Alumnos",
         foreignKey: 'id_carrera'
          })
  };
  return carrera;
};