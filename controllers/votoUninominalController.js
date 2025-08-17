const VotoUninominal = require('../models/VotoUninominal');

// Crear nuevo voto uninominal
exports.crearVoto = async (req, res) => {
    try {
        const { mesa } = req.body;

        // Verificar si ya existe un registro para esa mesa
        const existe = await VotoUninominal.findOne({ mesa });
        if (existe) {
            return res.status(400).json({ msg: 'Ya existe un registro para esta mesa.' });
        }
        // Buscar si ya existe un registro para esa mesa
        //const votoExistente = await VotoUninominal.findOne({ mesa });

        /*if (votoExistente) {
            // Si existe, actualizarlo
            const votoActualizado = await VotoUninominal.findOneAndUpdate(
                { mesa },
                { ...req.body, estado: true },
                { new: true }
            );
            return res.status(200).json({
                mensaje: 'Voto actualizado correctamente',
                data: votoActualizado
            });
        }*/

        // Si no existe, crearlo
        const nuevoVoto = new VotoUninominal({ ...req.body, estado: true });
        await nuevoVoto.save();
        res.status(201).json(nuevoVoto);
        /*res.status(201).json({
            mensaje: 'Voto registrado correctamente',
            data: nuevoVoto
        });*/

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Obtener todos los votos
exports.obtenerVotos = async (req, res) => {
    try {
        const votos = await VotoUninominal.find().populate('mesa');
        res.json(votos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener voto por ID
exports.obtenerVotoPorId = async (req, res) => {
    try {
        const voto = await VotoUninominal.findById(req.params.id).populate('mesa');
        if (!voto) return res.status(404).json({ msg: 'Voto no encontrado' });
        res.json(voto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.obtenerVotoID = async (req, res) => {
    const { id } = req.params;

        const voto = await VotoUninominal.findById(id).populate('mesa');
        if (!voto) {
            return res.status(404).json({ msg: 'Voto no encontrado' });
        }
        res.json(voto);

};

// Actualizar voto
exports.actualizarVoto = async (req, res) => {
    try {
        const voto = await VotoUninominal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!voto) return res.status(404).json({ msg: 'Voto no encontrado' });
        res.json(voto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar voto
exports.eliminarVoto = async (req, res) => {
    try {
        const voto = await VotoUninominal.findByIdAndDelete(req.params.id);
        if (!voto) return res.status(404).json({ msg: 'Voto no encontrado' });
        res.json({ msg: 'Voto eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//REPORTES
exports.obtenerResultadosPorCircunscripcion = async (req, res) => {
    try {
        const idCircunscripcion = parseInt(req.params.id); // ej: /votospresidenciales/totales/20

        const resultados = await VotoUninominal.aggregate([
            {
                $lookup: {
                    from: 'mesas',
                    localField: 'mesa',
                    foreignField: '_id',
                    as: 'mesa'
                }
            },
            { $unwind: '$mesa' },
            {
                $match: {
                    'mesa.circunscripcion.id': idCircunscripcion
                }
            },
            {
                $group: {
                    _id: null,
                    AP: { $sum: '$votos.ALIANZA_POPULAR' },
                    ADN: { $sum: '$votos.ADN' },
                    SUMATE: { $sum: '$votos.SUMATE' },
                    LIBRE: { $sum: '$votos.LIBRE' },
                    FP: { $sum: '$votos.FP' },
                    MAS_IPSP: { $sum: '$votos.MAS_IPSP' },
                    MORENA: { $sum: '$votos.MORENA' },
                    UNIDAD: { $sum: '$votos.UNIDAD' },
                    PDC: { $sum: '$votos.PDC' },
                    votosBlancos: { $sum: '$votosBlancos' },
                    votosNulos: { $sum: '$votosNulos' },
                    votosValidos: { $sum: '$votosValidos' }
                }
            },
            {
                $project: {
                    _id: 0,
                    AP: 1,
                    ADN: 1,
                    SUMATE: 1,
                    LIBRE: 1,
                    FP: 1,
                    MAS_IPSP: 1,
                    MORENA: 1,
                    UNIDAD: 1,
                    PDC: 1,
                    votosBlancos: 1,
                    votosNulos: 1,
                    votosValidos: 1
                }
            }
        ]);

        res.json(resultados[0] || {});

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



///
// Obtener voto por mesa
exports.obtenerVotoPorMesa = async (req, res) => {
    try {
        const { mesaId } = req.params;

        const voto = await VotoUninominal.findOne({ mesa: mesaId }).populate('mesa');

        if (!voto) return res.status(404).json({ msg: 'Voto no encontrado para esta mesa' });

        res.json(voto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.obtenerVotoeEstado = async (req, res) => {
    try {
        const voto = await VotoUninominal.findById(req.params.id).select('estado');
        if (!voto) {
            return res.status(404).json({ msg: 'Voto no encontrado' });
        }
        res.json({ estado: voto.estado });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


