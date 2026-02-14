import React, { useState, useEffect } from 'react';
import { 
    Plus, Upload, X, Edit2, Trash2, Flag, 
    Palette, Hash, Image, CheckCircle, AlertCircle,
    Award, Shield, Users, Star, Camera, Save
} from 'lucide-react';

const FrentesPoliticos = () => {
    const [frentes, setFrente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [cargando, setCargando] = useState(false);

    const [nuevoFrente, setNuevoFrente] = useState({
        id_frente: null,
        nombre: '',
        siglas: '',
        color: '#1E3A8A',
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
            if (file.size > 5 * 1024 * 1024) {
                mostrarMensaje('error', 'La imagen no debe superar los 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                mostrarMensaje('error', 'Solo se permiten archivos de imagen');
                return;
            }

            setNuevoFrente({ ...nuevoFrente, logo: file });

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
                color: frente.color || '#1E3A8A',
                logo: null
            });
            setPreviewImagen(frente.logo_url);
        } else {
            setEditando(false);
            setNuevoFrente({
                id_frente: null,
                nombre: '',
                siglas: '',
                color: '#1E3A8A',
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
            color: '#1E3A8A',
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

        setCargando(true);

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
        } finally {
            setCargando(false);
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-gray-200 border-t-[#1E3A8A] rounded-full animate-spin"></div>
                        <Flag className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#1E3A8A] w-8 h-8" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Cargando frentes políticos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header con diseño mejorado */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#152a63] rounded-2xl shadow-lg flex items-center justify-center">
                            <Flag className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">
                                Frentes Políticos
                            </h1>
                            <p className="text-gray-600">
                                Gestión de partidos, alianzas y frentes políticos
                            </p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => abrirModal()}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] hover:from-[#152a63] hover:to-[#0f1f4a] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        Nuevo Frente Político
                    </button>
                </div>
                
                {/* Barra decorativa */}
                <div className="w-32 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#F59E0B] rounded-full mt-4 ml-4"></div>
            </div>

            {/* Mensajes mejorados */}
            {mensaje.texto && (
                <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 animate-slideIn ${
                    mensaje.tipo === 'success' 
                        ? 'bg-[#10B981] bg-opacity-10 border border-[#10B981] border-opacity-30 text-[#10B981]' 
                        : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                    {mensaje.tipo === 'success' 
                        ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                        : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    }
                    <p className="text-sm">{mensaje.texto}</p>
                </div>
            )}

            {/* Grid de Frentes - Diseño mejorado */}
            {frentes.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Flag className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No hay frentes políticos registrados
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Comienza agregando un nuevo frente político para visualizarlo en el sistema electoral.
                    </p>
                    <button
                        onClick={() => abrirModal()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <Plus size={18} />
                        Crear Primer Frente
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {frentes.map((frente, index) => (
                        <div
                            key={frente.id_frente}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group"
                        >
                            {/* Cabecera con color */}
                            <div 
                                className="h-32 flex items-center justify-center p-4 relative overflow-hidden"
                                style={{ backgroundColor: frente.color || '#1E3A8A' }}
                            >
                                {/* Efecto de patrón */}
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-12 -mb-12"></div>
                                
                                {/* Logo */}
                                {frente.logo_url ? (
                                    <img
                                        src={frente.logo_url}
                                        alt={frente.nombre}
                                        className="relative z-10 max-h-24 max-w-full object-contain drop-shadow-lg"
                                    />
                                ) : (
                                    <Flag className="relative z-10 w-16 h-16 text-white opacity-50" />
                                )}
                                
                                {/* Número de posición */}
                                <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                                    #{index + 1}
                                </div>
                            </div>

                            {/* Información */}
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                                            {frente.nombre}
                                        </h3>
                                        {frente.siglas && (
                                            <div className="flex items-center gap-2">
                                                <Hash size={14} className="text-[#F59E0B]" />
                                                <p className="text-sm font-medium text-[#F59E0B]">
                                                    {frente.siglas}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Badge de color */}
                                <div className="flex items-center gap-2 mb-4">
                                    <Palette size={14} className="text-gray-400" />
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-5 h-5 rounded-md border border-gray-200"
                                            style={{ backgroundColor: frente.color }}
                                        ></div>
                                        <span className="text-xs font-mono text-gray-500">
                                            {frente.color}
                                        </span>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => abrirModal(frente)}
                                        className="flex-1 bg-[#F59E0B] bg-opacity-10 hover:bg-opacity-20 text-[#F59E0B] px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
                                    >
                                        <Edit2 size={16} />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => eliminarFrente(frente.id_frente)}
                                        className="w-12 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal con diseño mejorado */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        {/* Header del Modal */}
                        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        {editando ? <Edit2 size={20} /> : <Plus size={20} />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            {editando ? 'Editar Frente Político' : 'Nuevo Frente Político'}
                                        </h2>
                                        <p className="text-white/70 text-sm mt-1">
                                            {editando ? 'Modifica los datos del frente' : 'Ingresa los datos del nuevo frente político'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={cerrarModal}
                                    className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Nombre */}
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Nombre del Frente <span className="text-[#F59E0B]">*</span>
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={nuevoFrente.nombre}
                                        onChange={(e) => setNuevoFrente({ ...nuevoFrente, nombre: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none transition"
                                        placeholder="Ej: Movimiento al Socialismo"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Siglas */}
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Siglas
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={nuevoFrente.siglas}
                                        onChange={(e) => setNuevoFrente({ ...nuevoFrente, siglas: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none transition"
                                        placeholder="Ej: MAS-IPSP"
                                    />
                                </div>
                            </div>

                            {/* Color */}
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Color Representativo
                                </label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={nuevoFrente.color}
                                        onChange={(e) => setNuevoFrente({ ...nuevoFrente, color: e.target.value })}
                                        className="h-12 w-20 rounded-xl cursor-pointer border-2 border-gray-300"
                                    />
                                    <div className="relative flex-1">
                                        <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={nuevoFrente.color}
                                            onChange={(e) => setNuevoFrente({ ...nuevoFrente, color: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none transition font-mono"
                                            placeholder="#1E3A8A"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Logo del Frente
                                </label>

                                {/* Preview de la imagen */}
                                {previewImagen && (
                                    <div className="mb-4 relative bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                        <img
                                            src={previewImagen}
                                            alt="Preview"
                                            className="max-h-48 mx-auto rounded-lg object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviewImagen(null);
                                                setNuevoFrente({ ...nuevoFrente, logo: null });
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                {/* Input de archivo */}
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1E3A8A] hover:bg-[#1E3A8A] hover:bg-opacity-5 transition-all">
                                    <div className="flex flex-col items-center">
                                        <Camera className="w-8 h-8 mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-600 font-medium">
                                            <span className="text-[#1E3A8A] hover:underline">
                                                Seleccionar imagen
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG o SVG (máx. 5MB)
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImagenChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white rounded-xl font-bold hover:from-[#152a63] hover:to-[#0f1f4a] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cargando ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>{editando ? 'Actualizar' : 'Crear'} Frente</span>
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
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
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
                
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default FrentesPoliticos;