// 2) REEMPLAZA COMPLETO: src/pages/DashboardHome.jsx

import React from 'react';
import {
  Users,
  Vote,
  Grid3x3,
  UserCircle2,
  MapPin,
  Calendar,
  ChevronRight,
  CheckCircle,
  Flag,
  BarChart3,
  FileText,
  History,
  Layout,
  Shield,
  Clock,
  Activity,
  Zap,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const navigate = useNavigate();
  const user =
    JSON.parse(localStorage.getItem('usuario')) || {
      nombre_usuario: 'admin',
      rol: 'Administrador del Sistema'
    };

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
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2.5 rounded-xl">
                <Layout className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-medium text-white/80">Panel de Control</span>
                <span className="text-xs text-white/60 mx-2">•</span>
                <span className="text-sm font-medium text-white/80">{fecha}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl">
                <UserCircle2 className="w-5 h-5 text-[#F59E0B]" />
                <span className="text-sm font-semibold">{user.nombre_usuario}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl">
                <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
                <span className="text-xs text-white/80">Sistema activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Título y botones */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-[#1E3A8A] to-[#F59E0B] rounded-full"></div>
                <h1 className="text-3xl font-black text-gray-900">Panel General</h1>
              </div>
              <p className="text-gray-600 ml-4">
                Resumen ejecutivo del sistema y accesos directos
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard/usuarios')}
                className="flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#152a63] hover:to-[#0f1f4a] transition-all shadow-lg hover:shadow-xl"
              >
                <Users className="w-5 h-5" />
                Gestión de Usuarios
              </button>
            </div>
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#F59E0B] rounded-full mt-4 ml-4"></div>
        </div>

        {/* Tarjetas de estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="MÓDULOS ACTIVOS"
            value="7"
            subtitle="Disponibles"
            icon={<Layout className="w-6 h-6" />}
            bgColor="bg-[#1E3A8A]"
          />
          <StatCard
            title="USUARIOS"
            value="1"
            subtitle="Registrados"
            icon={<Users className="w-6 h-6" />}
            bgColor="bg-[#F59E0B]"
          />
          <StatCard
            title="FRENTES"
            value="0"
            subtitle="Políticos"
            icon={<Flag className="w-6 h-6" />}
            bgColor="bg-[#10B981]"
          />
          <StatCard
            title="ACTAS"
            value="0"
            subtitle="Digitalizadas"
            icon={<FileText className="w-6 h-6" />}
            bgColor="bg-[#1E3A8A]"
          />
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Accesos rápidos */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-[#F59E0B]" />
                  <h2 className="text-lg font-bold text-[#1E3A8A]">Accesos Rápidos</h2>
                </div>
                <p className="text-sm text-gray-500 ml-7">Módulos disponibles del sistema</p>
              </div>
              <div className="bg-[#1E3A8A] bg-opacity-10 px-3 py-1.5 rounded-lg">
                <Activity size={16} className="text-[#1E3A8A]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <QuickAccessButton
                icon={<Users className="w-6 h-6" />}
                title="Usuarios"
                subtitle="Gestionar cuentas"
                bgColor="bg-[#1E3A8A]"
                iconColor="text-white"
                onClick={() => navigate('/dashboard/usuarios')}
              />

              <QuickAccessButton
                icon={<MapPin className="w-6 h-6" />}
                title="Geográfico"
                subtitle="Depto / provincia"
                bgColor="bg-[#F59E0B]"
                iconColor="text-white"
                onClick={() => navigate('/dashboard/geografia')}
              />

              <QuickAccessButton
                icon={<Grid3x3 className="w-6 h-6" />}
                title="Mesas"
                subtitle="Registro y control"
                bgColor="bg-[#10B981]"
                iconColor="text-white"
                onClick={() => navigate('/dashboard/mesas')}
              />

              <QuickAccessButton
                icon={<Flag className="w-6 h-6" />}
                title="Frentes"
                subtitle="Frentes políticos"
                bgColor="bg-[#1E3A8A]"
                iconColor="text-white"
                onClick={() => navigate('/dashboard/partidos')}
              />

              <QuickAccessButton
                icon={<BarChart3 className="w-6 h-6" />}
                title="Resultados"
                subtitle="Resultados en vivo"
                bgColor="bg-[#F59E0B]"
                iconColor="text-white"
                onClick={() => navigate('/dashboard/resultados')}
              />

              <QuickAccessButton
                icon={<FileText className="w-6 h-6" />}
                title="Actas"
                subtitle="Digitalización"
                bgColor="bg-[#10B981]"
                iconColor="text-white"
                onClick={() => navigate('/dashboard/transcripcion')}
              />

              <QuickAccessButton
                icon={<History className="w-6 h-6" />}
                title="Historial"
                subtitle="Historial de actas"
                bgColor="bg-[#1E3A8A]"
                iconColor="text-white"
                onClick={() => navigate('/dashboard/historial')}
              />
            </div>

            {/* Barra de progreso */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Módulos activos</span>
                <span className="text-xs font-bold text-[#1E3A8A]">7/7 disponibles</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#F59E0B] rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          {/* Resumen del sistema */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-[#F59E0B]" fill="#F59E0B" />
                  <h2 className="text-lg font-bold text-[#1E3A8A]">Resumen del Sistema</h2>
                </div>
                <p className="text-sm text-gray-500 ml-7">Estado actual</p>
              </div>
              <div className="bg-[#F59E0B] bg-opacity-10 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-[#F59E0B]" />
              </div>
            </div>

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
                <span className="text-sm text-gray-600">Rol</span>
                <span className="text-sm font-semibold text-gray-900">{user.rol}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <div className="flex items-center gap-2 bg-[#10B981] bg-opacity-10 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span className="text-xs font-semibold text-[#10B981]">Sistema Activo</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F59E0B] bg-opacity-10 px-3 py-2 rounded-lg">
                  <Shield className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-xs font-semibold text-[#F59E0B]">Admin</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/geografia')}
                className="w-full flex items-center justify-between bg-[#1E3A8A] hover:bg-[#152a63] text-white px-4 py-3 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm font-medium">Ver geográfico</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/dashboard/mesas')}
                className="w-full flex items-center justify-between bg-[#F59E0B] hover:bg-[#e68906] text-white px-4 py-3 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <Grid3x3 className="w-5 h-5" />
                  <span className="text-sm font-medium">Ver mesas</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/dashboard/resultados')}
                className="w-full flex items-center justify-between bg-[#10B981] hover:bg-[#0e9f6e] text-white px-4 py-3 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm font-medium">Ver resultados</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Versión del sistema */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400">Sistema Electoral v2.0.0</p>
            </div>
          </div>
        </div>

        {/* Footer informativo */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#152a63] rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Estado del Sistema</h3>
                <p className="text-sm text-gray-500">Todos los módulos operativos correctamente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-600">Online</span>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <span className="text-sm text-gray-500">Última actualización: {fechaHora}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta de estadística
const StatCard = ({ title, value, subtitle, icon, bgColor }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all">
    <div className="flex items-start gap-4">
      <div className={`${bgColor} text-white p-3 rounded-xl shadow-md`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  </div>
);

// Componente de botón de acceso rápido
const QuickAccessButton = ({ icon, title, subtitle, bgColor, iconColor, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all group bg-white hover:bg-gradient-to-br hover:from-[#1E3A8A] hover:to-[#152a63]"
  >
    <div className={`${bgColor} ${iconColor} p-2.5 rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-bold text-gray-900 mb-0.5 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-xs text-gray-500 group-hover:text-white/80 transition-colors">{subtitle}</p>
    </div>
    <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
  </button>
);

export default DashboardHome;