import React, { useEffect } from 'react';
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
  Star,
  Map
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('usuario')) || {
    nombre_usuario: 'admin',
    rol: 'Administrador del Sistema'
  };

  // Redireccionar delegados a MiMesa y jefes a MiRecinto
  useEffect(() => {
    if (user.id_rol === 3) {
      navigate('/dashboard/mi-mesa', { replace: true });
    } else if (user.id_rol === 4) {
      navigate('/dashboard/mi-recinto', { replace: true });
    }
  }, [navigate, user.id_rol]);

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

  // Determinar qué contenido mostrar según el rol (usando id_rol para confiabilidad)
  const isAdmin = user.id_rol === 1;
  const isOperador = user.id_rol === 2;
  const isDelegado = user.id_rol === 3;
  const isJefe = user.id_rol === 4;

  // Debug logging
  console.log('=== Dashboard Debug ===');
  console.log('Usuario objeto:', user);
  console.log('ID Rol:', user.id_rol);
  console.log('Nombre Rol:', user.rol);
  console.log('isAdmin (id_rol===1):', isAdmin);
  console.log('isOperador (id_rol===2):', isOperador);
  console.log('isDelegado (id_rol===3):', isDelegado);
  console.log('isJefe (id_rol===4):', isJefe);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header con gradiente NGP */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="bg-white/10 p-2.5 rounded-xl">
                <Layout className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-white/80">Panel de Control</span>
                <span className="text-xs text-white/60 mx-1 sm:mx-2">•</span>
                <span className="text-xs sm:text-sm font-medium text-white/80">{fecha}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-2 sm:px-4 py-1 sm:py-2 rounded-xl">
                <UserCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" />
                <span className="text-xs sm:text-sm font-semibold hidden sm:inline">{user.nombre_usuario}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-2 sm:px-3 py-1 sm:py-2 rounded-xl">
                <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
                <span className="text-xs text-white/80 hidden sm:inline">Sistema activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Título y botones */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-1.5 h-6 sm:h-8 bg-gradient-to-b from-[#1E3A8A] to-[#F59E0B] rounded-full"></div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">
                  {isAdmin && 'Panel de Administración'}
                  {isOperador && 'Panel de Operador'}
                  {isDelegado && 'Mi Mesa Electoral'}
                  {isJefe && 'Mi Recinto Electoral'}
                </h1>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 ml-3 sm:ml-4">
                {isAdmin && 'Acceso total a todos los módulos del sistema'}
                {isOperador && 'Digitalización y registro de actas'}
                {isDelegado && 'Gestión y control de votos de su mesa asignada'}
                {isJefe && 'Gestión y control de votos de su recinto asignado'}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => navigate('/dashboard/usuarios')}
                className="flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#152a63] hover:to-[#0f1f4a] transition-all shadow-lg hover:shadow-xl"
              >
                <Users className="w-5 h-5" />
                Gestión de Usuarios
              </button>
            )}
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#F59E0B] rounded-full mt-4 ml-4"></div>
        </div>

        {/* ============================================
           DASHBOARD ADMINISTRADOR
           ============================================*/}
        {isAdmin && (
          <>
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
                      <h2 className="text-lg font-bold text-[#1E3A8A]">Sistema</h2>
                    </div>
                    <p className="text-sm text-gray-500 ml-7">Estado actual</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hora</span>
                    <span className="text-sm font-semibold text-gray-900">{fechaHora}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Usuario</span>
                    <span className="text-sm font-semibold text-gray-900">{user.nombre_usuario}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rol</span>
                    <span className="text-sm font-semibold text-gray-900">Administrador</span>
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

                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-400">Sistema Electoral v2.0.0</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================
           DASHBOARD OPERADOR
           ============================================*/}
        {isOperador && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-[#10B981]" />
                    <h2 className="text-lg font-bold text-[#1E3A8A]">Funciones Disponibles</h2>
                  </div>
                  <p className="text-sm text-gray-500 ml-7">Módulos según tu rol</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <QuickAccessButton
                  icon={<FileText className="w-6 h-6" />}
                  title="Digitalizar Actas"
                  subtitle="Registrar nuevas actas de votación"
                  bgColor="bg-[#10B981]"
                  iconColor="text-white"
                  onClick={() => navigate('/dashboard/transcripcion')}
                />

                <QuickAccessButton
                  icon={<BarChart3 className="w-6 h-6" />}
                  title="Ver Resultados"
                  subtitle="Consultar resultados en vivo"
                  bgColor="bg-[#1E3A8A]"
                  iconColor="text-white"
                  onClick={() => navigate('/dashboard/resultados')}
                />

                <QuickAccessButton
                  icon={<History className="w-6 h-6" />}
                  title="Historial de Actas"
                  subtitle="Ver historial de actas registradas"
                  bgColor="bg-[#F59E0B]"
                  iconColor="text-white"
                  onClick={() => navigate('/dashboard/historial')}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1E3A8A]">Información</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <span className="text-sm font-semibold text-[#10B981]">Activo</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Usuario</span>
                  <span className="text-sm font-semibold">{user.nombre_usuario}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hora</span>
                  <span className="text-sm font-semibold">{fechaHora}</span>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 bg-[#10B981]/10 p-4 rounded-lg">
                  <p className="text-xs text-[#10B981] font-semibold">Puedes digitalizar actas y consultar resultados</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================
           DASHBOARD DELEGADO DE MESA
           ============================================*/}
        {isDelegado && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Vote className="w-5 h-5 text-[#F59E0B]" />
                    <h2 className="text-lg font-bold text-[#1E3A8A]">Gestión de Mi Mesa</h2>
                  </div>
                  <p className="text-sm text-gray-500 ml-7">Acciones disponibles</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <QuickAccessButton
                  icon={<FileText className="w-6 h-6" />}
                  title="Registrar Votos"
                  subtitle="Registrar votos de mi mesa asignada"
                  bgColor="bg-[#10B981]"
                  iconColor="text-white"
                  onClick={() => navigate('/dashboard/transcripcion')}
                />

                <QuickAccessButton
                  icon={<BarChart3 className="w-6 h-6" />}
                  title="Ver Votos de Mi Mesa"
                  subtitle="Consultar los votos registrados"
                  bgColor="bg-[#F59E0B]"
                  iconColor="text-white"
                  onClick={() => navigate('/dashboard/resultados')}
                />

                <QuickAccessButton
                  icon={<History className="w-6 h-6" />}
                  title="Historial de Actas"
                  subtitle="Ver actas de mi mesa"
                  bgColor="bg-[#1E3A8A]"
                  iconColor="text-white"
                  onClick={() => navigate('/dashboard/historial')}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1E3A8A]">Mi Asignación</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
                    <span className="text-sm font-semibold text-[#F59E0B]">Asignado</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Usuario</span>
                  <span className="text-sm font-semibold">{user.nombre_usuario}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hora</span>
                  <span className="text-sm font-semibold">{fechaHora}</span>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 bg-[#F59E0B]/10 p-4 rounded-lg">
                  <p className="text-xs text-[#F59E0B] font-semibold">Acceso restringido a tu mesa asignada</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================
           DASHBOARD JEFE DE RECINTO
           ============================================*/}
        {isJefe && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Grid3x3 className="w-5 h-5 text-[#10B981]" />
                    <h2 className="text-lg font-bold text-[#1E3A8A]">Gestión de Mi Recinto</h2>
                  </div>
                  <p className="text-sm text-gray-500 ml-7">Controla todas las mesas de tu recinto</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <QuickAccessButton
                  icon={<FileText className="w-6 h-6" />}
                  title="Registrar/Editar Actas"
                  subtitle="Gestionar actas de mi recinto"
                  bgColor="bg-[#10B981]"
                  iconColor="text-white"
                  onClick={() => navigate('/dashboard/transcripcion')}
                />

                <QuickAccessButton
                  icon={<BarChart3 className="w-6 h-6" />}
                  title="Ver Votos de Mi Recinto"
                  subtitle="Consultar votos de todas mis mesas"
                  bgColor="bg-[#1E3A8A]"
                  iconColor="text-white"
                  onClick={() => navigate('/dashboard/resultados')}
                />

                <QuickAccessButton
                  icon={<Map className="w-6 h-6" />}
                  title="Mis Mesas"
                  subtitle="Ver mesas del recinto"
                  bgColor="bg-[#F59E0B]"
                  iconColor="text-white"
                  onClick={() => navigate('/dashboard/mesas')}
                />

                <QuickAccessButton
                  icon={<History className="w-6 h-6" />}
                  title="Historial de Actas"
                  subtitle="Ver actas de mi recinto"
                  bgColor="bg-[#1E3A8A]"
                  iconColor="text-white"
                  onClick={() => navigate('/dashboard/historial')}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1E3A8A]">Mi Recinto</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <span className="text-sm font-semibold text-[#10B981]">Activo</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Usuario</span>
                  <span className="text-sm font-semibold">{user.nombre_usuario}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hora</span>
                  <span className="text-sm font-semibold">{fechaHora}</span>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 bg-[#10B981]/10 p-4 rounded-lg">
                  <p className="text-xs text-[#10B981] font-semibold">Acceso completo a mesas de tu recinto asignado</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer informativo */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#152a63] rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Estado del Sistema</h3>
                <p className="text-sm text-gray-500">
                  {isAdmin && 'Todos los módulos operativos correctamente'}
                  {isOperador && 'Módulos de operación disponibles'}
                  {isDelegado && 'Sistema de mesa electoral activo'}
                  {isJefe && 'Sistema de recinto electoral activo'}
                </p>
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