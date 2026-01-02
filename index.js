const express = require('express'); 
const connectDB = require('./src/database');
connectDB();


const app = express();
const gastosRoutes = require('./routes/gastosRoutes');
const port = process.env.PORT || 3000; 

app.use(express.json()); 
app.use('/gastos', gastosRoutes);


app.get('/', (req, res) => {
  res.send('API Funcionando correctamente');
}); 

app.listen(port, () => {
  console.log(`Servidor en funcionamiento en el puerto ${port}`);
}); 

module.exports = app;