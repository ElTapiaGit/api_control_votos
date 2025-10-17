// middleware/verificarRoles.js

module.exports = function(rolesPermitidos) {
    return function(req, res, next) {
        // Supongamos que los roles del usuario están en req.usuario.roles
        const rolesUsuario = req.user.roles;

        // Verificar si el usuario tiene al menos uno de los roles permitidos
        const autorizado = rolesPermitidos.some(rol => rolesUsuario.includes(rol));

        if (autorizado) {
            console.log("usuario autorizado")
            // Si el usuario tiene los roles permitidos, continuar con la solicitud
            next();
        } else {
            // Si el usuario no tiene los roles permitidos, devolver un error de acceso prohibido
            return res.status(403).json({ error: 'Acceso prohibido' });
        }
    };
};
