const express = require('express');
const router = express.Router();
const { login, forgotPassword, resetPassword } = require('../controllers/authController');

// Login de usuarios (Administrador, Instructor y Alumno)
router.post('/login', login);

// Solicitud de recuperación de contraseña
router.post('/password/forgot', forgotPassword);

// Reseteo de contraseña a través de un token
router.post('/password/reset', resetPassword);

module.exports = router;
