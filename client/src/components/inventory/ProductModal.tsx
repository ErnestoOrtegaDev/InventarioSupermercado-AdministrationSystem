// src/components/inventory/ProductModal.tsx

import { useState, useEffect } from 'react';
import { X, Save, Package, Tag, DollarSign, Layers, AlertCircle, BarChart2 } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import type { Product } from '../../types';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productToEdit?: Product | null;
    supermarketId: string; // Crucial for associating the product with the correct supermarket when creating o editando
}

export const ProductModal = ({ isOpen, onClose, productToEdit, supermarketId }: ProductModalProps) => {
    const { addProduct, updateProduct } = useProductStore();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'General',
        price: '',
        stock: '',
        minStock: '10', // Value for new products, but will be overridden when editing
        active: true
    });

    // Effect for initializing form data when the modal opens or when the product to edit changes
    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setFormData({
                    name: productToEdit.name,
                    sku: productToEdit.sku,
                    category: productToEdit.category || 'General',
                    price: productToEdit.price.toString(),
                    stock: productToEdit.stock.toString(),
                    minStock: productToEdit.minStock.toString(),
                    active: productToEdit.active
                });
            } else {
                setFormData({
                    name: '', sku: '', category: 'General', price: '', stock: '', minStock: '10', active: true
                });
            }
        }
    }, [isOpen, productToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // Take strings from formData and convert to correct types for API
            const payload = {
                name: formData.name,
                sku: formData.sku,
                category: formData.category,
                price: Number(formData.price),
                stock: Number(formData.stock),
                minStock: Number(formData.minStock),
                active: formData.active,
                supermarket: supermarketId // Always include supermarketId to ensure correct association, whether creating or editing
            };

            if (productToEdit) {
                await updateProduct(productToEdit._id, payload);
            } else {
                await addProduct(payload);
            }
            onClose();
        } catch {
            // The error handling is done in the store, so we don't need to do anything here. The user will see a toast notification if something goes wrong.
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-rose-600" size={24} />
                        {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Row 1: Name and SKU */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                            <input 
                                type="text" required
                                placeholder="Ej. Coca-Cola 600ml"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Código (SKU)</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input 
                                    type="text" required
                                    placeholder="Ej. 75010553"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none uppercase"
                                    value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Category and Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <div className="relative">
                                <Layers className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <select 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none appearance-none bg-white"
                                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="General">General</option>
                                    <option value="Abarrotes">Abarrotes</option>
                                    <option value="Bebidas">Bebidas</option>
                                    <option value="Lácteos">Lácteos</option>
                                    <option value="Limpieza">Limpieza</option>
                                    <option value="Carnes">Carnes</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input 
                                    type="number" required min="0" step="0.01"
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none"
                                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Actual Stock and Minimum Stock */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <BarChart2 size={16} className="text-rose-600" /> Stock Actual
                            </label>
                            <input 
                                type="number" required min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none"
                                value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <AlertCircle size={16} className="text-orange-500" /> Stock Mínimo (Alerta)
                            </label>
                            <input 
                                type="number" required min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Checkbox of State  */}
                    {productToEdit && (
                        <div className="flex items-center gap-2 mt-2">
                            <input 
                                type="checkbox" id="activeProduct"
                                checked={formData.active}
                                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                className="w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-600"
                            />
                            <label htmlFor="activeProduct" className="text-sm text-gray-700 font-medium">
                                Producto Activo (Visible en sistema)
                            </label>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-medium shadow-md transition-all flex items-center justify-center gap-2">
                            {isLoading ? 'Guardando...' : <><Save size={18} /> Guardar</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};