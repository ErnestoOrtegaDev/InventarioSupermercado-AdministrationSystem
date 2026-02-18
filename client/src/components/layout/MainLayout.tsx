/* src/components/layout/MainLayout.tsx */

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar Fijo */}
            <Sidebar />

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
                <Header />
                
                {/* Aquí se inyectan las páginas hijas */}
                <main className="p-8 flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};