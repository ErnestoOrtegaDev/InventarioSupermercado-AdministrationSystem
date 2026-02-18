/* src/pages/LoginPage.tsx */

import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import type { LoginResponse } from '../types';
import type { AxiosError } from 'axios';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Petición al Backend
            const { data } = await api.post<LoginResponse>('/auth/login', { 
                email, 
                password 
            });

            console.log("RESPUESTA DEL BACKEND:", data);
            console.log("USUARIO RECIBIDO:", data.user);
            console.log("ROL DEL USUARIO:", data.user.role);

            // Guardar usuario en el Store
            login(data.user);

            // Redirigir al Dashboard
            navigate('/');
            
        } catch (err) {
            console.error(err);
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Error al iniciar sesión';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                
                {/* Encabezado */}
                <div className="bg-blue-600 p-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
                    <p className="text-blue-100">Sistema de Gestión de Inventarios</p>
                </div>

                {/* Formulario */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Mensaje de Error */}
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-200">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">Correo Electrónico</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="correo@example.com"
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    required 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all
                                ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'}
                            `}
                        >
                            {isLoading ? 'Iniciando...' : (
                                <>
                                    <LogIn size={20} />
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};