'use strict';
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usersController');
const userController = new UserController();
const randomize = require('randomatic');

router.post('/', (req, res) => {
    //Verify that the body isn't empty
    if ((req.body.constructor === Object && Object.keys(req.body).length === 0))
        res.send("Empty body");
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
            //Find user in db with email and password
            let user = userController.getUserByCredentials(req.body["email"], req.body["password"]);
            if (user !== undefined) {
                if(user.token === undefined) {
                    //Generate user token if it wasn't defined
                    user.token = randomize('Aa0','10') + "-" + user.uid;
                    //Update user
                    userController.updateUser(user);
                }
                //Return user token
                res.set('x-user-token', user.token).status(200).send();
            }
            //Return error if user couldn't be found
            else
                res.status(401).send("User isn't in db");
        }
    }
})

router.get('/', (req, res) => {})

module.exports = router;