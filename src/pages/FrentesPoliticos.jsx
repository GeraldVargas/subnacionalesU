import React, { useState, useEffect } from 'react';
import { Plus, Upload, X, Edit2, Trash2, Flag } from 'lucide-react';

const FrentesPoliticos = () => {
    const [frentes, setFrente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const [nuevoFrente, setNuevoFrente] = useState({
        id_frente: null,
        nombre: '',
        siglas: '',
        color: '#E31E24',
        logo: null
    });

    const [previewImagen, setPreviewImagen] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        cargarFrente();
    }, []);

    const cargarFrente = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/frentes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFrente(data);
            }
        } catch (error) {
            console.error('Error al cargar frentes:', error);
            mostrarMensaje('error', 'Error al cargar los frentes políticos');
        } finally {
            setLoading(false);
        }
    };

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                mostrarMensaje('error', 'La imagen no debe superar los 5MB');
                return;
            }

            // Validar tipo
            if (!file.type.startsWith('image/')) {
                mostrarMensaje('error', 'Solo se permiten archivos de imagen');
                return;
            }

            setNuevoFrente({ ...nuevoFrente, logo: file });

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImagen(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const abrirModal = (frente = null) => {
        if (frente) {
            setEditando(true);
            setNuevoFrente({
                id_frente: frente.id_frente,
                nombre: frente.nombre,
                siglas: frente.siglas || '',
                color: frente.color || '#E31E24',
                logo: null
            });
            setPreviewImagen(frente.logo_url);
        } else {
            setEditando(false);
            setNuevoFrente({
                id_frente: null,
                nombre: '',
                siglas: '',
                color: '#E31E24',
                logo: null
            });
            setPreviewImagen(null);
        }
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setEditando(false);
        setNuevoFrente({
            id_frente: null,
            nombre: '',
            siglas: '',
            color: '#E31E24',
            logo: null
        });
        setPreviewImagen(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nuevoFrente.nombre.trim()) {
            mostrarMensaje('error', 'El nombre del frente es obligatorio');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('nombre', nuevoFrente.nombre);
            formData.append('siglas', nuevoFrente.siglas);
            formData.append('color', nuevoFrente.color);

            if (nuevoFrente.logo) {
                formData.append('logo', nuevoFrente.logo);
            }

            const url = editando
                ? `${API_URL}/frentes/${nuevoFrente.id_frente}`
                : `${API_URL}/frentes`;

            const response = await fetch(url, {
                method: editando ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                mostrarMensaje('success',
                    editando ? 'Frente actualizado correctamente' : 'Frente creado correctamente'
                );
                cargarFrente();
                cerrarModal();
            } else {
                const error = await response.json();
                mostrarMensaje('error', error.message || 'Error al guardar el frente');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('error', 'Error al guardar el frente político');
        }
    };

    const eliminarFrente = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este frente político?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/frentes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                mostrarMensaje('success', 'Frente eliminado correctamente');
                cargarFrente();
            } else {
                const error = await response.json();
                mostrarMensaje('error', error.message || 'Error al eliminar el frente');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('error', 'Error al eliminar el frente político');
        }
    };

    const mostrarMensaje = (tipo, texto) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24]"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Frentes Políticos</h1>
                    <p className="text-gray-600 mt-1">Gestión de partidos y frentes políticos</p>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="bg-[#E31E24] hover:bg-[#C41A1F] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                >
                    <Plus size={20} />
                    Añadir Frente Político
                </button>
            </div>

            {/* Mensajes */}
            {mensaje.texto && (
                <div className={`mb-4 p-4 rounded-lg ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {mensaje.texto}
                </div>
            )}

            {/* Grid de Frentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {frentes.map((frente) => (
                    <div
                        key={frente.id_frente}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100"
                    >
                        {/* Logo */}
                        <div
                            className="h-48 flex items-center justify-center p-6"
                            style={{ backgroundColor: frente.color || '#f3f4f6' }}
                        >
                            {frente.logo_url ? (
                                <img
                                    src={frente.logo_url}
                                    alt={frente.nombre}
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <Flag size={64} className="text-white opacity-50" />
                            )}
                        </div>

                        {/* Información */}
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                                {frente.nombre}
                            </h3>
                            {frente.siglas && (
                                <p className="text-sm text-gray-600 mb-3">
                                    {frente.siglas}
                                </p>
                            )}

                            {/* Acciones */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => abrirModal(frente)}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    Editar
                                </button>
                                <button
                                    onClick={() => eliminarFrente(frente.id_frente)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mensaje si no hay frentes */}
            {frentes.length === 0 && (
                <div className="text-center py-12">
                    <Flag size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No hay frentes políticos registrados
                    </h3>
                    <p className="text-gray-500">
                        Comienza agregando un nuevo frente político
                    </p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header del Modal */}
                        <div className="bg-[#E31E24] text-white p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">
                                {editando ? 'Editar Frente Político' : 'Nuevo Frente Político'}
                            </h2>
                            <button
                                onClick={cerrarModal}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Nombre */}
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Nombre del Frente *
                                </label>
                                <input
                                    type="text"
                                    value={nuevoFrente.nombre}
                                    onChange={(e) => setNuevoFrente({ ...nuevoFrente, nombre: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                                    placeholder="Ej: Movimiento al Socialismo"
                                    required
                                />
                            </div>

                            {/* Siglas */}
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Siglas
                                </label>
                                <input
                                    type="text"
                                    value={nuevoFrente.siglas}
                                    onChange={(e) => setNuevoFrente({ ...nuevoFrente, siglas: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                                    placeholder="Ej: MAS-IPSP"
                                />
                            </div>

                            {/* Color */}
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Color Representativo
                                </label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={nuevoFrente.color}
                                        onChange={(e) => setNuevoFrente({ ...nuevoFrente, color: e.target.value })}
                                        className="h-12 w-20 rounded-lg cursor-pointer border-2 border-gray-300"
                                    />
                                    <input
                                        type="text"
                                        value={nuevoFrente.color}
                                        onChange={(e) => setNuevoFrente({ ...nuevoFrente, color: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                                        placeholder="#E31E24"
                                    />
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Logo del Frente
                                </label>

                                {/* Preview de la imagen */}
                                {previewImagen && (
                                    <div className="mb-4 relative">
                                        <img
                                            src={previewImagen}
                                            alt="Preview"
                                            className="max-h-48 mx-auto rounded-lg border-2 border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviewImagen(null);
                                                setNuevoFrente({ ...nuevoFrente, logo: null });
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                {/* Input de archivo */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#E31E24] transition-colors">
                                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                    <label className="cursor-pointer">
                                        <span className="text-[#E31E24] hover:underline font-semibold">
                                            Seleccionar imagen
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImagenChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-sm text-gray-500 mt-2">
                                        PNG, JPG o SVG (máx. 5MB)
                                    </p>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#E31E24] hover:bg-[#C41A1F] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    {editando ? 'Actualizar' : 'Crear'} Frente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FrentesPoliticos;
