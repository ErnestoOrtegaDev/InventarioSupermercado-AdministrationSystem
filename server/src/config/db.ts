import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/inventario_supermercado';
        
        await mongoose.connect(dbUrl);
        
        console.log('MongoDB Conectado Exitosamente');
    } catch (error) {
        console.error('Error Crítico: No se pudo conectar a MongoDB');
        console.error(error);
        process.exit(1); 
    }
};