const User = require('../models/user');
const Role = require('../models/role');

// Crear usuario (sin asignar rol; posteriormente el administrador lo asignará)
exports.createUser = async (req, res) => {
    try {
        const { nombres, cedulaIdentidad,  correo, password } = req.body;
        // Validaciones adicionales pueden ser implementadas según se requiera
        const user = new User({
            nombres,
            cedulaIdentidad,
            correo,
            password,
            rol: null // Se asignará posteriormente
        });
        await user.save();
        res.status(201).json({ message: 'Usuario creado', user });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }
        res.status(500).json({ message: err.message });
    }
};

// Listar usuarios con paginación y búsqueda
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const query = search ? {
            $or: [
                { nombres: { $regex: search, $options: 'i' } },
                { apellidoPa: { $regex: search, $options: 'i' } },
                { apellidoMa: { $regex: search, $options: 'i' } },
                { correo: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const users = await User.find(query)
            .populate('rol')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .exec();
        const count = await User.countDocuments(query);
        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Actualizar usuario, incluida la asignación o modificación de rol
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        // Si se actualiza el rol, verificar que el rol exista
        if (updateData.rol) {
            const roleExists = await Role.findById(updateData.rol);
            if (!roleExists) {
                return res.status(400).json({ message: 'El rol proporcionado no existe' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate('rol');
        res.json({ message: 'Usuario actualizado', updatedUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Eliminar usuario (se puede optar por una baja lógica en lugar de eliminar físicamente)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await User.findByIdAndDelete(userId);
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
