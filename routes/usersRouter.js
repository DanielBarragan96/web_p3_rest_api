'use strict';
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usersController');
const userController = new UserController();
const randomize = require('randomatic');

router.post('/', (req, res) => {
    let atributos_faltantes = "";
    //Verify that the body isn't empty
    if (req.body.constructor === Object && Object.keys(req.body).length === 0)
        res.send("Empty body");
    else {
        //Verify that all attributes are passed
        if (req.body["nombre"] == null)
            atributos_faltantes += "Falta nombre. ";
        if (req.body["apellidos"] == null)
            atributos_faltantes += "Falta apellidos. ";
        if (req.body["email"] == null)
            atributos_faltantes += "Falta email. ";
        if (req.body["password"] == null)
            atributos_faltantes += "Falta password. ";
        if (req.body["fecha"] == null)
            atributos_faltantes += "Falta fecha. ";
        if (req.body["sexo"] == null)
            atributos_faltantes += "Falta sexo. ";
        else if (req.body["sexo"] != "H" && req.body["sexo"] != "M") {
            atributos_faltantes += "Sexo inválido. ";
        }

        //If there are missing attributes, indicate with error code and missing attributes
        if (atributos_faltantes.length > 1) {
            res.status(400).send(atributos_faltantes);
        } else {
            //Verify that the user isn't in the data base
            let uniqueUser = userController.getUniqueUser(req.body["nombre"], req.body["apellidos"], req.body["email"]);
            //If the user is in the data base return error code and indicate that the user already exists
            if (uniqueUser !== undefined)
                res.status(401).send("Ese contacto ya existe");
            else {
                //Insert new user in data base
                let sentUser = req.body;
                //Validate that uid is defined
                if (sentUser.uid === undefined) {
                    sentUser.uid = userController.generateId();
                }
                //Validate that token is defined
                if (sentUser.token === undefined) {
                    sentUser.token = randomize('Aa0', '10') + "-" + sentUser.uid;
                }
                let newUser = userController.insertUser(sentUser);
                //Return success code and the new user in the body
                res.status(201).send(JSON.stringify(newUser));
            }
        }
    }
})

router.get('/', (req, res) => {
    let users = userController.getList();



    //Only return users names, last names and email, using map
    let userList = users.map((element) => {
        return {
            nombre: element.nombre,
            apellidos: element.apellidos,
            email: element.email
        };
    });
    res.status(200).send(JSON.stringify(userList));
})

module.exports = router;