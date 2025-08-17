const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    // Lista de permisos opcionales, por ejemplo: ['CREATE_USER', 'EDIT_USER']
    permissions: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', RoleSchema);
