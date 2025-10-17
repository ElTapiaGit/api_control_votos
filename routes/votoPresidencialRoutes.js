const express = require('express');
const router = express.Router();
const controller = require('../controllers/votoPresidencialController');

// Ruta: /api/votos-presidenciales
router.post('/votospresidenciales', controller.crearVoto);
router.get('/votospresidenciales', controller.obtenerVotos);
router.get('/votospresidenciales/:id', controller.obtenerVotoPorId);
router.put('/votospresidenciales/:id', controller.actualizarVoto);
router.delete('/votospresidenciales/:id', controller.eliminarVoto);
//
router.get('/votospresidenciales/mesa/:mesaId', controller.obtenerVotoPorMesa);

router.get('/votospresidenciales/estado/:id', controller.obtenerVotoeEstado);
/////REPORTES
// Nueva ruta para ver todos los votos con detalle
router.get('/votospresidenciales1', controller.obtenerTodosVotosDetalle);

router.get('/votospresidenciales/cir/:id', controller.obtenerTotalesPorCircunscripcion);
router.get('/votospresidenciales/totales/:circunscripcionId', controller.obtenerTotalesPorCircunscripcion);
router.get('/todos', controller.obtenerTotalesVotos);





module.exports = router;
