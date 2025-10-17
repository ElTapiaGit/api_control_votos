const express = require('express');
const router = express.Router();
const controller = require('../controllers/votoUninominalController');

// Usamos POST pero internamente verifica si actualiza o crea
router.post('/uninominal', controller.crearVoto);
router.get('/uninominal', controller.obtenerVotos);
router.get('/uninominal/:id', controller.obtenerVotoPorId);
router.get('/uninominal/id/:id', controller.obtenerVotoID);
router.put('/uninominal/:id', controller.actualizarVoto);
router.delete('/uninominal/:id', controller.eliminarVoto);
router.get('/uninominal/circunscripcion/:id', controller.obtenerResultadosPorCircunscripcion);

router.get('/uninominal/mesa/:mesaId', controller.obtenerVotoPorMesa);

router.get('/uninominal/estado/:id', controller.obtenerVotoeEstado);

module.exports = router;
