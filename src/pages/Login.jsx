import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown, BarChart3, User, LockKeyhole } from 'lucide-react';

// ✅ Ajusta esta ruta si tu estructura es diferente:
// - si Login.jsx está en src/pages/Login.jsx -> "../api/auth"
// - si está en src/components/Login.jsx -> "../api/auth"
// - si está más profundo -> "../../api/auth"
import { login, me, permissions } from '../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Nuevos estados (no cambian el diseño)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre_usuario: '',
    contrasena: '',
    rol: 'Administrador',
  });

  // ✅ Cambiado: ahora hace login real contra Laravel (Sanctum)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1) login -> obtiene cookies/sesión
      await login(formData.nombre_usuario, formData.contrasena);

      // 2) trae usuario y permisos reales
      const user = await me();
      const perms = await permissions();

      // 3) guarda en localStorage (si ya usabas esto, no rompe tu flujo)
      localStorage.setItem('usuario', JSON.stringify(user));
      localStorage.setItem('permisos', JSON.stringify(perms));

      // 4) navega al dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const irAResultados = () => {
    navigate('/resultados-en-vivo');
  };

  const inputClasses =
    "w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 bg-white/95 backdrop-blur-sm border border-white/20 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 outline-none transition-all duration-300 font-medium placeholder:text-gray-500/80 shadow-sm text-sm";
  const labelClasses =
    "text-white/90 text-[10px] font-bold uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="flex h-screen w-full font-sans bg-gray-900 overflow-hidden">
      {/*  PANEL IZQUIERDO */}
      <div className="w-full md:w-[450px] lg:w-[480px] bg-gradient-to-br from-[#E31E24] to-[#c41a1f] flex flex-col relative shadow-[5px_0_30px_rgba(0,0,0,0.3)] z-20 h-full overflow-y-auto">
        <div className="min-h-full flex flex-col justify-center p-6 sm:p-8">
          {/* Cabecera */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white p-3 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform">
              <img
                src="/LOGO NELSON 2026-2031.JPG"
                alt="Logo Unidos"
                className="w-24 h-auto object-contain"
              />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Bienvenido</h2>
            <p className="text-red-100 text-xs text-center opacity-90 max-w-[250px]">
              Sistema de Cómputo Electoral - Colcapirhua 2026
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="w-full space-y-4">
            {/* Usuario */}
            <div>
              <label className={labelClasses}>Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500/60 group-focus-within:text-red-600">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  placeholder="Ej: admin_cami"
                  className={inputClasses}
                  value={formData.nombre_usuario}
                  onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className={labelClasses}>Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500/60 group-focus-within:text-red-600">
                  <LockKeyhole size={18} strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${inputClasses} pr-10`}
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E31E24] p-1.5 rounded-full hover:bg-red-50 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* SELECTOR DE ROLES (se mantiene diseño; ya no define permisos reales) */}
            <div>
              <label className={labelClasses}>Rol de Acceso</label>
              <div className="relative">
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className={`${inputClasses} pl-4 appearance-none cursor-pointer pr-10`}
                >
                  <option value="Administrador">Administrador del Sistema</option>
                  <option value="Operador">Operador (Transcriptor)</option>
                  <option value="Supervisor">Supervisor (Jefe de Grupo)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-red-600">
                  <ChevronDown size={20} strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* ✅ Error sin cambiar diseño */}
            {error && (
              <div className="bg-black/20 border border-white/20 text-white text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Botón Login */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-white text-[#E31E24] font-black py-3.5 rounded-xl hover:bg-yellow-50 transition-all shadow-lg hover:shadow-xl uppercase tracking-widest text-xs transform hover:-translate-y-0.5 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          {/* Link Resultados Públicos */}
          <div className="mt-8">
            <div className="relative flex items-center py-3">
              <div className="flex-grow border-t border-red-300/30"></div>
              <span className="flex-shrink mx-2 text-red-100/70 text-[10px] font-bold uppercase tracking-widest">
                Acceso Público
              </span>
              <div className="flex-grow border-t border-red-300/30"></div>
            </div>
            <button
              onClick={irAResultados}
              className="w-full group flex items-center justify-center gap-2 px-4 py-3 bg-black/20 hover:bg-black/30 border border-white/10 rounded-xl text-white transition-all backdrop-blur-md"
            >
              <BarChart3 size={18} className="text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold tracking-wide text-xs">Ver Resultados en Vivo</span>
            </button>
          </div>
        </div>
      </div>

      {/*  PANEL DERECHO */}
      <div className="hidden md:block flex-1 relative bg-gray-900 h-full overflow-hidden">
        <img src="/partido.jpg" alt="Campaña Unidos" className="absolute inset-0 w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E31E24] via-black/20 to-transparent mix-blend-multiply"></div>
      </div>
    </div>
  );
};

export default Login;
