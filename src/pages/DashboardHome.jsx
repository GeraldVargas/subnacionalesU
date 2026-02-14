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
  History
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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

      <div className="p-8">
        {/* Título y botones */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
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
              {/* ✅ Si "Ver votos" NO existe, lo dejo deshabilitado */}
              <button
                className="flex items-center gap-2 bg-gray-300 text-gray-500 px-6 py-2.5 rounded-lg font-medium cursor-not-allowed"
                disabled
              >
                <FileText className="w-5 h-5" />
                Reportes
              </button>

              {/* ✅ Usuarios funciona */}
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

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="USUARIOS"
            value="1"
            subtitle="Registrados"
            icon={<Users className="w-8 h-8" />}
            color="from-[#1E3A8A] to-[#152a63]"
            lightColor="from-[#1E3A8A]/10 to-[#152a63]/10"
            trend="+0%"
          />

          {/* ❌ ELIMINADO: Tarjeta ROLES */}

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
            color="from-[#1E3A8A] to-[#152a63]"
            lightColor="from-[#1E3A8A]/10 to-[#152a63]/10"
            trend="Sin datos"
          />
        </div>

        {/* Accesos rápidos y Resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Accesos rápidos */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Accesos rápidos</h2>
            <p className="text-sm text-gray-600 mb-6">Ir directo a módulos</p>

            <div className="grid grid-cols-2 gap-4">
              {/* ✅ Usuarios */}
              <QuickAccessButton
                icon={<Users className="w-6 h-6" />}
                title="Usuarios"
                subtitle="Gestión de cuentas"
                bgGradient="from-[#1E3A8A] to-[#152a63]"
                iconBg="bg-white/20"
                onClick={() => navigate('/dashboard/usuarios')}
                active={true}
              />

              {/* ❌ ELIMINADO: Roles */}

              {/* ✅ Geográfico */}
              <QuickAccessButton
                icon={<MapPin className="w-6 h-6" />}
                title="Geográfico"
                subtitle="Distritos y recintos"
                bgGradient="from-[#1E3A8A] to-[#152a63]"
                iconBg="bg-white/20"
                onClick={() => navigate('/dashboard/geografia')}
                active={true}
              />

              {/* ✅ Mesas */}
              <QuickAccessButton
                icon={<Grid3x3 className="w-6 h-6" />}
                title="Mesas"
                subtitle="Registro y control"
                bgColor="bg-pink-50"
                iconColor="text-pink-600"
                onClick={() => navigate('/dashboard/mesas')}
              />

              {/* ✅ Frentes Políticos */}
              <QuickAccessButton
                icon={<Flag className="w-6 h-6" />}
                title="Frentes"
                subtitle="Frentes políticos"
                bgColor="bg-pink-50"
                iconColor="text-pink-600"
                onClick={() => navigate('/dashboard/partidos')}
              />

              {/* ✅ Resultados en Vivo */}
              <QuickAccessButton
                icon={<BarChart3 className="w-6 h-6" />}
                title="Resultados"
                subtitle="Resultados en vivo"
                bgColor="bg-pink-50"
                iconColor="text-pink-600"
                onClick={() => navigate('/dashboard/resultados')}
              />

              {/* ✅ Digitalización */}
              <QuickAccessButton
                icon={<FileText className="w-6 h-6" />}
                title="Actas"
                subtitle="Digitalización"
                bgColor="bg-pink-50"
                iconColor="text-pink-600"
                onClick={() => navigate('/dashboard/transcripcion')}
              />

              {/* ✅ Historial */}
              <QuickAccessButton
                icon={<History className="w-6 h-6" />}
                title="Historial"
                subtitle="Historial de actas"
                bgColor="bg-pink-50"
                iconColor="text-pink-600"
                onClick={() => navigate('/dashboard/historial')}
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

          {/* Resumen */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Resumen</h2>
            <p className="text-sm text-gray-600 mb-6">Estado del sistema</p>

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

              {/* ✅ HABILITADO: Ver mesas */}
              <button
                onClick={() => navigate('/dashboard/mesas')}
                className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition group"
              >
                <div className="flex items-center gap-3">
                  <Grid3x3 className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">Ver mesas</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    FECHA
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    DETALLE
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    TOTAL
                  </th>
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
    <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
  </button>
);

export default DashboardHome;
