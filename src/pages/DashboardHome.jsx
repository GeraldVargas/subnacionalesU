import React from 'react';
import { Users, Shield, Vote, Grid3x3, UserCircle2, MapPin, Calendar, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('usuario')) || { nombre_usuario: 'admin', rol: 'Administrador del Sistema' };

  // Fecha y hora actual
  const now = new Date();
  const fechaHora = now.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con título y fecha */}
      <div className="bg-gray-800 text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">{fechaHora}</span>
        </div>
        <div className="flex items-center gap-3">
          <UserCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{user.nombre_usuario}</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-8">
        {/* Título y botones */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel General</h1>
              <p className="text-gray-600">Resumen rápido del sistema y accesos directos.</p>
            </div>
            <div className="flex gap-3">
              <button 
                className="flex items-center gap-2 bg-gray-300 text-gray-500 px-6 py-2.5 rounded-lg font-medium cursor-not-allowed"
                disabled
              >
                <Vote className="w-5 h-5" />
                Ver votos
              </button>
              <button 
                onClick={() => navigate('/dashboard/usuarios')}
                className="flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                <Users className="w-5 h-5" />
                Usuarios
              </button>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="USUARIOS" 
            value="1" 
            subtitle="Registrados"
            icon={<Users className="w-8 h-8" />}
            bgColor="bg-[#E31E24]"
          />
          <StatCard 
            title="ROLES" 
            value="2" 
            subtitle="Spatie"
            icon={<Shield className="w-8 h-8" />}
            bgColor="bg-yellow-500"
          />
          <StatCard 
            title="TIPOS DE ELECCIÓN" 
            value="0" 
            subtitle="Catálogo"
            icon={<Vote className="w-8 h-8" />}
            bgColor="bg-[#E31E24]"
          />
          <StatCard 
            title="MESAS" 
            value="0" 
            subtitle="Registradas"
            icon={<Grid3x3 className="w-8 h-8" />}
            bgColor="bg-yellow-500"
          />
        </div>

        {/* Sección de accesos rápidos y resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Accesos rápidos */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Accesos rápidos</h2>
            <p className="text-sm text-gray-600 mb-6">Ir directo a módulos</p>
            
            <div className="grid grid-cols-2 gap-4">
              <QuickAccessButton 
                icon={<Users className="w-6 h-6" />}
                title="Usuarios"
                subtitle="Gestionar cuentas"
                bgColor="bg-pink-50"
                iconColor="text-pink-600"
                onClick={() => navigate('/dashboard/usuarios')}
              />
              <QuickAccessButton 
                icon={<Shield className="w-6 h-6" />}
                title="Roles"
                subtitle="Permisos / perfiles"
                bgColor="bg-gray-50"
                iconColor="text-gray-400"
                disabled
              />
              <QuickAccessButton 
                icon={<Vote className="w-6 h-6" />}
                title="Tipo elección"
                subtitle="Administrar catálogo"
                bgColor="bg-gray-50"
                iconColor="text-gray-400"
                disabled
              />
              <QuickAccessButton 
                icon={<MapPin className="w-6 h-6" />}
                title="Geográfico"
                subtitle="Depto / provincia"
                bgColor="bg-pink-50"
                iconColor="text-pink-600"
                onClick={() => navigate('/dashboard/geografia')}
              />
              <QuickAccessButton 
                icon={<Grid3x3 className="w-6 h-6" />}
                title="Mesas"
                subtitle="Registro y control"
                bgColor="bg-gray-50"
                iconColor="text-gray-400"
                disabled
              />
              <QuickAccessButton 
                icon={<Vote className="w-6 h-6" />}
                title="Votos"
                subtitle="Ver y registrar"
                bgColor="bg-gray-50"
                iconColor="text-gray-400"
                disabled
              />
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Resumen</h2>
            <p className="text-sm text-gray-600 mb-6">Estado del sistema</p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Fecha / hora</span>
                <span className="text-sm font-semibold text-gray-900">{fechaHora}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Usuario</span>
                <span className="text-sm font-semibold text-gray-900">{user.nombre_usuario}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Geográfico</span>
                <span className="text-sm font-semibold text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Votos registrados</span>
                <span className="text-sm font-semibold text-gray-900">0</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-green-600">Activo</span>
                <span className="ml-auto text-xs font-semibold text-yellow-600">Admin</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => navigate('/dashboard/geografia')}
                className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition group"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">Ver geográfico</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
              <button 
                disabled
                className="w-full flex items-center justify-between bg-gray-200 px-4 py-3 rounded-lg cursor-not-allowed opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Grid3x3 className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Ver mesas</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Últimos votos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Últimos votos</h2>
              <p className="text-sm text-gray-600">Últimos registros (si aplica)</p>
            </div>
            <button 
              disabled
              className="text-gray-400 font-medium text-sm cursor-not-allowed flex items-center gap-1"
            >
              Ver todo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">FECHA</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">DETALLE</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="3" className="text-center py-8 text-gray-400 text-sm">
                    No hay votos registrados aún
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta de estadística
const StatCard = ({ title, value, subtitle, icon, bgColor }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
    <div className="flex items-start gap-4">
      <div className={`${bgColor} text-white p-3 rounded-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  </div>
);

// Componente de botón de acceso rápido
const QuickAccessButton = ({ icon, title, subtitle, bgColor, iconColor, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex items-start gap-3 p-4 rounded-lg border border-gray-200 transition group text-left ${
      disabled 
        ? 'cursor-not-allowed opacity-50' 
        : 'hover:border-gray-300 hover:shadow-sm'
    }`}
  >
    <div className={`${bgColor} ${iconColor} p-2 rounded-lg ${!disabled && 'group-hover:scale-110'} transition`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{title}</h3>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
    <ChevronRight className={`w-4 h-4 mt-1 flex-shrink-0 ${disabled ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`} />
  </button>
);

export default DashboardHome;