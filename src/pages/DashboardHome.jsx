import React from 'react';
import { 
  Users, Shield, Vote, Grid3x3, UserCircle2, MapPin, 
  Calendar, ChevronRight, CheckCircle, BarChart3, 
  Globe, Layers, TrendingUp, Clock, Activity,
  FileText, AlertCircle, Award, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('usuario')) || { 
    nombre_usuario: 'admin', 
    rol: 'Administrador del Sistema' 
  };

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

  const fecha = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).replace(/^\w/, c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header con gradiente NGP */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white px-8 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-medium text-white/80">Panel de Control</span>
              <span className="text-xs text-white/60 ml-2">•</span>
              <span className="text-sm font-medium text-white/80 ml-2">{fecha}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <UserCircle2 className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-sm font-semibold">{user.nombre_usuario}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
              <span className="text-xs text-white/60">Sistema activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Título y acciones */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-gradient-to-b from-[#1E3A8A] to-[#F59E0B] rounded-full"></div>
                <h1 className="text-3xl font-black text-gray-900">Panel General</h1>
              </div>
              <p className="text-gray-600 ml-4">
                Resumen ejecutivo del sistema electoral y accesos directos
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-500 px-6 py-2.5 rounded-xl font-medium cursor-not-allowed opacity-50"
                disabled
              >
                <FileText className="w-5 h-5" />
                Reportes
              </button>
              <button 
                onClick={() => navigate('/dashboard/usuarios')}
                className="flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white px-6 py-2.5 rounded-xl font-medium hover:from-[#152a63] hover:to-[#0f1f4a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Users className="w-5 h-5" />
                Gestión de Usuarios
              </button>
            </div>
          </div>
          
          {/* Barra decorativa */}
          <div className="w-32 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#F59E0B] rounded-full mt-4 ml-4"></div>
        </div>

        {/* Tarjetas de estadísticas con diseño NGP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="USUARIOS ACTIVOS" 
            value="1" 
            subtitle="Total registrados"
            icon={<Users className="w-8 h-8" />}
            color="from-[#1E3A8A] to-[#152a63]"
            lightColor="from-[#1E3A8A]/10 to-[#152a63]/10"
            trend="+0%"
          />
          <StatCard 
            title="ROLES CONFIGURADOS" 
            value="2" 
            subtitle="Spatie permissions"
            icon={<Shield className="w-8 h-8" />}
            color="from-[#F59E0B] to-[#e68906]"
            lightColor="from-[#F59E0B]/10 to-[#e68906]/10"
            trend="Completado"
          />
          <StatCard 
            title="TIPOS DE ELECCIÓN" 
            value="0" 
            subtitle="Catálogo electoral"
            icon={<Target className="w-8 h-8" />}
            color="from-[#10B981] to-[#0e9f6e]"
            lightColor="from-[#10B981]/10 to-[#0e9f6e]/10"
            trend="Pendiente"
          />
          <StatCard 
            title="MESAS REGISTRADAS" 
            value="0" 
            subtitle="Habilitadas"
            icon={<Grid3x3 className="w-8 h-8" />}
            color="from-[#1E3A8A] to-[#152a63]"
            lightColor="from-[#1E3A8A]/10 to-[#152a63]/10"
            trend="Sin datos"
          />
        </div>

        {/* Grid principal - 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Accesos rápidos - Ocupa 2 columnas */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1E3A8A]">Accesos Rápidos</h2>
                <p className="text-sm text-gray-500">Módulos disponibles del sistema</p>
              </div>
              <div className="bg-[#1E3A8A] bg-opacity-10 px-3 py-1.5 rounded-lg">
                <Activity size={16} className="text-[#1E3A8A]" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <QuickAccessButton 
                icon={<Users className="w-6 h-6" />}
                title="Usuarios"
                subtitle="Gestión de cuentas"
                bgGradient="from-[#1E3A8A] to-[#152a63]"
                iconBg="bg-white/20"
                onClick={() => navigate('/dashboard/usuarios')}
                active={true}
              />
              <QuickAccessButton 
                icon={<Shield className="w-6 h-6" />}
                title="Roles"
                subtitle="Permisos y perfiles"
                bgGradient="from-[#F59E0B] to-[#e68906]"
                iconBg="bg-white/20"
                onClick={() => {}}
                active={false}
                disabled
              />
              <QuickAccessButton 
                icon={<Globe className="w-6 h-6" />}
                title="Geográfico"
                subtitle="Distritos y recintos"
                bgGradient="from-[#1E3A8A] to-[#152a63]"
                iconBg="bg-white/20"
                onClick={() => navigate('/dashboard/geografia')}
                active={true}
              />
              <QuickAccessButton 
                icon={<Grid3x3 className="w-6 h-6" />}
                title="Mesas"
                subtitle="Registro electoral"
                bgGradient="from-[#10B981] to-[#0e9f6e]"
                iconBg="bg-white/20"
                onClick={() => {}}
                active={false}
                disabled
              />
              <QuickAccessButton 
                icon={<Vote className="w-6 h-6" />}
                title="Votos"
                subtitle="Transcripción"
                bgGradient="from-[#F59E0B] to-[#e68906]"
                iconBg="bg-white/20"
                onClick={() => {}}
                active={false}
                disabled
              />
              <QuickAccessButton 
                icon={<BarChart3 className="w-6 h-6" />}
                title="Resultados"
                subtitle="En vivo"
                bgGradient="from-[#1E3A8A] to-[#152a63]"
                iconBg="bg-white/20"
                onClick={() => navigate('/dashboard/resultados')}
                active={true}
              />
            </div>

            {/* Barra de progreso general */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Progreso del sistema</span>
                <span className="text-xs font-bold text-[#1E3A8A]">2/6 módulos</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#F59E0B] rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>
          </div>

          {/* Resumen del sistema */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1E3A8A]">Resumen del Sistema</h2>
                <p className="text-sm text-gray-500">Estado actual</p>
              </div>
              <div className="bg-[#F59E0B] bg-opacity-10 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-[#F59E0B]" />
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <InfoRow 
                label="Fecha / hora" 
                value={fechaHora}
                icon={<Calendar className="w-4 h-4" />}
                color="text-[#1E3A8A]"
              />
              <InfoRow 
                label="Usuario" 
                value={user.nombre_usuario}
                icon={<UserCircle2 className="w-4 h-4" />}
                color="text-[#F59E0B]"
              />
              <InfoRow 
                label="Entidades geográficas" 
                value="0"
                icon={<MapPin className="w-4 h-4" />}
                color="text-[#10B981]"
              />
              <InfoRow 
                label="Votos registrados" 
                value="0"
                icon={<Vote className="w-4 h-4" />}
                color="text-[#1E3A8A]"
              />
              
              <div className="pt-2 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#10B981] bg-opacity-10 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span className="text-xs font-semibold text-[#10B981]">Sistema Activo</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F59E0B] bg-opacity-10 px-3 py-2 rounded-lg">
                  <Award className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-xs font-semibold text-[#F59E0B]">{user.rol}</span>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="space-y-3">
              <ActionButton 
                icon={<MapPin className="w-5 h-5" />}
                label="Ver geográfico"
                onClick={() => navigate('/dashboard/geografia')}
                color="from-[#1E3A8A] to-[#152a63]"
              />
              <ActionButton 
                icon={<BarChart3 className="w-5 h-5" />}
                label="Ver resultados"
                onClick={() => navigate('/dashboard/resultados')}
                color="from-[#F59E0B] to-[#e68906]"
              />
              <ActionButton 
                icon={<Grid3x3 className="w-5 h-5" />}
                label="Ver mesas"
                disabled
                color="from-gray-400 to-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Últimas actividades */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#1E3A8A]">Últimas Actividades</h2>
              <p className="text-sm text-gray-500">Registro de movimientos recientes</p>
            </div>
            <button 
              disabled
              className="text-[#1E3A8A] font-semibold text-sm hover:text-[#152a63] transition flex items-center gap-1 opacity-50 cursor-not-allowed"
            >
              Ver todo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-bold text-[#1E3A8A] uppercase">Fecha</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-[#1E3A8A] uppercase">Usuario</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-[#1E3A8A] uppercase">Acción</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-[#1E3A8A] uppercase">Detalle</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">No hay actividades recientes</p>
                      <p className="text-sm text-gray-400 mt-1">Las acciones se mostrarán aquí cuando ocurran</p>
                    </div>
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

// Componente de tarjeta de estadística mejorado
const StatCard = ({ title, value, subtitle, icon, color, lightColor, trend }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all group">
    <div className="flex items-start justify-between">
      <div className={`bg-gradient-to-br ${lightColor} p-3 rounded-xl`}>
        <div className={`bg-gradient-to-br ${color} text-white p-2 rounded-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
        trend === '+0%' ? 'bg-[#10B981] bg-opacity-10 text-[#10B981]' :
        trend === 'Completado' ? 'bg-[#10B981] bg-opacity-10 text-[#10B981]' :
        'bg-[#F59E0B] bg-opacity-10 text-[#F59E0B]'
      }`}>
        {trend}
      </span>
    </div>
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </div>
);

// Componente de botón de acceso rápido mejorado
const QuickAccessButton = ({ icon, title, subtitle, bgGradient, iconBg, onClick, active, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`group relative overflow-hidden rounded-xl p-4 transition-all ${
      disabled 
        ? 'cursor-not-allowed opacity-50' 
        : 'hover:shadow-xl transform hover:-translate-y-1'
    } ${active ? `bg-gradient-to-r ${bgGradient} text-white` : 'bg-gray-100 text-gray-600'}`}
  >
    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10"></div>
    <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/5 rounded-full -ml-8 -mb-8"></div>
    
    <div className="flex items-start gap-3 relative z-10">
      <div className={`${iconBg} p-2 rounded-lg ${!disabled && 'group-hover:scale-110'} transition`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-bold mb-0.5 ${active ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>
          {subtitle}
        </p>
      </div>
      <ChevronRight className={`w-4 h-4 mt-1 flex-shrink-0 ${
        active ? 'text-white' : 'text-gray-400'
      } group-hover:translate-x-1 transition-transform`} />
    </div>
  </button>
);

// Componente de fila de información
const InfoRow = ({ label, value, icon, color }) => (
  <div className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition">
    <div className="flex items-center gap-2">
      <div className={`${color} bg-opacity-10 p-1.5 rounded-lg`}>
        {icon}
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

// Componente de botón de acción
const ActionButton = ({ icon, label, onClick, disabled, color }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center justify-between bg-gradient-to-r ${color} text-white px-4 py-3 rounded-xl transition-all group ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="bg-white/20 p-1.5 rounded-lg">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
  </button>
);

export default DashboardHome;