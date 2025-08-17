const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { isAuthenticated, isAdminOrInstructor } = require('../middleware/auth');

// Crear usuario (público o se podría proteger según la lógica de negocio)
router.post('/usuarios', createUser);

// Listar usuarios con paginación y búsqueda (acceso para Administrador e Instructor)
router.get('/usuarios',  getUsers);

// Actualizar usuario (incluye asignación/edición de rol)
router.put('/usuarios/:userId', isAuthenticated, isAdminOrInstructor, updateUser);

// Eliminar usuario
router.delete('/usuarios/:userId', isAuthenticated, isAdminOrInstructor, deleteUser);

module.exports = router;
