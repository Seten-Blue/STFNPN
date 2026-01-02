const express = require('express');
const router = express.Router(); 
const gastosController = require('../controllers/gastosController');

// Ruta para obtener todos los gastos
router.get('/', gastosController.obtenerGastos);

// Ruta para agregar un nuevo gasto
router.post('/', gastosController.agregarGasto);

// Ruta para actualizar un gasto existente
router.put('/:id', gastosController.actualizarGasto);

// Ruta para eliminar un gasto
router.delete('/:id', gastosController.eliminarGasto);

module.exports = router;