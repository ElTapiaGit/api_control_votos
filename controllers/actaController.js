const Acta = require('../models/Acta');

exports.crearActa = async (req, res) => {
    try {
        const { mesaId, foto, observado } = req.body; //se agrego el campo observado

        if (!foto) return res.status(400).json({ msg: 'Falta la URL de la imagen del acta' });

        const existe = await Acta.findOne({ mesa: mesaId });
        if (existe) return res.status(400).json({ msg: 'Ya existe acta para esta mesa' });

        const nuevaActa = new Acta({ mesa: mesaId, foto, observado: observado ?? false, });
        await nuevaActa.save();

        res.status(201).json(nuevaActa);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

exports.obtenerActaPorMesa = async (req, res) => {
    try {
        const acta = await Acta.findOne({ mesa: req.params.mesaId }).populate('mesa');
        if (!acta) return res.status(404).json({ msg: 'Acta no encontrada para esta mesa' });
        res.json(acta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.actualizarObservado = async (req, res) => {
    try {
        const { mesaId } = req.params;
        const { observado } = req.body;

        const acta = await Acta.findOneAndUpdate(
            { mesa: mesaId },
            { observado },
            { new: true }
        );

        if (!acta) return res.status(404).json({ msg: 'Acta no encontrada' });

        res.json(acta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
