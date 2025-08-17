const express = require('express');
const router = express.Router();
const mesaController = require('../controllers/mesaController');

router.post('/mesas', mesaController.crearMesa);
router.get('/mesas', mesaController.listarMesas);
router.get('/paginadas', mesaController.obtenerMesasPaginadas);
router.get('/mesas/num/:numMesa',mesaController.getMesaPorNumMesa);
router.get('/circunscripciones', mesaController.listarCircunscripciones);
router.get('/mesas/cascada/:id', mesaController.obtenerMesasCascada);
router.get('/estado/:id', mesaController.verificarEstadoVotacion);




module.exports = router;
