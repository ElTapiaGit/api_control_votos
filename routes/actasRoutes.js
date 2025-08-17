const express = require('express');
const router = express.Router();
const actaController = require('../controllers/actaController');

// Crear acta con URL
router.post('/acta', actaController.crearActa);

// Obtener acta por ID de mesa
router.get('/acta/:mesaId', actaController.obtenerActaPorMesa);

// Actualizar campo observado
router.put('/observado/:mesaId', actaController.actualizarObservado);

module.exports = router;
