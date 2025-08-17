const User = require('../models/user');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// Función de login
exports.login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const user = await User.findOne({ correo }).populate('rol');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

        // Se agrega el nombre del rol al token para efectos de autorización
        const payload = {
            id: user._id,
            correo: user.correo,
            roleName: user.rol ? user.rol.name : null
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Función para solicitar recuperación de contraseña (Forgot Password)

exports.forgotPassword = async (req, res) => {
    try {
        const { correo } = req.body;
        const user = await User.findOne({ correo });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generar token de 8 caracteres
        const resetToken = crypto.randomBytes(4).toString('hex'); // 4 bytes => 8 caracteres en hexadecimal

        // Guardar el token y su fecha de expiración (15 minutos)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutos en milisegundos
        await user.save();

        // Configurar las opciones del correo
        const mailOptions = {
            from: '"Soporte" <crm61096@gmail.com>',
            to: user.correo,
            subject: 'Recuperación de contraseña',
            text: `Utiliza el siguiente token para cambiar su contraseña: ${resetToken}`
            // También puedes enviar HTML si lo prefieres:
            // html: `<p>Utiliza el siguiente token para cambiar su contraseña:</p><h2>${resetToken}</h2>`
        };

        // Enviar el correo de recuperación
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.json({ message: 'Correo de recuperación enviado.' });
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Función para restablecer la contraseña
exports.resetPassword = async (req, res) => {
    try {
        // Se espera recibir en el body: { token: "token_de_reset", newPassword: "nueva_contraseña" }
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'El token y la nueva contraseña son requeridos.' });
        }

        // Buscar al usuario que tenga el token y que no haya expirado
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o ha expirado.' });
        }

        // Actualizar la contraseña del usuario (el hook pre-save en el modelo se encargará de encriptarla)
        user.password = newPassword;
        // Limpiar los campos del token una vez utilizado
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Enviar correo de confirmación de cambio de contraseña
        const mailOptions = {
            from: '"Soporte" <crm61096@gmail.com>',
            to: user.correo,
            subject: 'Confirmación de cambio de contraseña',
            text: 'Su contraseña ha sido actualizada correctamente.'
            // Opcional: también puedes enviar HTML
            // html: '<p>Su contraseña ha sido actualizada <strong>correctamente</strong>.</p>'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                // Se registra el error, pero la respuesta ya se envió al cliente.
                console.error("Error al enviar el correo de confirmación:", error);
            } else {
                console.log("Correo de confirmación enviado:", info.response);
            }
        });

        return res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
