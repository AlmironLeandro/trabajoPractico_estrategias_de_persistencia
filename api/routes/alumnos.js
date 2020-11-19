var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res) => {
  console.log("Obteniendo alumnos");
  models.alumno
    .findAll({
      attributes: ["id", "nombre","apellido"],
      include:'carrera',
      offset : Number(req.query.offset),
      limit: Number(req.query.limit),
      include:[{as:'carrera_Anotada', model:models.carrera, attributes: ["id","nombre"]}]
    })
    .then(alumnos => res.send(alumnos))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.alumno
    .create({ nombre: req.body.nombre, dni:req.body.dni, apellido:req.body.apellido, id_carrera: req.body.id_carrera   })
    .then(alumno => res.status(201).send({ id: alumno.id  }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otro alumno con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findalumno = (id, { onSuccess, onNotFound, onError }) => {
  models.alumno
    .findOne({
      include:[{as:'carrera_Anotada', model:models.carrera, attributes: ["id","nombre"]}],
      attributes: ["id", "nombre","apellido"],
      where: { id }
    })
    .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findalumno(req.params.id, {
    onSuccess: alumno => res.send(alumno),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = alumno =>
    alumno
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra alumno con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findalumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = alumno =>
    alumno
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findalumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
