const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// Verificar si el usuario está autenticado
exports.isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, correo, roleName }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

// Solo para Administradores
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.roleName === 'Administrador') {
        return next();
    }
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol Administrador' });
};

// Para Administradores e Instructores
exports.isAdminOrInstructor = (req, res, next) => {
    if (req.user && (req.user.roleName === 'Administrador' || req.user.roleName === 'Instructor')) {
        return next();
    }
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol Administrador o Instructor' });
};
