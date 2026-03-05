import { useEffect } from 'react';
import { useMovementStore } from '../store/movementStore';
import { useSupermarketStore } from '../store/supermarketStore';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const MovementHistory = () => {
    const activeSupermarketId = useSupermarketStore((state) => state.activeSupermarketId);
    
    const movements = useMovementStore((state) => state.movements);
    const isLoading = useMovementStore((state) => state.isLoading);
    const error = useMovementStore((state) => state.error);
    const fetchMovements = useMovementStore((state) => state.fetchMovements);

    useEffect(() => {
        if (activeSupermarketId) {
            fetchMovements(activeSupermarketId);
        }
    }, [activeSupermarketId, fetchMovements]);

    // Función auxiliar para renderizar el tipo de movimiento con colores
    const renderMovementBadge = (type: string) => {
        switch (type) {
            case 'IN':
                return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">ENTRADA</span>;
            case 'OUT':
                return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">SALIDA</span>;
            default:
                return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">AJUSTE</span>;
        }
    };

    if (isLoading && movements.length === 0) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando historial de movimientos...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500 font-semibold">Error: Sesion Expirada</div>;
    }

    return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {/* Ícono actualizado a rose-600 */}
                    <ArrowsRightLeftIcon className="h-6 w-6 text-rose-600" />
                    Historial de Movimientos
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Auditoría de entradas y salidas de inventario en tiempo real.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Fecha y Hora</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4 text-center">Cantidad</th>
                                <th className="px-6 py-4 text-center">Stock Resultante</th>
                                <th className="px-6 py-4">Descripción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {movements.length > 0 ? (
                                movements.map((mov) => (
                                    <tr key={mov._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            <div className="font-medium text-gray-900">
                                                {new Date(mov.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs">
                                                {new Date(mov.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {mov.product ? (
                                                <>
                                                    <div className="font-bold text-gray-900">{mov.product.name}</div>
                                                    <div className="text-xs text-gray-400">SKU: {mov.product.sku}</div>
                                                </>
                                            ) : (
                                                <span className="text-red-400 italic">Producto eliminado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderMovementBadge(mov.type)}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-900">
                                            {mov.type === 'IN' ? '+' : mov.type === 'OUT' ? '-' : ''}{mov.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-gray-400 line-through text-xs mr-2">{mov.previousStock}</span>
                                            {/* Nuevo stock en rose-600 en lugar de azul */}
                                            <span className="font-bold text-rose-600">{mov.newStock}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-xs">
                                            {mov.description}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        No hay movimientos registrados para esta sucursal.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MovementHistory;