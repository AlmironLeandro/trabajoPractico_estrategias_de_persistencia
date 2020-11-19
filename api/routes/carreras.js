var express = require("express");
var router = express.Router();
var models = require("../models");
var jwt = require('jsonwebtoken');


router.get("/", (req, res) => {
  console.log("Obteniendo carreras");
  models.carrera
    .findAll({
      attributes: ["id", "nombre"],
      offset : Number(req.query.offset),
      limit: Number(req.query.limit),
      include:[{as:'Materias', model:models.materia, attributes: ["nombre"]},
      {as:'Alumnos', model:models.alumno, attributes: ["nombre","apellido"]}]
    })
    .then(carreras => res.send(carreras))
    .catch(() => res.sendStatus(500));
});

router.post("/",ensureToken, (req, res) => {
  jwt.verify(req.token, 'my_key', (err, data)=>{
    if(err){
      res.sendStatus(403)
    }
    else{
      // console.log(data)
        models.carrera
      .create({ nombre: req.body.nombre })
      .then(carrera => res.status(201).send({ nombre: carrera.nombre }))
      .catch(error => {
          if (error == "SequelizeUniqueConstraintError: Validation error") {
            res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
          }
          else {
            console.log(`Error al intentar insertar en la base de datos: ${error}`)
            res.sendStatus(500)
            
      }
    });
    }
    });
});

const findCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(carrera => (carrera ? onSuccess(carrera) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findCarrera(req.params.id, {
    onSuccess: carrera => res.send(carrera),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = carrera =>
    carrera
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = carrera =>
    carrera
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

function ensureToken(req,res,next){
  const bearerHeader = req.headers['authorization'];
  console.log(bearerHeader)
  if(typeof bearerHeader !== 'undefined'){
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1]
    req.token = bearerToken
    next(); 
  }
  else{
    res.sendStatus(403) 
  }
}
module.exports = router;
