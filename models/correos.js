const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema(
    {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String },
    nombre: { type: String },
    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estudiante',
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Correo', emailSchema);
