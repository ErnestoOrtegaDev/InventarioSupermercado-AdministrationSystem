import { create } from 'zustand';
import api from '../api/axios';
import type { User } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isChecking: boolean; // Para saber si estamos verificando la sesión al inicio
    error: string | null;

    // Métodos (Actions)
    login: (user: User) => void; // Recibe el usuario ya logueado desde el componente
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>; // Verifica la cookie al recargar F5
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isChecking: true, 
    error: null,

    // Acción simple: Guardar el usuario en el estado
    login: (user: User) => {
        set({ 
            user, 
            isAuthenticated: true, 
            error: null,
            isLoading: false
        });
    },

    // Acción: Cerrar sesión (Backend + Frontend)
    logout: async () => {
        set({ isLoading: true });
        try {
            await api.post('/auth/logout');
            set({ 
                user: null, 
                isAuthenticated: false, 
                isLoading: false 
            });
        } catch (error) {
            console.error('Error al cerrar sesión', error);
            // Igual limpiamos el estado aunque falle la petición
            set({ 
                user: null, 
                isAuthenticated: false, 
                isLoading: false 
            });
        }
    },

    // Acción: Verificar sesión al recargar la página
    checkAuth: async () => {
        set({ isChecking: true });
        try {
            // Pide al backend el usuario actual basado en la cookie
            const { data } = await api.get<User>('/auth/profile');
            set({ 
                user: data, 
                isAuthenticated: true, 
                isChecking: false 
            });
        } catch {
            // Si falla, es que la cookie expiró o no existe
            set({ 
                user: null, 
                isAuthenticated: false, 
                isChecking: false 
            });
        }
    }
}));