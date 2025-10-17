const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nombres: { type: String, required: true },
    cedulaIdentidad: { type: String, required: true },
    rol: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, {
    toJSON: { virtuals: true }, // Incluye virtuales
    toObject: { virtuals: true } // Incluye virtuales
});



// Resto del código (pre-save y comparePassword)...
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('Users', UserSchema);
