const mongoose = require('mongoose');

const VotoPresidencialSchema = new mongoose.Schema({
    mesa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mesa',
        required: true,
        unique: true,
        index: true
    },
    votos: {
        LIBRE: { type: Number, default: 0 },
        PDC: { type: Number, default: 0 }
    },
    votosValidos: { type: Number, default: 0 },
    votosBlancos: { type: Number, default: 0 },
    votosNulos: { type: Number, default: 0 },

    // Estado de confirmación de carga (true si fue exitosamente procesado)
    estado: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('VotoPresidencial', VotoPresidencialSchema);
