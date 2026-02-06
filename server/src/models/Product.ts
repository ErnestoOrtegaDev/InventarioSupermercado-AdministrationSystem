import mongoose, { Schema, Document, Types } from 'mongoose';

//SKU: Codigo unico para cada producto generado por empresas

export interface IProduct extends Document {
    name: string;
    sku: string; // Código de barras o identificador único
    description?: string;
    price: number;
    stock: number;     
    minStock: number;  
    image?: string;
    category?: string;
    supermarket: Types.ObjectId;
    active: boolean;
}

const ProductSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true
    },
    sku: {
        type: String,
        required: [true, 'El SKU es obligatorio'],
        uppercase: true,
        trim: true
    },
    description: { type: String },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: 0
    },
    stock: {
        type: Number,
        required: [true, 'El stock inicial es obligatorio'],
        min: 0
    },
    minStock: {
        type: Number,
        default: 10,
        min: 1
    },
    image: { type: String, default: 'default-product.jpg' },
    category: { type: String, default: 'General' },
    supermarket: {
        type: Schema.Types.ObjectId,
        ref: 'Supermarket',
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índice compuesto para evitar SKUs duplicados DENTRO del mismo supermercado
// (Dos supermercados diferentes sí pueden tener el mismo SKU de Producto)
ProductSchema.index({ sku: 1, supermarket: 1 }, { unique: true });

export default mongoose.model<IProduct>('Product', ProductSchema);