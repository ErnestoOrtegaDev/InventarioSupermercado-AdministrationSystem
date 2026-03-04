import { create } from 'zustand';
import api from '../api/axios';

// Definimos la interfaz de lo que recibimos del backend
export interface Movement {
    _id: string;
    product: {
        _id: string;
        name: string;
        sku: string;
    } | null; // null por si el producto fue eliminado después
    supermarket: string;
    type: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    previousStock: number;
    newStock: number;
    description: string;
    createdAt: string;
}

interface MovementState {
    movements: Movement[];
    isLoading: boolean;
    error: string | null;
    fetchMovements: (supermarketId: string) => Promise<void>;
}

export const useMovementStore = create<MovementState>((set) => ({
    movements: [],
    isLoading: false,
    error: null,

    fetchMovements: async (supermarketId: string) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get(`/movements/supermarket/${supermarketId}`);
            set({ movements: data, isLoading: false });
        } catch (error: unknown) {
            console.error('[Error fetching movements]:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Error al cargar el historial', 
                isLoading: false 
            });
        }
    }
}));