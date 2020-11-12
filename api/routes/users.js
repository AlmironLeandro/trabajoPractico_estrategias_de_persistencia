var express = require("express");
var router = express.Router();
var models = require("../models");

router.post("/", (req, res) => {
  models.user
    .create({ user: req.body.user, password: req.body.password })
    .then(user => res.status(201).send({ id: user.id}))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra user con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

module.exports = router;
