const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
const { Types } = mongoose;
const Long = Types.Long;

const MesaSchema = new mongoose.Schema({
    codigoMesa: { type: Number, required: true, unique: true },//300001
    numMesa: { type: Long, required: true, unique: true },//Codigo de barra
    numeroMesa:  { type: Number, required: true, },//mesa 1

    pais: {
        id: Number,
        nombre: String
    },
    departamento: {
        id: Number,
        nombre: String
    },
    provincia: {
        id: Number,
        nombre: String
    },
    circunscripcion: {
        id: Number,
        nombre: String
    },
    municipio: {
        id: Number,
        nombre: String
    },
    localidad: {
        id: Number,
        nombre: String
    },
    distrito: {
        id: Number,
        nombre: String
    },
    zona: {
        id: Number,
        nombre: String
    },
    recinto: {
        id: Number,
        nombre: String
    }
});

module.exports = mongoose.model('Mesa', MesaSchema);
