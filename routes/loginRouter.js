'use strict';
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usersController');
const userController = new UserController();
const randomize = require('randomatic');

router.post('/', (req, res) => {
    if ((req.body.constructor === Object && Object.keys(req.body).length === 0))
        res.status(201).send("Sin usuario");
    else {
        let atributos_faltantes = "";
        //Verify that all attributes are passed
        if (req.body["email"] == null)
            atributos_faltantes += "Falta email. ";
        if (req.body["password"] == null)
            atributos_faltantes += "Falta password. ";

        //If there are missing attributes, indicate with error code and missing attributes
        if (atributos_faltantes.length > 1) {
            res.status(400).send(atributos_faltantes);
        } else {

        }
    }
})

router.get('/', (req, res) => {})

module.exports = router;