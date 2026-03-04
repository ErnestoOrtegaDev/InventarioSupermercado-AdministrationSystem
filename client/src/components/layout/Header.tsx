/* src/components/layout/Header.tsx */

import { useAuthStore } from '../../store/authStore';
import NotificationBell from './NotificationBell';

export const Header = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
            {/* Barra de Búsqueda Global (Visual por ahora) */}
            <div className="relative w-96">
            </div>

            {/* Perfil y Notificaciones */}
            <div className="flex items-center gap-6">
                <NotificationBell />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    {/* Avatar con iniciales */}
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
                        {user?.firstName?.charAt(0)}
                    </div>
                </div>
            </div>
        </header>
    );
};