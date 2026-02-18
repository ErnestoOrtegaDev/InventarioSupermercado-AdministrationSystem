/* src/store/userStore.ts */ 

import { create } from 'zustand';
import api from '../api/axios';
import type { User } from '../types';
import type { AxiosError } from 'axios';
import Swal from 'sweetalert2';

interface ErrorResponse {
    message: string;
}

interface UserState {
    users: User[];
    isLoading: boolean;
    // Acciones
    fetchUsers: () => Promise<void>;
    addUser: (data: Partial<User>) => Promise<void>;
    updateUser: (id: string, data: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    users: [],
    isLoading: false,

    fetchUsers: async () => {
        set({ isLoading: true });
        try {
            // Asumimos que en tu backend existe la ruta GET /api/users
            const { data } = await api.get('/users');
            set({ users: data, isLoading: false });
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            set({ isLoading: false });
        }
    },

    addUser: async (userData) => {
        try {
            const { data } = await api.post('/users', userData);
            
            set((state) => ({ 
                users: [...state.users, data] 
            }));
            
            Swal.fire({
                icon: 'success',
                title: '¡Usuario Creado!',
                text: 'El acceso ha sido generado exitosamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error: unknown) {
            const axiosError = error as AxiosError<ErrorResponse>;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: axiosError.response?.data?.message || 'No se pudo crear el usuario'
            });
            throw error; // Lanzamos el error por si la modal necesita saber que falló
        }
    },

    updateUser: async (id, updatedData) => {
        try {
            const { data } = await api.put(`/users/${id}`, updatedData);
            
            set((state) => ({
                users: state.users.map(u => u._id === id ? data : u)
            }));

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'Los datos del usuario se han modificado.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error: unknown) {
            const axiosError = error as AxiosError<ErrorResponse>;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: axiosError.response?.data?.message || 'No se pudo actualizar el usuario'
            });
            throw error;
        }
    },

    deleteUser: async (id) => {
        const result = await Swal.fire({
            title: '¿Dar de baja al usuario?',
            text: "El usuario perderá acceso al sistema (Soft Delete).",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, dar de baja',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/users/${id}`);
                
                set((state) => ({
                    users: state.users.filter(u => u._id !== id)
                }));

                Swal.fire('¡Baja exitosa!', 'El usuario ha sido desactivado.', 'success');
            } catch (error: unknown) {
                const axiosError = error as AxiosError<ErrorResponse>;
                Swal.fire('Error', axiosError.response?.data?.message || 'No se pudo desactivar.', 'error');
            }
        }
    }
}));