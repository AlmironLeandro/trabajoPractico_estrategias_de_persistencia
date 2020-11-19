var express = require("express");
var router = express.Router();
var models = require("../models");
var jwt = require('jsonwebtoken');

router.get("/", (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  models.user
    .findAll({
      attributes: ["id","usuario","contraseña"],
      offset : Number(req.query.offset),
      limit: Number(req.query.limit)
    })
    .then(users => res.send(users))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.user
    .create({ usuario: req.body.usuario, contraseña: req.body.contraseña })
    .then(user => res.json(jwt.sign({id:user.id}, 'my_key')))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: usuario ya existente')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

router.get("/:id", (req, res) => {
  finduser(req.params.id, {
    onSuccess: user => res.send(user),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = user =>
    user
      .update({ usuario: req.body.usuario, contraseña:req.body.contraseña }, { fields: ["usuario","contraseña"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: el usuario ingresado es existente')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    finduser(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = user =>
    user
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
      finduser(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});
const finduser = (id, { onSuccess, onNotFound, onError }) => {
  models.user
    .findOne({
      attributes: ["id", "usuario"],
      where: { id }
    })
    .then(user => (user ? onSuccess(user) : onNotFound()))
    .catch(() => onError());
};

module.exports = router;