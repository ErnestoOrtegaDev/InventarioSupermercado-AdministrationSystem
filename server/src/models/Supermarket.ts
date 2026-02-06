import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISupermarket extends Document {
    name: string;
    address: string;
    phone?: string;
    image?: string; 
    active: boolean;
    createdBy: Types.ObjectId; 
}

const SupermarketSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del supermercado es obligatorio'],
        trim: true,
        unique: true
    },
    address: {
        type: String,
        required: [true, 'La dirección es obligatoria']
    },
    phone: {
        type: String
    },
    image: {
        type: String,
        default: 'default-store.jpg'
    },
    active: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Relación con la colección de Usuarios
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model<ISupermarket>('Supermarket', SupermarketSchema);