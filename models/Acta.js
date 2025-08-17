const mongoose = require('mongoose');

const ActaSchema = new mongoose.Schema({
    mesa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mesa',
        required: true,
        unique: true
    },
    foto: {
        type: String,
        required: true // URL de la imagen
    },
    observado: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Acta', ActaSchema);
