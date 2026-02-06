import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'

import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes'; 
import supermarketRoutes from './routes/supermarketRoutes';
import productRoutes from './routes/productRoutes';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

//Conexión a BD
connectDB();

// Middlewares
app.use(cors()); 
app.use(express.json()); 
app.use(cookieParser());

//Rutas
app.use('/api/auth', authRoutes);
app.use('/api/supermarkets', supermarketRoutes);
app.use('/api/products', productRoutes);

/* Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({
    msg: 'API REST Inventarios - Funcionando correctamente',
    version: '1.0.0'
  });
});
*/

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});