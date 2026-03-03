import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, UserCircle, X, Shield, Key, Mail, CheckCircle, XCircle } from 'lucide-react';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idUsuarioEditar, setIdUsuarioEditar] = useState(null);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre_usuario: '',
    contrasena: '',
    id_rol: ''
  });

  const cargarUsuarios = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al cargar usuarios');
      if (!data.success) throw new Error(data.message || 'Error al cargar usuarios');

      setUsuarios(data.data);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarRoles = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/usuarios/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) setRoles(data.data);
    } catch (err) {
      console.error('Error al cargar roles:', err);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setModoEdicion(true);
      setIdUsuarioEditar(usuario.id_usuario);

      setNuevoUsuario({
        nombre_usuario: usuario.nombre_usuario || '',
        contrasena: '',
        id_rol: usuario.id_rol ? String(usuario.id_rol) : ''
      });
    } else {
      setModoEdicion(false);
      setIdUsuarioEditar(null);

      setNuevoUsuario({
        nombre_usuario: '',
        contrasena: '',
        id_rol: ''
      });
    }

    setError(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
    setIdUsuarioEditar(null);
    setError(null);
    setNuevoUsuario({
      nombre_usuario: '',
      contrasena: '',
      id_rol: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const datosParaEnviar = {
      nombre_usuario: nuevoUsuario.nombre_usuario,
      id_rol: parseInt(nuevoUsuario.id_rol, 10)
    };

    // Solo enviar contrasena si: creando o si escribió algo en edición
    if (!modoEdicion || (nuevoUsuario.contrasena && nuevoUsuario.contrasena.trim() !== '')) {
      datosParaEnviar.contrasena = nuevoUsuario.contrasena;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');

      const url = modoEdicion
        ? `${API_URL}/usuarios/${idUsuarioEditar}`
        : `${API_URL}/usuarios`;

      const method = modoEdicion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(datosParaEnviar)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `Error al ${modoEdicion ? 'actualizar' : 'crear'} usuario`);
      if (!data.success) throw new Error(data.message || `Error al ${modoEdicion ? 'actualizar' : 'crear'} usuario`);

      await cargarUsuarios();
      cerrarModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const eliminarUsuario = async (usuario) => {
    if (
      !confirm(
        `¿Estás seguro de desactivar al usuario "${usuario.nombre_usuario}"?\n\nEsta acción marcará al usuario como inactivo.`
      )
    ) {
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/usuarios/${usuario.id_usuario}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al eliminar usuario');
      if (!data.success) throw new Error(data.message || 'Error al eliminar usuario');

      await cargarUsuarios();
    } catch (err) {
      alert('❌ ' + err.message);
      console.error('Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      {/* HEADER con diseño mejorado */}
      <div className="p-4 sm:p-6 md:p-8 mb-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#1E3A8A] to-[#152a63] rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0 flex items-center justify-center">
                <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 break-words">
                  Directorio De Usuarios
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Gestión de accesos y permisos del sistema</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-2">
                  <span className="font-bold">{usuarios.length}</span> registros
                </p>
              </div>
            </div>

            <button
              onClick={() => abrirModal()}
              className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] hover:from-[#152a63] hover:to-[#0f1f4a] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 whitespace-nowrap text-sm sm:text-base flex-shrink-0"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Nuevo Usuario</span><span className="sm:hidden">+</span>
            </button>
          </div>

          {/* Barra decorativa */}
          <div className="w-24 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#F59E0B] rounded-full"></div>
        </div>
      </div>

      {/* TABLA con diseño mejorado */}
      <div className="px-4 sm:px-6 md:px-8 pb-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-16 text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1E3A8A] rounded-full animate-spin mx-auto mb-4"></div>
              <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#1E3A8A] w-6 h-6" />
            </div>
            <p className="text-gray-600 font-medium mt-4 text-sm sm:text-base">Cargando usuarios...</p>
          </div>
        ) : error && usuarios.length === 0 ? (
          <div className="p-8 sm:p-16 text-center">
            <XCircle className="w-12 sm:w-16 h-12 sm:h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
          </div>
        ) : (
          <>
            {/* Vista de escritorio - Tabla */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white">
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider">Usuario</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider">Rol</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider">Estado</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-bold uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usuarios.map((u, index) => (
                    <tr 
                      key={u.id_usuario} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#1E3A8A] hover:bg-opacity-5 transition-colors group`}
                    >
                      {/* Usuario */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-gradient-to-br from-[#1E3A8A] to-[#152a63] p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white shadow-md flex-shrink-0">
                            <UserCircle size={18} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 group-hover:text-[#1E3A8A] transition-colors text-sm break-words">
                              @{u.nombre_usuario}
                            </span>
                            <p className="text-xs text-gray-400">ID: {u.id_usuario}</p>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm">
                        {u.rol?.nombre ? (
                          <div className="flex items-center gap-2">
                            <Shield size={14} className="text-[#F59E0B] flex-shrink-0" />
                            <span className="bg-[#F59E0B] bg-opacity-10 text-[#F59E0B] text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold border border-[#F59E0B] border-opacity-30 inline-block">
                              {u.rol.nombre}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin Rol</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold ${
                            u.activo 
                              ? 'bg-[#10B981] bg-opacity-10 text-[#10B981] border border-[#10B981] border-opacity-30' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {u.activo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          <span className="hidden sm:inline">{u.activo ? 'ACTIVO' : 'INACTIVO'}</span>
                          <span className="sm:hidden">{u.activo ? 'A' : 'I'}</span>
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              abrirModal(u);
                            }}
                            className="p-2 text-gray-400 hover:text-[#F59E0B] hover:bg-[#F59E0B] hover:bg-opacity-10 rounded-lg transition-all text-sm sm:text-base"
                            title="Editar usuario"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              eliminarUsuario(u);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm sm:text-base"
                            title="Desactivar usuario"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista móvil - Tarjetas */}
            <div className="sm:hidden divide-y divide-gray-100">
              {usuarios.map((u) => (
                <div key={u.id_usuario} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#152a63] p-2 rounded-lg text-white flex-shrink-0">
                        <UserCircle size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm break-words">@{u.nombre_usuario}</p>
                        <p className="text-xs text-gray-500">ID: {u.id_usuario}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => abrirModal(u)}
                        className="p-2 text-gray-400 hover:text-[#F59E0B] hover:bg-[#F59E0B] hover:bg-opacity-10 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => eliminarUsuario(u)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Desactivar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {u.rol?.nombre && (
                      <span className="bg-[#F59E0B] bg-opacity-10 text-[#F59E0B] px-2 py-1 rounded border border-[#F59E0B] border-opacity-30 font-bold">
                        {u.rol.nombre}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded border font-bold ${
                      u.activo
                        ? 'bg-[#10B981] bg-opacity-10 text-[#10B981] border-[#10B981] border-opacity-30'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer de tabla */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                <span className="text-gray-500">
                  Mostrando <span className="font-bold text-[#1E3A8A]">{usuarios.length}</span> usuarios
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
                  <span className="text-xs text-gray-400">Sistema activo</span>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </div>

      {/* MODAL con diseño mejorado */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal con gradiente NGP */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  {modoEdicion ? <Edit size={18} /> : <Plus size={18} />}
                </div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold truncate">{modoEdicion ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
              </div>
              <button 
                onClick={cerrarModal} 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-3">
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-4 sm:space-y-5">
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-gray-200">
                  <h3 className="font-bold text-[#1E3A8A] text-xs sm:text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Key size={14} className="sm:w-4 sm:h-4" />
                    Datos De Acceso
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Nombre De Usuario <span className="text-[#F59E0B]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                        <input
                          type="text"
                          name="nombre_usuario"
                          value={nuevoUsuario.nombre_usuario}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-8 pr-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#1E3A8A] focus:outline-none transition text-sm sm:text-base"
                          placeholder="jperez"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Contraseña {modoEdicion ? <span className="text-xs text-gray-500">(opcional)</span> : <span className="text-[#F59E0B]">*</span>}
                      </label>
                      <input
                        type="password"
                        name="contrasena"
                        value={nuevoUsuario.contrasena}
                        onChange={handleInputChange}
                        required={!modoEdicion}
                        className="w-full px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#1E3A8A] focus:outline-none transition text-sm sm:text-base"
                        placeholder={modoEdicion ? '•••••••• (dejar vacío para mantener)' : '••••••••'}
                      />
                      {modoEdicion && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <span className="w-1 h-1 bg-[#F59E0B] rounded-full flex-shrink-0"></span>
                          Solo ingresa una contraseña si deseas cambiarla
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Rol <span className="text-[#F59E0B]">*</span>
                      </label>
                      <select
                        name="id_rol"
                        value={nuevoUsuario.id_rol}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#1E3A8A] focus:outline-none appearance-none text-sm sm:text-base"
                      >
                        <option value="">Seleccione un rol</option>
                        {roles.map((rol) => (
                          <option key={rol.id_rol} value={rol.id_rol}>
                            {rol.nombre} - {rol.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 px-4 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-bold hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white rounded-lg sm:rounded-xl font-bold hover:from-[#152a63] hover:to-[#0f1f4a] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {guardando ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">{modoEdicion ? 'Actualizando...' : 'Creando...'}</span>
                      <span className="sm:hidden text-xs">{modoEdicion ? 'Act...' : 'Creo...'}</span>
                    </>
                  ) : (
                    <>
                      <Key size={16} className="sm:w-5 sm:h-5" />
                      <span>{modoEdicion ? 'Actualizar' : 'Crear'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estilos de animación */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default GestionUsuarios;