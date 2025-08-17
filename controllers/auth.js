const User = require("../models/user");
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
///const bcrypt = require('bcrypt');
const transporter = require("../config/mailer"); // Assuming you've configured nodemailer properly in this file

function generatePassword() {
    const length =9;
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

exports.signup = async (req, res, next) => {
    const { email, fechaNacimiento } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ success: false, message: "El correo es requerido" });
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ success: false, message: "Usuario ya existe" });
        }

        // Generar una contraseña
        const generatedPassword = generatePassword();

        // Guardar usuario con contraseña generada
        const user = await User.create({ ...req.body, password: generatedPassword });

        // Configuración del correo a enviar
        const mailOptions = {
            from: '"Tu Sistema de Gestión" <crm61096@gmail.com>', // Remitente
            to: email, // Destinatario
            subject: "¡Registro exitoso en el sistema!",
            html: `
                <h1>¡Bienvenido al Sistema!</h1>
                <p>Hola, ${user.nombre || "Usuario"}:</p>
                <p>Te has registrado correctamente en nuestro sistema.</p>
                <p>Por favor, inicia sesión para completar tu perfil.</p>
                <br>
                <p>Saludos,</p>
                <p>Equipo de Soporte</p>
            `,
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        res.status(201).json({
            success: true,
            message: "Usuario registrado y correo enviado correctamente.",
            user,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};


exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorResponse('Se requiere correo electrónico y contraseña', 400));
        }

        // Find user by email
        const user = await User.findOne({ email }).select('+password'); // Include password field in query results

        if (!user) {
            return next(new ErrorResponse('Credenciales no válidas', 401)); // 401 for unauthorized
        }

        // Verify user's password
        const isMatched = await user.comparePassword(password);

        if (!isMatched) {
            return next(new ErrorResponse('Credenciales no válidas', 401)); // 401 for unauthorized
        }

        // Check if password is exactly 9 characters long
        const isPasswordExactLength = /^[a-zA-Z\d]{9}$/.test(password);

        // Generate token and send response
        generateToken(user, 200, res, isPasswordExactLength);
    } catch (error) {
        console.error(error);
        next(new ErrorResponse('No se puede iniciar sesión, verifique sus credenciales', 500));
    }
};

exports.requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return next(new ErrorResponse('Usuario no encontrado', 404));
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        // Send email with reset link
        const message = `
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Para restablecer tu contraseña, haz clic en el siguiente enlace: ${resetToken}</p>
          
        `;

        await transporter.sendMail({
            from: '"EMI" <maddison53@ethereal.email>',
            to: email,
            subject: 'Restablecimiento de contraseña',
            html: message
        });

        res.status(200).json({ success: true, message: 'Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico.' });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse('Error al solicitar restablecimiento de contraseña', 500));
    }
};



exports.resetPassword = async (req, res, next) => {
    try {
        const resetToken = req.params.token;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return next(new ErrorResponse('Token de restablecimiento de contraseña no válido o ha expirado', 400));
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Contraseña restablecida exitosamente.' });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse('Error al restablecer la contraseña', 500));
    }
};


const generateToken = async (user, statusCode, res, isPasswordExactLength) => {
    const token = await user.jwtGenerateToken();

    const options = {
        httpOnly: true,
        expires: new Date(Date.now() + process.env.EXPIRE_TOKEN)
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            nombre: user.nombre,  // Incluye el nombre de usuario en la respuesta
            role: user.role,
            email: user.email,
            message: isPasswordExactLength ? 'Cambie su contraseña por una más segura.' : ''
        });
}
//LOG OUT USER
exports.logout = (req, res, next)=>{
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: "Desconectado"
    })
}



// USESR PROFILE
exports.userProfile = async (req, res, next)=>{

    const user = await User.findById(req.user.id);
    res.status(200).json({
        sucess: true,
        user
    });
}


exports.singleUser = async (req, res, next)=>{

    try {
        const user = await User.findById(req.params.id);
        res.status(200).json({
            sucess: true,
            user
        })

    } catch (error) {
        next(error)

    }

}

exports.editRoles = async (req, res) => {
    try {
        const { userId, roles } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        user.roles = roles;
        await user.save();

        res.json({ msg: 'Roles actualizados exitosamente.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const updatedData = req.body;

        // Find and update the user by their ID
        const user = await User.findByIdAndUpdate(userId, updatedData, {
            new: true, // Return the updated document
            runValidators: true // Run Mongoose validators
        });

        if (!user) {
            return next(new ErrorResponse('Usuario no encontrado', 404));
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse('Error al actualizar el usuario', 500));
    }
};


// Método para obtener información de un usuario
exports.getUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Encuentra al usuario por su ID
        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorResponse('Usuario no encontrado', 404));
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse('Error al obtener el usuario', 500));
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        // Encuentra todos los usuarios
        const users = await User.find();

        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse('Error al obtener los usuarios', 500));
    }
};
exports.deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Encuentra y elimina al usuario por su ID
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return next(new ErrorResponse('Usuario no encontrado', 404));
        }

        res.status(200).json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse('Error al eliminar el usuario', 500));
    }
};


exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return next(new ErrorResponse('Usuario no encontrado', 404));
        }

        // Generate a temporary password
        const temporaryPassword = generatePassword();

        // Update user with temporary password
        user.password = temporaryPassword;
        await user.save();

        // Send email with the new temporary password
        const message = `
   <thead style="text-align: center; font-size: 15px;">
  <tr style="background-color: #2b4c87; color: #ffffff;">
    <th>ESCUELA MILITAR DE INGENIERIA</th>
  </tr>
  <tr style="background-color: #2b4c87; color: #ffffff;">
    <th>SISTEMA DE CRM</th>
  </tr>
</thead>
          <p>Hemos recibido una solicitud para recuperar la contraseña de tu cuenta.</p>
          <p style="font-size: 10px; font-family: Arial; text-align: center;">Tu nueva contraseña temporal es:</p>
          <p style="font-size: 20px; font-family: Arial;text-align: center; "><strong>${temporaryPassword}</strong></p>

          <p>Te recomendamos que cambies esta contraseña tan pronto como te conectes.</p>
        `;

        await transporter.sendMail({
            from: '"SISTEMA DE CRM" <maddison53@ethereal.email>',
            to: user.email,
            subject: 'Recuperación de contraseña',
            html: message
        });

        res.status(200).json({ success: true, message: 'Se ha enviado una nueva contraseña temporal a tu correo electrónico.' });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse('Error al recuperar la contraseña', 500));
    }
};
