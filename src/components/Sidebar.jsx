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

  return (
    <aside className="w-80 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col h-full z-30 font-sans shadow-xl">
      
      {/* Encabezado Institucional con gradiente NGP */}
      <div className="h-20 flex items-center px-6 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] relative overflow-hidden">
        {/* Efecto decorativo de fondo */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute right-10 bottom-0 w-16 h-16 bg-[#F59E0B]/10 rounded-full"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-white/20">
            <span className="font-black text-lg tracking-widest text-white">S.E</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base leading-tight text-white">SISTEMA ELECTORAL</span>
            
            <span className="text-[9px] text-white/70 uppercase tracking-wider mt-1 font-medium">
              Sistema Electoral 2026
            </span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Usuario con diseño mejorado */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#152a63] flex items-center justify-center shadow-lg">
              <UserCircle size={32} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10B981] rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="font-black text-gray-900 text-base truncate" title={user.nombre_usuario}>
              {user.nombre_usuario}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F59E0B] bg-opacity-10 text-[#F59E0B] text-xs font-bold border border-[#F59E0B] border-opacity-30">
                {user.rol}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegacion Principal con diseño mejorado */}
      <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black text-[#1E3A8A] uppercase tracking-widest">
            Menú Principal
          </p>
          <div className="w-10 h-0.5 bg-gradient-to-r from-[#1E3A8A] to-[#F59E0B] rounded-full mt-2"></div>
        </div>
        
        {menuPermitido.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon; 

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl 
                  transition-all duration-200 text-sm font-medium group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white shadow-lg shadow-[#1E3A8A]/20' 
                    : 'text-gray-600 hover:bg-white hover:shadow-md hover:text-[#1E3A8A]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    p-1.5 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-[#1E3A8A] group-hover:bg-opacity-10 group-hover:text-[#1E3A8A]'
                    }
                  `}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="font-semibold">{item.label}</span>
                </div>
                
                {isActive && (
                  <ChevronRight size={16} className="text-white animate-pulse" />
                )}
              </button>
            )
        })}
      </nav>

      {/* Pie de Pagina con diseño mejorado */}
      <div className="p-6 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white">
        <button 
          onClick={() => { 
            localStorage.removeItem('usuario'); 
            localStorage.removeItem('token');
            navigate('/'); 
          }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:bg-opacity-5 hover:text-[#F59E0B] transition-all duration-200 text-sm font-bold group"
        >
          <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-300" />
          Cerrar Sesión
        </button>
        
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></div>
            <p className="text-[10px] text-gray-400 font-medium">Sistema Activo</p>
          </div>
          <p className="text-[10px] text-gray-400 font-medium">v2.0.0</p>
        </div>

        {/* Sello de calidad */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[8px] text-gray-300 text-center uppercase tracking-wider">
            © 2026 NGP - Todos los derechos reservados
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;