/* src/components/users/UserModal.tsx */

import { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Mail, Lock, Briefcase, Store } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useSupermarketStore } from '../../store/supermarketStore';
import type { User } from '../../types';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToEdit?: User | null;
}

export const UserModal = ({ isOpen, onClose, userToEdit }: UserModalProps) => {
    const { addUser, updateUser } = useUserStore();
    // Traemos los supermercados del store para el <select>
    const { supermarkets, fetchSupermarkets } = useSupermarketStore(); 
    
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '', // Solo requerido al crear
        role: 'worker' as User['role'],
        supermarket: '', // Guardaremos el ID
        active: true
    });

    // Cargar supermercados si no los tenemos
    useEffect(() => {
        if (supermarkets.length === 0) {
            fetchSupermarkets();
        }
    }, [supermarkets.length, fetchSupermarkets]);

    // Llenar datos al abrir la modal
    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setFormData({
                    firstName: userToEdit.firstName,
                    lastName: userToEdit.lastName,
                    email: userToEdit.email,
                    password: '', // Dejamos la contraseña en blanco por seguridad al editar
                    role: userToEdit.role,
                    // Extraemos el ID si el backend lo mandó como objeto poblado (.populate)
                    supermarket: typeof userToEdit.supermarket === 'object' ? userToEdit.supermarket?._id || '' : userToEdit.supermarket || '',
                    active: userToEdit.status ?? true // Usamos status (o active dependiendo de tu modelo)
                });
            } else {
                setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'worker', supermarket: '', active: true });
            }
        }
    }, [isOpen, userToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // Limpiamos los datos a enviar
            const dataToSend: Partial<typeof formData> = { ...formData };
            
            // Si estamos editando y no escribió contraseña nueva, NO la enviamos
            if (userToEdit && !dataToSend.password) {
                delete dataToSend.password;
            }

            // Si es Admin o Provider, no enviamos supermercado
            if (dataToSend.role === 'admin' || dataToSend.role === 'provider') {
                delete dataToSend.supermarket;
            }

            if (userToEdit) {
                await updateUser(userToEdit._id, dataToSend);
            } else {
                await addUser(dataToSend);
            }
            onClose();
        } catch {
            // El error ya lo maneja SweetAlert en el Store
        } finally {
            setIsLoading(false);
        }
    };

    // ¿El rol seleccionado requiere una sucursal física?
    const requiresSupermarket = formData.role === 'manager' || formData.role === 'worker';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <UserIcon className="text-blue-600" size={24} />
                        {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                            <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="email" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña {userToEdit && <span className="text-gray-400 text-xs font-normal">(Dejar en blanco para no cambiar)</span>}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="password" required={!userToEdit} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol en el Sistema</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                                <select 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
                                    value={formData.role} 
                                    onChange={e => setFormData({...formData, role: e.target.value as User['role'], supermarket: ''})}
                                >
                                    <option value="worker">Trabajador (Worker)</option>
                                    <option value="manager">Gerente (Manager)</option>
                                    <option value="provider">Proveedor (Provider)</option>
                                    <option value="admin">Administrador (Admin)</option>
                                </select>
                            </div>
                        </div>

                        {/* Selector Dinámico de Supermercado */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${requiresSupermarket ? 'text-gray-700' : 'text-gray-400'}`}>Asignar a Sucursal</label>
                            <div className="relative">
                                <Store className={`absolute left-3 top-3 ${requiresSupermarket ? 'text-gray-400' : 'text-gray-200'}`} size={18} />
                                <select 
                                    required={requiresSupermarket}
                                    disabled={!requiresSupermarket}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none disabled:bg-gray-100 disabled:text-gray-400"
                                    value={formData.supermarket} 
                                    onChange={e => setFormData({...formData, supermarket: e.target.value})}
                                >
                                    <option value="">{requiresSupermarket ? 'Selecciona...' : 'No aplica'}</option>
                                    {supermarkets.map(supermarket => (
                                        <option key={supermarket._id} value={supermarket._id}>{supermarket.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                            {isLoading ? 'Guardando...' : <><Save size={18} />Guardar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};