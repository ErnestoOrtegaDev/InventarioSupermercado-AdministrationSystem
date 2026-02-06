import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Definimos la interfaz de TypeScript (Tipado fuerte)
export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: 'admin' | 'worker' | 'provider'; 
    status: boolean; 
    googleId?: string;
    //Soft Delete
    deleteDate?: Date; 
    // Tokens para recuperar contraseña (Requerimiento de "Olvidar Contraseña")
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
}

//Definimos el Esquema de Mongoose
const UserSchema: Schema = new Schema({
    firstName: { 
        type: String, 
        required: [true, 'El nombre es obligatorio'], 
        trim: true 
    },
    lastName: { 
        type: String, 
        required: [true, 'El apellido es obligatorio'], 
        trim: true 
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function(this: IUser) { return !this.googleId }, 
        minlength: 6,
        select: false 
    },
    role: {
        type: String,
        enum: ['admin', 'worker', 'provider'],
        default: 'worker'
    },
    status: {
        type: Boolean,
        default: true
    },
    googleId: { type: String },
    deleteDate: { type: Date, default: null },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true, 
    versionKey: false
});

// Middleware (Hook) Pre-Save: Encriptar contraseña antes de guardar
UserSchema.pre<IUser>('save', async function (this: IUser) {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas (Login)
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);