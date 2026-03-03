import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BarChart3, User, LockKeyhole, Shield, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ IMÁGENES ROTATIVAS (1s) + DIFUMINADO
  const images = ['/cochabamba.jpg', '/plazab.jpg', '/plazap.jpg'];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3500); // ⏱ 1 segundo

    return () => clearInterval(interval);
  }, []);

  const [formData, setFormData] = useState({
    nombre_usuario: '',
    contrasena: '',
    rol: 'Administrador',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      // Llamar al backend para login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_usuario: formData.nombre_usuario,
          contrasena: formData.contrasena
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      if (data.success) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('usuario', JSON.stringify(data.data.usuario));

        // Navegar al dashboard
        navigate('/dashboard');
      } else {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const irAResultados = () => {
    navigate('/resultados-en-vivo');
  };

  const inputClasses =
    "w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 bg-white border border-gray-200 focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/20 outline-none transition-all duration-300 font-medium placeholder:text-gray-400 shadow-sm text-sm";

  const labelClasses =
    "text-white text-xs font-bold uppercase tracking-wider ml-1 mb-1.5 block";

  return (
    <div className="flex flex-col md:flex-row h-screen w-full font-sans overflow-hidden">
      {/* PANEL IZQUIERDO - FORMULARIO CON DEGRADADO AZUL-NARANJA */}
      <div className="w-full md:w-[480px] lg:w-[520px] bg-gradient-to-br from-[#0A1A3F] via-[#0A1A3F] to-[#F59E0B] flex flex-col relative shadow-2xl z-20 h-auto md:h-full overflow-y-auto">
        <div className="min-h-screen md:min-h-full flex flex-col justify-center p-4 sm:p-8 md:p-10 bg-black/20 backdrop-blur-sm">
          {/* Logo y título */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-5 transform hover:scale-105 transition-transform bg-white/10 p-2 sm:p-4 rounded-2xl backdrop-blur-md">
              <img
                src="/logongp.jpg"
                alt="Logo Sistema Electoral"
                className="w-20 sm:w-28 h-auto object-contain"
                onError={(e) => {
                  console.error('Error cargando logo:', e);
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight text-center">Bienvenido</h2>
            <p className="text-white/80 text-xs sm:text-sm text-center max-w-[280px]">
              Sistema de Cómputo Electoral 2026
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="w-full space-y-4 sm:space-y-5">
            {/* Usuario */}
            <div>
              <label className={labelClasses}>Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#F59E0B]">
                  <User size={18} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  className={inputClasses}
                  value={formData.nombre_usuario}
                  onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className={labelClasses}>Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#F59E0B]">
                  <LockKeyhole size={18} strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${inputClasses} pr-12`}
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F59E0B] p-1 rounded-md transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-white text-xs sm:text-sm p-3 rounded-xl flex items-center gap-2 backdrop-blur-sm">
                <Shield size={16} className="text-red-300 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botón Login - NARANJA */}
            <div className="pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#F59E0B] text-white font-bold py-3 sm:py-3.5 rounded-xl hover:bg-[#e68906] hover:shadow-xl transition-all shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Ingresando...</span>
                    <span className="sm:hidden">Entrando...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ✅ Acceso Público (NO SE TOCA) */}
          <div className="mt-6 sm:mt-10">
            <div className="relative flex items-center py-3">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="flex-shrink mx-3 text-white/60 text-xs font-medium uppercase tracking-wider">
                Acceso Público
              </span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>
            <button
              onClick={irAResultados}
              className="w-full group flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all backdrop-blur-sm text-sm"
            >
              <BarChart3 size={18} className="text-[#F59E0B] group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="font-medium">Ver Resultados en Vivo</span>
            </button>
          </div>

          {/* Footer (NO SE TOCA) */}
          <p className="text-center text-white/40 text-xs mt-6 sm:mt-8">
            © 2026 Sistema Electoral - Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* PANEL DERECHO - IMAGEN COMPLETA CON SOMBRA AZUL */}
      <div className="hidden md:flex flex-1 relative h-full overflow-hidden">
        {/* ✅ FADE REAL: renderiza las 3 y solo una se ve */}
        {images.map((img, index) => (
          <img
            key={img}
            src={img}
            alt="Fondo Electoral"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
            onError={(e) => {
              console.error('Error cargando imagen de fondo:', e);
              e.target.style.display = 'none';
            }}
          />
        ))}

        {/* SOLO UNA SOMBRA AZUL QUE VIENE DE LA IZQUIERDA - SIN CUBRIR LA IMAGEN */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1A3F] via-[#0A1A3F]/30 to-transparent pointer-events-none"></div>

        {/* Contenido del panel derecho (NO SE TOCA) */}
        <div className="absolute bottom-10 left-10 z-10 text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-lg">Sistema Electoral 2026</h3>
          <p className="text-base sm:text-lg drop-shadow-md">Transparencia y seguridad en cada voto</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
