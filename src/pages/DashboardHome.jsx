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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel General</h1>
              <p className="text-gray-600">Resumen rápido del sistema y accesos directos.</p>
            </div>
            <div className="flex gap-3">
              {/* ✅ Si "Ver votos" NO existe, lo dejo deshabilitado */}
        
              {/* ✅ Usuarios funciona */}
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
                subtitle="Gestionar cuentas"
                bgColor="bg-pink-50"
                iconColor="text-pink-600"
                onClick={() => navigate('/dashboard/usuarios')}
              />

              {/* ❌ ELIMINADO: Roles */}

              {/* ✅ Geográfico */}
              <QuickAccessButton
                icon={<MapPin className="w-6 h-6" />}
                title="Geográfico"
                subtitle="Depto / provincia"
                bgColor="bg-pink-50"
                iconColor="text-pink-600"
                onClick={() => navigate('/dashboard/geografia')}
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

        {/* Últimos votos */}
        

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
    <ChevronRight className={`w-4 h-4 mt-1 flex-shrink-0 ${disabled ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`} />
  </button>
);

export default DashboardHome;
