// src/pages/UsersPage.tsx
import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { Plus, Edit, Trash2, User as  Store } from 'lucide-react';
import { UserModal } from '../components/users/UserModal';
import type { User } from '../types';

export const UsersPage = () => {
    const { users, fetchUsers, deleteUser, isLoading } = useUserStore();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenCreate = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    // Función para renderizar el nombre del rol bonito
    const renderRoleBadge = (role: string) => {
        const roles: Record<string, { label: string, color: string }> = {
            admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200' },
            manager: { label: 'Gerente', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            worker: { label: 'Trabajador', color: 'bg-green-100 text-green-700 border-green-200' },
            provider: { label: 'Proveedor', color: 'bg-orange-100 text-orange-700 border-orange-200' }
        };
        const r = roles[role] || { label: role, color: 'bg-gray-100 text-gray-700' };
        
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${r.color}`}>
                {r.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
                    <p className="text-gray-500">Administra los accesos y roles del sistema.</p>
                </div>
                <button 
                    onClick={handleOpenCreate} 
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} />
                    Nuevo Usuario
                </button>
            </div>

            {/* Contenedor de la Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Sucursal Asignada</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading && users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-500">No hay usuarios registrados.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        
                                        {/* Nombre y Avatar */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                                                    <span className={`text-xs font-medium ${user.status ? 'text-green-500' : 'text-red-500'}`}>
                                                        {user.status ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4">
                                            {user.email}
                                        </td>

                                        {/* Rol (Badge) */}
                                        <td className="px-6 py-4">
                                            {renderRoleBadge(user.role)}
                                        </td>

                                        {/* Supermercado */}
                                        <td className="px-6 py-4">
                                            {user.role === 'admin' || user.role === 'provider' ? (
                                                <span className="text-gray-400 italic">Global (Aplica a todos)</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Store size={16} className="text-gray-400" />
                                                    {typeof user.supermarket === 'object' 
                                                        ? user.supermarket?.name 
                                                        : <span className="text-red-400 text-xs">Sin asignar</span>
                                                    }
                                                </div>
                                            )}
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenEdit(user)}
                                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteUser(user._id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Dar de baja"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                userToEdit={userToEdit}
            />
        </div>
    );
};