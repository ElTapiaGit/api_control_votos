const nodemailer = require("nodemailer");
//Configuracion del correo
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "crm61096@gmail.com",
        pass: "dodpyhxogfhihros",
    },
});

transporter.verify().then(() => {
    console.log('Verificación de Gmail completada');
});

module.exports = transporter;
