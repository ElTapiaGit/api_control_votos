const Email = require('../models/correos');
const transporter = require("../config/mailer");


exports.sendEmail = async (req, res) => {
    try {
        const { to, subject,estudiante } = req.body;

        // Crear el objeto de correo
        const email = new Email({ to, subject,estudiante });

        // Guardar el correo en la base de datos
        await email.save();
        // Estructura HTML del correo con un banner de publicidad
        const htmlMessage = `
          const htmlMessage = \`
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #222;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        .banner {
            width: 100%;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .title {
            color: #004aad;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .content {
            font-size: 15px;
            line-height: 1.6;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 13px;
            color: #888;
        }
        .highlight {
            color: #e60000;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_Bolivia.svg/1200px-Flag_Bolivia.svg.png" class="banner" alt="Alianza Popular">
        <div class="title">ALIANZA POPULAR - SISTEMA DE CONTROL DE VOTOS</div>
        <div class="subtitle">Notificación automática del sistema</div>

        <div class="content">
            <p>Estimado/a <strong>${estudiante?.nombre || 'ciudadano/a'}</strong>,</p>
            <p>Este correo ha sido generado automáticamente para confirmar que se ha registrado información relevante en el <strong>Sistema de Control de Votos</strong> de <span class="highlight">Alianza Popular</span>.</p>
            <p>Gracias por formar parte de este proceso democrático.</p>
            <p><strong>Asunto:</strong> ${subject}</p>
        </div>

        <div class="footer">
            © ${new Date().getFullYear()} Alianza Popular | Este correo fue generado automáticamente. No responder.
        </div>
    </div>
</body>
</html>
\`;


        `;

        // Enviar el correo con estructura HTML
        await transporter.sendMail({
            from: 'crm61096@gmail.com',
            to,
            subject,
            html: htmlMessage,
        });

        res.status(200).json({ message: 'Correo enviado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al enviar el correo.' });
    }
};
exports.listAllEmails = async (req, res) => {
    try {
        // Obtener todos los correos de la base de datos
        const emails = await Email.find().populate('estudiante', '-__v');

        // Verificar si no se encontraron correos
        if (!emails || emails.length === 0) {
            return res.status(404).json({ message: 'No se encontraron correos.' });
        }

        // Devolver los correos con todos los datos del estudiante
        res.status(200).json({ emails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al obtener los correos.' });
    }
};