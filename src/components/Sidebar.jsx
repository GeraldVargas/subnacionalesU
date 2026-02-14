import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, UserCircle, ChevronRight } from 'lucide-react';
import { MENU_ITEMS } from '../config/navigation';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Recuperar sesion del usuario
    const user = JSON.parse(localStorage.getItem('usuario')) || {
        nombre_usuario: 'Usuario',
        rol: 'Invitado'
    };

    // Filtrar opciones de menu segun el rol
    const menuPermitido = MENU_ITEMS.filter(item => item.roles.includes(user.rol));

    // URL del backend para el logo
   
    const logoUrl = `/logongp.jpg`;

    return (
        <div className="h-screen w-72 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col shadow-xl">
            
            {/* Header Institucional */}
            <div className="relative bg-gradient-to-br from-[#1E3A8A] via-[#152a63] to-[#1E3A8A] px-6 py-8 overflow-hidden">
                {/* Patrón decorativo de fondo */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
                </div>

                {/* Logo y título */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg p-1.5 overflow-hidden">
                            <img 
                                src={logoUrl} 
                                alt="NGP Logo" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    // Fallback: mostrar iniciales si la imagen no carga
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<span class="text-[#1E3A8A] font-bold text-lg">NGP</span>';
                                }}
                            />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl tracking-tight">
                                S.E 2026
                            </h1>
                            <p className="text-white/80 text-xs font-medium">Sistema Electoral</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Perfil de Usuario */}
            <div className="px-4 py-5 border-b border-gray-200">
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#152a63] rounded-xl flex items-center justify-center shadow-md">
                            <UserCircle className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {user.nombre_usuario}
                            </p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                {user.rol}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navegación Principal */}
            <div className="flex-1 overflow-y-auto px-4 py-5">
                <div className="mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                        Navegación
                    </p>
                </div>
                
                <nav className="space-y-1.5">
                    {menuPermitido.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                                    transition-all duration-200 text-sm font-semibold
                                    group relative overflow-hidden
                                    ${isActive 
                                        ? 'bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white shadow-lg shadow-[#1E3A8A]/20 scale-[1.02]' 
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#1E3A8A]'
                                    }
                                `}
                            >
                                {/* Indicador de activo */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#F59E0B] rounded-r-full"></div>
                                )}

                                {/* Icono */}
                                <div className={`
                                    w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                                    transition-all duration-200
                                    ${isActive 
                                        ? 'bg-white/20' 
                                        : 'bg-gray-100 group-hover:bg-[#1E3A8A]/10'
                                    }
                                `}>
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-[#1E3A8A]'}`} />
                                </div>

                                {/* Texto */}
                                <span className="flex-1 text-left">
                                    {item.label}
                                </span>

                                {/* Flecha */}
                                <ChevronRight className={`
                                    w-4 h-4 transition-all duration-200
                                    ${isActive 
                                        ? 'text-white opacity-100' 
                                        : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                                    }
                                `} />
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="px-4 py-5 border-t border-gray-200 space-y-4">
                {/* Botón de Cerrar Sesión */}
                <button
                    onClick={() => {
                        localStorage.removeItem('usuario');
                        localStorage.removeItem('token');
                        navigate('/');
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 
                             bg-white border-2 border-gray-200 rounded-xl 
                             text-gray-700 hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 
                             hover:text-[#F59E0B] transition-all duration-200 
                             text-sm font-bold group shadow-sm hover:shadow-md"
                >
                    <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                    Cerrar Sesión
                </button>

                {/* Información del sistema */}
                <div className="text-center space-y-1">
                    <p className="text-xs text-gray-400 font-medium">
                        Versión 2.0.0
                    </p>
                    <p className="text-[10px] text-gray-400">
                        © 2026 NGP
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;