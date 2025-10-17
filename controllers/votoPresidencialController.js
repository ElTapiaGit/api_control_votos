const mongoose = require('mongoose');
const VotoPresidencial = require('../models/VotoPresidencial');

// Crear nuevo voto
exports.crearVoto = async (req, res) => {
    try {
        const { mesa } = req.body;

        // Verificar si ya existe un registro para esa mesa
        const existe = await VotoPresidencial.findOne({ mesa });
        if (existe) {
            return res.status(400).json({ msg: 'Ya existe un registro para esta mesa.' });
        }

        const nuevoVoto = new VotoPresidencial({ ...req.body, estado: true });
        await nuevoVoto.save();
        res.status(201).json(nuevoVoto);

    } catch (err) {
        res.status(500).json({ error: err.message});
    }
};
// Crear o actualizar voto presidencial


// Obtener todos los votos
exports.obtenerVotos = async (req, res) => {
    try {
        const votos = await VotoPresidencial.find().populate('mesa');
        res.json(votos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener voto por ID
exports.obtenerVotoPorId = async (req, res) => {
    try {
        const voto = await VotoPresidencial.findById(req.params.id).populate('mesa');
        if (!voto) return res.status(404).json({ msg: 'Voto no encontrado' });
        res.json(voto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar voto
exports.actualizarVoto = async (req, res) => {
    try {
        const voto = await VotoPresidencial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!voto) return res.status(404).json({ msg: 'Voto no encontrado' });
        res.json(voto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar voto
exports.eliminarVoto = async (req, res) => {
    try {
        const voto = await VotoPresidencial.findByIdAndDelete(req.params.id);
        if (!voto) return res.status(404).json({ msg: 'Voto no encontrado' });
        res.json({ msg: 'Voto eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/////////////////
// Obtener voto por mesa
exports.obtenerVotoPorMesa = async (req, res) => {
    try {
        const { mesaId } = req.params;

        const voto = await VotoPresidencial.findOne({ mesa: mesaId }).populate('mesa');

        if (!voto) return res.status(404).json({ msg: 'Voto no encontrado para esta mesa' });

        res.json(voto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Ver solo el estado de un voto presidencial por mesa o ID
exports.obtenerVotoeEstado = async (req, res) => {
    try {
        const voto = await VotoPresidencial.findById(req.params.id).select('estado');
        if (!voto) {
            return res.status(404).json({ msg: 'Voto no encontrado' });
        }
        res.json({ estado: voto.estado });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
/////////////////
// Obtener todos los votos con detalles de la mesa
exports.obtenerTodosVotosDetalle = async (req, res) => {
    try {
        const votos = await VotoPresidencial.find()
            .populate('mesa') // Trae toda la información de la mesa
            .sort({ createdAt: -1 }); // Opcional: ordenar por fecha de registro

        if (!votos || votos.length === 0) {
            return res.status(404).json({ msg: 'No hay votos registrados' });
        }

        // Puedes devolver la información tal cual o mapear solo campos que necesites
        const resultado = votos.map(v => ({
            id: v._id,
            mesa: v.mesa,
            votos: v.votos,
            votosValidos: v.votosValidos,
            votosBlancos: v.votosBlancos,
            votosNulos: v.votosNulos,
            estado: v.estado,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt
        }));

        res.json(resultado);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Obtener totales de votos por circunscripción
exports.obtenerTotalesPorCircunscripcion = async (req, res) => {
    try {
        const circunscripcionId = Number(req.params.circunscripcionId);

        // Agregación para sumar votos por partido solo de la circunscripción seleccionada
        const resultados = await VotoPresidencial.aggregate([
            {
                $lookup: {
                    from: "mesas",            // nombre de la colección de mesas
                    localField: "mesa",
                    foreignField: "_id",
                    as: "mesa_info"
                }
            },
            { $unwind: "$mesa_info" },
            {
                $match: {
                    "mesa_info.circunscripcion.id": circunscripcionId,
                    estado: true
                }
            },
            {
                $group: {
                    _id: null,

                    LIBRE: { $sum: { $ifNull: ["$votos.LIBRE", 0] } },
                    PDC: { $sum: { $ifNull: ["$votos.PDC", 0] } },
                    votosValidos: { $sum: { $ifNull: ["$votosValidos", 0] } },
                    votosBlancos: { $sum: { $ifNull: ["$votosBlancos", 0] } },
                    votosNulos: { $sum: { $ifNull: ["$votosNulos", 0] } }
                }
            }
        ]);

        // Si no hay votos, devolver 0 en todos los partidos
        if (!resultados || resultados.length === 0) {
            return res.json({
                AP: 0,
                LIBRE: 0,
                PDC: 0,
                votosValidos: 0,
                votosBlancos: 0,
                votosNulos: 0
            });
        }

        res.json(resultados[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};



// Método D’Hondt
function dhondt(votosTotales, escaños) {
    const cocientes = [];
    const partidos = Object.keys(votosTotales).filter(p => !['votosValidos', 'votosBlancos', 'votosNulos'].includes(p));

    // Generar lista de cocientes
    partidos.forEach(partido => {
        for (let i = 1; i <= escaños; i++) {
            cocientes.push({ partido, valor: votosTotales[partido] / i });
        }
    });

    // Ordenar de mayor a menor
    cocientes.sort((a, b) => b.valor - a.valor);

    // Inicializar asignación
    const asignados = {};
    partidos.forEach(p => asignados[p] = 0);

    // Asignar escaños
    for (let i = 0; i < escaños; i++) {
        asignados[cocientes[i].partido]++;
    }

    return asignados;
}

// Método principal
exports.obtenerTotalesVotos = async (req, res) => {
    try {
        const { circunscripcionId } = req.params; // opcional

        // Construir filtro
        let filtro = {};
        if (circunscripcionId) {
            filtro['mesa.circunscripcion.id'] = Number(circunscripcionId);
        }

        // Traer todos los votos con lean() para obtener objetos planos
        const votos = await VotoPresidencial.find(filtro).populate('mesa').lean();

        if (!votos || votos.length === 0) {
            return res.status(404).json({ msg: 'No hay votos registrados' });
        }

        // Inicializar totales
        const totales = { 
            LIBRE: 0,
            PDC: 0,
            votosValidos: 0,
            votosBlancos: 0,
            votosNulos: 0
        };

        // Sumar votos de cada mesa
        votos.forEach(voto => {
            for (let partido in totales) {
                if (['votosValidos','votosBlancos','votosNulos'].includes(partido)) {
                    totales[partido] += voto[partido] || 0;
                } else {
                    totales[partido] += voto.votos[partido] || 0;
                }
            }
        });

        // Aplicar D’Hondt para senadores y diputados
        const escañosSenadores = 4;
        const escañosDiputados = 9;

        const senadores = dhondt(totales, escañosSenadores);
        const diputados = dhondt(totales, escañosDiputados);

        res.json({ totales, senadores, diputados });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


// Obtener recintos faltantes y porcentaje de mesas registradas






