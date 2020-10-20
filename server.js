const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

//middleware para todas las rutas
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));



app.get('/', (req, res) => {
    res.send('Users app práctica 3');
  })
  app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })