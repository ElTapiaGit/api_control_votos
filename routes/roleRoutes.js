const express = require('express');
const router = express.Router();
const { createRole, getRoles, updateRole, deleteRole } = require('../controllers/roleController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Crear rol (solo Administrador)
router.post('/roles',  createRole);

// Listar roles
router.get('/roles', isAuthenticated, getRoles);

// Actualizar rol (solo Administrador)
router.put('/roles/:roleId', isAuthenticated, isAdmin, updateRole);

// Eliminar rol (solo Administrador)
router.delete('/roles/:roleId', isAuthenticated, isAdmin, deleteRole);

module.exports = router;
