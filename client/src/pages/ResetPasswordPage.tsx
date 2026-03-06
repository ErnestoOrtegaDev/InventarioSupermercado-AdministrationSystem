/* src/pages/ResetPasswordPage.tsx */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Lock, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import type { AxiosError } from 'axios';

export const ResetPasswordPage = () => {
    const { token } = useParams<{ token: string }>(); // Extract the token from the URL
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            const { data } = await api.post(`/auth/reset-password/${token}`, { password });
            setMessage(data.message || 'Contraseña actualizada con éxito');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || 'El enlace ha expirado o es inválido');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden p-4">
            <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-gradient-to-br from-rose-400 to-rose-900 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-gradient-to-tl from-rose-950 via-rose-800 to-red-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 pointer-events-none"></div>

            <div className="relative w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden p-8">
                    
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-rose-800 to-rose-900 rounded-2xl shadow-lg shadow-rose-900/30 mb-5">
                            <ShieldCheck className="text-white h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Nueva Contraseña</h2>
                        <p className="text-gray-500 font-medium mt-2 text-sm">
                            Ingresa tu nueva contraseña para StockMaster.
                        </p>
                    </div>

                    {message ? (
                        <div className="text-center space-y-4 animate-fade-in">
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex flex-col items-center justify-center gap-2">
                                <CheckCircle size={32} className="text-green-500" />
                                <span className="font-bold text-lg">¡Contraseña actualizada!</span>
                                <span className="text-sm">Serás redirigido al inicio de sesión...</span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50/90 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-100 shadow-sm">
                                    <AlertCircle className="flex-shrink-0" size={18} />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block ml-1">Nueva Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="text-gray-400 group-focus-within:text-rose-700 transition-colors" size={20} />
                                    </div>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-800/20 focus:border-rose-800 outline-none transition-all placeholder-gray-400"
                                        placeholder="Mínimo 6 caracteres"
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block ml-1">Confirmar Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="text-gray-400 group-focus-within:text-rose-700 transition-colors" size={20} />
                                    </div>
                                    <input 
                                        type="password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-800/20 focus:border-rose-800 outline-none transition-all placeholder-gray-400"
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
                                        : 'bg-gradient-to-r from-rose-800 to-rose-950 hover:from-rose-700 hover:to-rose-900 shadow-lg shadow-rose-900/30 hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                {isLoading ? 'Guardando...' : 'Guardar Contraseña'}
                            </button>
                        </form>
                    )}
                    
                    {!message && (
                        <div className="mt-6 text-center">
                            <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                                Cancelar
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};