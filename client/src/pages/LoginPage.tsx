/* src/pages/LoginPage.tsx */
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogIn, User, Lock, AlertCircle, PackageSearch } from 'lucide-react';
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
            const { data } = await api.post<LoginResponse>('/auth/login', { 
                email, 
                password 
            });

            login(data.user);
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
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden p-4">
            
            {/* --- Background Gradient Shapes (Blobs) --- */}
            {/* Upper Left Wine Circle */}
            <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-gradient-to-br from-rose-400 to-rose-900 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 pointer-events-none animate-pulse-slow"></div>
            
            {/* Lower Right Claret Circle */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-gradient-to-tl from-rose-950 via-rose-800 to-red-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 pointer-events-none"></div>

            {/* --- Main Container (Glassmorphism) --- */}
            <div className="relative w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                    
                    {/* Header */}
                    <div className="px-8 pt-10 pb-6 text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-rose-800 to-rose-900 rounded-2xl shadow-lg shadow-rose-900/30 mb-5">
                            <PackageSearch className="text-white h-8 w-8" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">StockMaster</h1>
                        <p className="text-rose-700 font-medium mt-1">Sistema de Gestión de Inventarios</p>
                    </div>

                    {/* Form */}
                    <div className="px-8 pb-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50/90 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-100 shadow-sm animate-fade-in">
                                    <AlertCircle className="flex-shrink-0" size={18} />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block ml-1">Correo Electrónico</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="text-gray-400 group-focus-within:text-rose-700 transition-colors" size={20} />
                                    </div>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-800/20 focus:border-rose-800 outline-none transition-all placeholder-gray-400 text-gray-800 font-medium"
                                        placeholder="joedoe@example.com"
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                {/* Flex Container for Label and Link */}
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-bold text-gray-700">Contraseña</label>
                                    <Link 
                                        to="/forgot-password" 
                                        className="text-sm font-bold text-rose-700 hover:text-rose-900 transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                                
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="text-gray-400 group-focus-within:text-rose-700 transition-colors" size={20} />
                                    </div>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-800/20 focus:border-rose-800 outline-none transition-all placeholder-gray-400 text-gray-800 font-medium"
                                        placeholder="••••••••"
                                        required 
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className={`w-full py-3.5 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300
                                    ${isLoading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-rose-800 to-rose-950 hover:from-rose-700 hover:to-rose-900 shadow-lg shadow-rose-900/30 hover:shadow-rose-900/50 hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Iniciando...
                                    </span>
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        Ingresar al Sistema
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
                
                {/* Floating small footer */}
                <p className="text-center text-sm text-gray-500 font-medium mt-6">
                    &copy; {new Date().getFullYear()} StockMaster Inc.
                </p>
            </div>
        </div>
    );
};