import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Search, UserCircle, X } from 'lucide-react';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);

    const [nuevoUsuario, setNuevoUsuario] = useState({
        nombre_usuario: '',
        contrasena: '',
        id_rol: '',
        persona: {
            nombre: '',
            apellido_paterno: '',
            apellido_materno: '',
            ci: '',
            celular: '',
            email: ''
        }
    });

    const cargarUsuarios = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cargar usuarios');
            }

            if (data.success) {
                setUsuarios(data.data);
            } else {
                throw new Error(data.message || 'Error al cargar usuarios');
            }

        } catch (err) {
            console.error("Error:", err);
            setError("No se pudieron cargar los usuarios: " + err.message);
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
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setRoles(data.data);
            }

        } catch (err) {
            console.error("Error al cargar roles:", err);
        }
    };

    useEffect(() => {
        cargarUsuarios();
        cargarRoles();
    }, []);

    const abrirModal = (usuario = null) => {
        if (usuario) {
            // Modo edición
            setModoEdicion(true);
            setUsuarioEditando(usuario);
            setNuevoUsuario({
                nombre_usuario: usuario.nombre_usuario,
                contrasena: '', // No mostramos la contraseña actual
                id_rol: usuario.roles && usuario.roles.length > 0
                    ? roles.find(r => r.nombre === usuario.roles[0].name)?.id_rol || ''
                    : '',
                persona: {
                    nombre: usuario.persona?.nombre || '',
                    apellido_paterno: usuario.persona?.apellido_paterno || '',
                    apellido_materno: usuario.persona?.apellido_materno || '',
                    ci: usuario.persona?.ci || '',
                    celular: usuario.persona?.celular || '',
                    email: usuario.persona?.email || ''
                }
            });
        } else {
            // Modo creación
            setModoEdicion(false);
            setUsuarioEditando(null);
            setNuevoUsuario({
                nombre_usuario: '',
                contrasena: '',
                id_rol: '',
                persona: {
                    nombre: '',
                    apellido_paterno: '',
                    apellido_materno: '',
                    ci: '',
                    celular: '',
                    email: ''
                }
            });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setModoEdicion(false);
        setUsuarioEditando(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const token = localStorage.getItem('token');

            const url = modoEdicion
                ? `${API_URL}/usuarios/${usuarioEditando.id_usuario}`
                : `${API_URL}/usuarios`;

            const method = modoEdicion ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(nuevoUsuario)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al ${modoEdicion ? 'actualizar' : 'crear'} usuario`);
            }

            if (data.success) {
                // Recargar usuarios
                await cargarUsuarios();
                cerrarModal();
                alert(`✅ Usuario ${modoEdicion ? 'actualizado' : 'creado'} exitosamente`);
            } else {
                throw new Error(data.message || `Error al ${modoEdicion ? 'actualizar' : 'crear'} usuario`);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('persona.')) {
            const personaField = name.split('.')[1];
            setNuevoUsuario(prev => ({
                ...prev,
                persona: {
                    ...prev.persona,
                    [personaField]: value
                }
            }));
        } else {
            setNuevoUsuario(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const eliminarUsuario = async (usuario) => {
        if (!confirm(`¿Estás seguro de desactivar al usuario "${usuario.nombre_usuario}"?\n\nEsta acción marcará al usuario como inactivo.`)) {
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/usuarios/${usuario.id_usuario}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al eliminar usuario');
            }

            if (data.success) {
                alert('✅ ' + data.message);
                await cargarUsuarios();
            } else {
                throw new Error(data.message || 'Error al eliminar usuario');
            }

        } catch (err) {
            alert('❌ ' + err.message);
            console.error('Error:', err);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-8 bg-red-600 rounded-full"></span>
                        Directorio de Usuarios
                    </h1>
                    <p className="text-gray-500 mt-1 ml-4 text-sm">Gestión de accesos del sistema</p>
                </div>

                <button
                    onClick={abrirModal}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all"
                >
                    <Plus size={18} /> Nuevo Usuario
                </button>
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">Cargando usuarios...</div>
                ) : error && usuarios.length === 0 ? (
                    <div className="p-10 text-center text-red-500">{error}</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Usuario</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nombre Real</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Rol</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usuarios.map((u) => (
                                <tr key={u.id_usuario} className="hover:bg-red-50/10 transition group">

                                    {/* Usuario */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-100 p-2 rounded-full text-red-600">
                                                <UserCircle size={20} />
                                            </div>
                                            <span className="font-bold text-gray-800">@{u.nombre_usuario}</span>
                                        </div>
                                    </td>

                                    {/* Nombre (Relación Persona) */}
                                    <td className="px-6 py-4">
                                        {u.persona ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {u.persona.nombre} {u.persona.apellido_paterno}
                                                </span>
                                                <span className="text-xs text-gray-400">CI: {u.persona.ci}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sin persona asignada</span>
                                        )}
                                    </td>

                                    {/* Rol */}
                                    <td className="px-6 py-4">
                                        {u.roles && u.roles.length > 0 ? (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">
                                                {u.roles[0].name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">Sin Rol</span>
                                        )}
                                    </td>

                                    {/* Estado */}
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {u.activo ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </td>

                                    {/* Botones */}
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => abrirModal(u)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                            title="Editar usuario"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => eliminarUsuario(u)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                            title="Desactivar usuario"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL CREAR USUARIO */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        {/* Header del Modal */}
                        <div className="sticky top-0 bg-red-600 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
                            <h2 className="text-xl font-bold">
                                {modoEdicion ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                            </h2>
                            <button onClick={cerrarModal} className="hover:bg-red-700 p-2 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Sección: Datos de Usuario */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">
                                    Datos de Acceso
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Nombre de Usuario *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre_usuario"
                                            value={nuevoUsuario.nombre_usuario}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Ej: jperez"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Contraseña {modoEdicion ? '(opcional)' : '*'}
                                        </label>
                                        <input
                                            type="password"
                                            name="contrasena"
                                            value={nuevoUsuario.contrasena}
                                            onChange={handleInputChange}
                                            required={!modoEdicion}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder={modoEdicion ? "Dejar vacío para mantener la actual" : "••••••••"}
                                        />
                                        {modoEdicion && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Solo ingresa una contraseña si deseas cambiarla
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Rol *
                                    </label>
                                    <select
                                        name="id_rol"
                                        value={nuevoUsuario.id_rol}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option value="">Seleccione un rol</option>
                                        {roles.map(rol => (
                                            <option key={rol.id_rol} value={rol.id_rol}>
                                                {rol.nombre} - {rol.descripcion}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Sección: Datos Personales */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">
                                    Datos Personales
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            name="persona.nombre"
                                            value={nuevoUsuario.persona.nombre}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Ej: Juan"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Apellido Paterno *
                                        </label>
                                        <input
                                            type="text"
                                            name="persona.apellido_paterno"
                                            value={nuevoUsuario.persona.apellido_paterno}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Ej: Pérez"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Apellido Materno
                                        </label>
                                        <input
                                            type="text"
                                            name="persona.apellido_materno"
                                            value={nuevoUsuario.persona.apellido_materno}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Ej: López"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            CI *
                                        </label>
                                        <input
                                            type="text"
                                            name="persona.ci"
                                            value={nuevoUsuario.persona.ci}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Ej: 12345678"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Celular
                                        </label>
                                        <input
                                            type="tel"
                                            name="persona.celular"
                                            value={nuevoUsuario.persona.celular}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Ej: 70000000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="persona.email"
                                            value={nuevoUsuario.persona.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Ej: juan@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {guardando
                                        ? (modoEdicion ? 'Actualizando...' : 'Creando...')
                                        : (modoEdicion ? 'Actualizar Usuario' : 'Crear Usuario')
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionUsuarios;