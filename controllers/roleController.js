const Role = require('../models/role');

// Crear rol (solo para el Administrador)
exports.createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        // Verificar si el rol ya existe
        const roleExists = await Role.findOne({ name });
        if (roleExists) return res.status(400).json({ message: 'El rol ya existe' });

        const role = new Role({ name, permissions });
        await role.save();
        res.status(201).json({ message: 'Rol creado', role });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Listar roles
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.json({ roles });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Actualizar rol (si es necesario)
exports.updateRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const updateData = req.body;
        const updatedRole = await Role.findByIdAndUpdate(roleId, updateData, { new: true });
        res.json({ message: 'Rol actualizado', updatedRole });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Eliminar rol
exports.deleteRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        await Role.findByIdAndDelete(roleId);
        res.json({ message: 'Rol eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
