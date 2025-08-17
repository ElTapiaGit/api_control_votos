const Mesa = require('../models/mesa');
const mongoose = require("mongoose");

exports.verificarEstadoVotacion = async (req, res) => {
    try {
        const mesaId = req.params.id;

        // Buscar la mesa
        const mesa = await Mesa.findById(mesaId);
        if (!mesa) return res.status(404).json({ msg: 'Mesa no encontrada' });

        // Verificar votos presidenciales
        const votoPresi = await VotoPresidencial.findOne({ mesa: mesaId });
        const estadoPresi = votoPresi ? votoPresi.estado : false;

        // Verificar votos uninominales
        const votoUni = await VotoUninominal.findOne({ mesa: mesaId });
        const estadoUni = votoUni ? votoUni.estado : false;

        // Estado general: completo si ambos son true
        const estadoGeneral = estadoPresi && estadoUni;

        res.json({
            mesaId,
            numeroMesa: mesa.numeroMesa,
            estadoPresidencial: estadoPresi,
            estadoUninominal: estadoUni,
            estadoGeneral, // true = completado, false = pendiente
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.crearMesa = async (req, res) => {
    try {
        const nuevaMesa = new Mesa(req.body);
        await nuevaMesa.save();
        res.status(201).json(nuevaMesa);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// Listar todas las circunscripciones únicas
exports.listarCircunscripciones = async (req, res) => {
    try {
        const circunscripciones = await Mesa.distinct('circunscripcion');
        res.json(circunscripciones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.obtenerMesasCascada = async (req, res) => {
    try {
        const circunscripcionId = parseInt(req.params.id);

        // Buscamos todas las mesas de la circunscripción
        const mesas = await Mesa.find({ 'circunscripcion.id': circunscripcionId });

        const jerarquia = {};

        mesas.forEach(mesa => {
            const { _id, numeroMesa, circunscripcion, municipio, localidad, distrito, zona, recinto } = mesa;

            const circName = circunscripcion.nombre;

            if (!jerarquia[circName]) jerarquia[circName] = {};
            if (!jerarquia[circName][municipio.nombre]) jerarquia[circName][municipio.nombre] = {};
            if (!jerarquia[circName][municipio.nombre][localidad.nombre]) jerarquia[circName][municipio.nombre][localidad.nombre] = {};
            if (!jerarquia[circName][municipio.nombre][localidad.nombre][distrito.nombre]) {
                jerarquia[circName][municipio.nombre][localidad.nombre][distrito.nombre] = {};
            }
            if (!jerarquia[circName][municipio.nombre][localidad.nombre][distrito.nombre][zona.nombre]) {
                jerarquia[circName][municipio.nombre][localidad.nombre][distrito.nombre][zona.nombre] = {};
            }
            if (!jerarquia[circName][municipio.nombre][localidad.nombre][distrito.nombre][zona.nombre][recinto.nombre]) {
                jerarquia[circName][municipio.nombre][localidad.nombre][distrito.nombre][zona.nombre][recinto.nombre] = [];
            }

            jerarquia[circName][municipio.nombre][localidad.nombre][distrito.nombre][zona.nombre][recinto.nombre].push({
                _id,         // ID de la mesa
                numeroMesa   // Número de mesa (opcional)
            });
        });

        res.json(jerarquia);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};




exports.obtenerMesa1 = async (req, res) => {
    try {
        const mesa = await Mesa.findOne({ codigoMesa: req.params.codigoMesa });
        if (!mesa) return res.status(404).json({ msg: 'Mesa no encontrada' });
        res.json(mesa);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// controllers/mesaController.js
exports.obtenerMesasPaginadas = async (req, res) => {
    try {
        // Obtener los parámetros de la query (por defecto: página 1, 20 por página)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const skip = (page - 1) * limit;

        // Buscar mesas con paginación
        const mesas = await Mesa.find().skip(skip).limit(limit);

        // Obtener total de mesas para frontend
        const totalMesas = await Mesa.countDocuments();

        res.json({
            page,
            limit,
            totalPages: Math.ceil(totalMesas / limit),
            totalMesas,
            data: mesas
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMesaPorNumMesa = async (req, res) => {
    try {
        const numMesa = mongoose.Types.Long.fromString(req.params.numMesa);

        const mesa = await Mesa.findOne({ numMesa });
        if (!mesa) {
            return res.status(404).json({ message: 'Mesa no encontrada' });
        }

        res.json(mesa);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar la mesa', error });
    }
};

exports.listarMesas = async (req, res) => {
    try {
        const mesas = await Mesa.find();
        res.json(mesas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
