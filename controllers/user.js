
const ErrorResponse = require('../utils/errorResponse');
const User = require("../models/user");


exports.signup = async (req, res, next) => {
    const {  email } = req.body;
    const userExist = await User.findOne({  email });

    if (userExist) {
        return next(new ErrorResponse('El correo ya existe', 400));
    }

    try {
        const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};
exports.signin = async (req, res, next) => {
    try {
        const { correo, password } = req.body;
        if (!correo || !password) {
            return next(new ErrorResponse('Se requiere correo electrónico y contraseña', 400));
        }

        const user = await User.findOne({ correo });
        if (!user) {
            return next(new ErrorResponse('Credenciales incorrectas', 401));
        }

        const isMatched = await user.comparePassword(password);
        if (!isMatched) {
            return next(new ErrorResponse('Credenciales incorrectas', 401));
        }

        generateToken(user, 200, res);
    } catch (error) {
        next(new ErrorResponse('No se puede iniciar sesión, verifique sus credenciales', 500));
    }
};


const generateToken = async (user, statusCode, res) => {
    const token = await user.jwtGenerateToken();

    const options = {
        httpOnly: true,
        expires: new Date(Date.now() + process.env.EXPIRE_TOKEN)
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({ success: true, token });
};


//CERRAR SESIÓN DE USUARIO
exports.logout = (req, res, next)=>{
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: "Desconectado"
    })
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