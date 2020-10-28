const express = require('express');
const app = express();
const UserController = require('./controllers/usersController');
const userController = new UserController();

const PORT = process.env.PORT || 3000;

//middleware para todas las rutas
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//Middleware
function authentication(req, res, next) {
    //Get x-auth-user header
    let token = req.get('x-auth-user');
    //If header is missing
    if (token === undefined) {
        res.status(401).send("Missing x-auth-user header");
    } else {
        //Get user id using the token
        let id = token.split("-")[1];
        //Get user using id
        let user = userController.getUser(parseInt(id));
        //If the token is valid proceed
        if (user !== undefined && user.token == token) {
            next();
        } else
            res.status(401).send("Invalid x-auth-user header");
    }
}

app.get('/', (req, res) => {
    res.send('Users app práctica 3');
})

app.use(express.static('public'));
// app.use(authentication);

//Router
const usersRouter = require('./routes/usersRouter');
app.use('/api/users/', usersRouter);
const loginRouter = require('./routes/loginRouter');
app.use('/api/login/', loginRouter);

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
})