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
    //Get users
    const users = userController.getList();
    let userList = users;

    //Get parameters
    const name = req.query.name;
    const lastname = req.query.lastname;
    const date = req.query.date;
    let page = req.query.page;
    let limit = req.query.limit;

    //Filter by name
    if (name !== undefined)
        userList = userList.filter(element => element.nombre.toUpperCase().includes(name.toUpperCase()));
    //Filter by lastname
    if (lastname !== undefined)
        userList = userList.filter(element => element.apellidos.toUpperCase().includes(lastname.toUpperCase()));
    //Filter by date
    if (date !== undefined)
        userList = userList.filter(element => element.fecha.includes(date));

    //If page is defined
    let pageError = false;
    if (page !== undefined) {
        page = parseInt(page);
        //Default value of limit is 5
        limit = (limit === undefined) ? 5 : parseInt(limit);
        let index = (page - 1) * limit;
        if (index < userList.length) {
            //Create page of users
            let newUser = [];
            for (let offset = 0; offset < limit && (index + offset) < userList.length; offset++) {
                newUser[offset] = userList[index + offset];
            }
            userList = newUser;
        } else {
            pageError = true;
        }
    }
    //If there was an error with pagination
    if (pageError) {
        res.status(401).send("Error en paginado");
    } else {
        //Only return users names, last names and email, using map
        userList = userList.map((element) => {
            return {
                nombre: element.nombre,
                apellidos: element.apellidos,
                email: element.email,
                fecha: element.fecha
            };
        });
        res.status(200).send(JSON.stringify(userList));
    }
})

module.exports = router;