'use strict';
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usersController');
const userController = new UserController();
const randomize = require('randomatic');

function verification(body) {
    let atributos_faltantes = "";
    //Verify that all attributes are passed
    if (body["nombre"] == null)
        atributos_faltantes += "Falta nombre. ";
    if (body["apellidos"] == null)
        atributos_faltantes += "Falta apellidos. ";
    if (body["email"] == null)
        atributos_faltantes += "Falta email. ";
    if (body["password"] == null)
        atributos_faltantes += "Falta password. ";
    if (body["fecha"] == null)
        atributos_faltantes += "Falta fecha. ";
    if (body["uid"] == null)
        atributos_faltantes += "Falta uid. ";
    if (body["sexo"] == null)
        atributos_faltantes += "Falta sexo. ";
    else if (body["sexo"] != "H" && body["sexo"] != "M") {
        atributos_faltantes += "Sexo inválido. ";
    }
    return atributos_faltantes;
}

router.post('/', (req, res) => {
    //Verify that the body isn't empty
    if (req.body.constructor === Object && Object.keys(req.body).length === 0)
        res.send("Empty body");
    else {
        let atributos_faltantes = verification(req.body);

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

router.get('/:email', (req, res) => {
    let email = req.params.email;
    let user = userController.getUserByEmail(email);
    if (user === undefined)
        res.status(400).send("El usuario no esta en la DB");
    else
        res.status(200).send(user);
})

router.put('/:email', (req, res) => {
    let email = req.params.email;
    req.body["email"] = email;
    let atributos_faltantes = verification(req.body);
    if (atributos_faltantes.length > 1) {
        res.status(400).send(atributos_faltantes);
    } else {
        let user = userController.getUserByEmail(email);
        if (user === undefined) {
            res.status(400).send("El usuario no existe en la DB");
        } else {
            userController.updateUser(req.body);
            res.status(200).send("Usuario actualizado");
        }
    }
})

module.exports = router;