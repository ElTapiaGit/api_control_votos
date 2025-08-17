const mongoose = require('mongoose');

const VotoUninominalSchema = new mongoose.Schema({
    mesa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mesa',
        required: true,
        index: { unique: true }
    },
    votos: {
        AP: { type: Number, default: 0 },
        ADN: { type: Number, default: 0 },
        SUMATE: { type: Number, default: 0 },
        LIBRE: { type: Number, default: 0 },
        FP: { type: Number, default: 0 },
        MAS_IPSP: { type: Number, default: 0 },
        MORENA: { type: Number, default: 0 },
        UNIDAD: { type: Number, default: 0 },
        PDC: { type: Number, default: 0 }
    },
    votosValidos: { type: Number, default: 0 },
    votosBlancos: { type: Number, default: 0 },
    votosNulos: { type: Number, default: 0 },
    estado: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('VotoUninominal', VotoUninominalSchema);

