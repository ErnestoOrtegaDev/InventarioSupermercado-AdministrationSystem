/* src/store/supermarketStore.ts */ 

import { create } from 'zustand';
import api from '../api/axios';
import type { Supermarket } from '../types';
import type { AxiosError } from 'axios';
import Swal from 'sweetalert2'; // Importamos la librería de alertas

interface SupermarketState {
    supermarkets: Supermarket[];
    isLoading: boolean;
    // Acciones
    fetchSupermarkets: () => Promise<void>;
    addSupermarket: (data: Partial<Supermarket>) => Promise<void>;
    deleteSupermarket: (id: string) => Promise<void>;
    updateSupermarket: (id: string, data: Partial<Supermarket>) => Promise<void>;
}

export const useSupermarketStore = create<SupermarketState>((set) => ({
    supermarkets: [],
    isLoading: false,

    fetchSupermarkets: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/supermarkets');
            set({ supermarkets: data, isLoading: false });
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
        }
    },

    addSupermarket: async (newSupermarket) => {
        try {
            const { data } = await api.post('/supermarkets', newSupermarket);
            // Actualizamos el estado local agregando el nuevo super al array
            set((state) => ({ 
                supermarkets: [...state.supermarkets, data] 
            }));
            
            Swal.fire({
                icon: 'success',
                title: '¡Creado!',
                text: 'El supermercado se ha registrado correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error: unknown) {
            const axiosError = error as AxiosError<{ message: string }>;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: axiosError.response?.data?.message || 'No se pudo crear el supermercado'
            });
        }
    },

    deleteSupermarket: async (id) => {
        // Confirmación visual con SweetAlert2
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/supermarkets/${id}`);
                
                // Actualizar estado local (filtrar el eliminado)
                set((state) => ({
                    supermarkets: state.supermarkets.filter(s => s._id !== id)
                }));

                Swal.fire('¡Eliminado!', 'El supermercado ha sido desactivado.', 'success');
            } catch {
                Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
            }
        }
    },

    updateSupermarket: async (id, updatedData) => {
        try {
            // Asumimos que tu backend tiene la ruta PUT /supermarkets/:id
            const { data } = await api.put(`/supermarkets/${id}`, updatedData);
            
            // Actualizamos la tarjeta específica en el estado de React
            set((state) => ({
                supermarkets: state.supermarkets.map(s => s._id === id ? data : s)
            }));

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'El supermercado se ha modificado correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error: unknown) {
            const axiosError = error as AxiosError<{ message: string }>;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: axiosError.response?.data?.message || 'No se pudo actualizar el supermercado'
            });
        }
    }

}));