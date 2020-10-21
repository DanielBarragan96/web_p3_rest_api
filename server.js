const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

//middleware para todas las rutas
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//Middleware
function log(req, res, next) {
    console.log(`${req.method} ${req.originalUrl}: ${new Date(Date.now()).toString()}`);
    //obtener algún header
    console.log("Content-Type", req.get('Content-Type'));
    next(); //ejecuta la siguiente función 
}

app.get('/', (req, res) => {
    res.send('Users app práctica 3');
})

app.use(log);

//Router
const usersRouter = require('./routes/usersRouter');
app.use('/api/users/', usersRouter);

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})
