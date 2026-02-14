import React, { useState, useEffect } from 'react';
import {
    Save,
    Plus,
    CheckCircle,
    ClipboardCheck,
    ShieldCheck,
    X,
    MapPin,
    Building2,
    Grid3x3,
    ChevronRight,
    FileText,
    ArrowLeft,
    Image,
    Upload,
    AlertCircle,
    ChevronLeft,
    Home,
    School,
    Users,
    Vote,
    Camera,
    FileCheck,
    Clock,
    BarChart3
} from 'lucide-react';

const Transcripcion = () => {
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastType, setToastType] = useState('success');
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState({
        distritos: false,
        recintos: false,
        mesas: false,
        frentes: false
    });

    // Estados para el wizard
    const [distritos, setDistritos] = useState([]);
    const [recintos, setRecintos] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [frentes, setFrentes] = useState([]);
    
    // Selecciones
    const [selectedDistrito, setSelectedDistrito] = useState(null);
    const [selectedRecinto, setSelectedRecinto] = useState(null);
    const [selectedMesa, setSelectedMesa] = useState(null);

    // Votos
    const [votosAlcalde, setVotosAlcalde] = useState([]);
    const [votosConcejal, setVotosConcejal] = useState([]);
    const [votosNulos, setVotosNulos] = useState(0);
    const [votosBlancos, setVotosBlancos] = useState(0);
    const [observaciones, setObservaciones] = useState('');
    
    // Imagen del acta
    const [imagenActa, setImagenActa] = useState(null);
    const [previewImagen, setPreviewImagen] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    // Cargar distritos al abrir modal
    useEffect(() => {
        if (showModal) {
            cargarDistritos();
            cargarFrentes();
        }
    }, [showModal]);

    const cargarDistritos = async () => {
        setLoading(prev => ({ ...prev, distritos: true }));
        try {
            const response = await fetch(`${API_URL}/geografico`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                // Filtrar por tipos que pueden ser distritos (País, Ciudad, Municipio, Distrito)
                const distritosData = data.data.filter(g => 
                    ['País', 'Ciudad', 'Municipio', 'Distrito'].includes(g.tipo)
                );
                
                // Si no hay con esos tipos, mostrar todos como fallback
                if (distritosData.length === 0) {
                    setDistritos(data.data);
                } else {
                    setDistritos(distritosData);
                }
            } else {
                console.error('Error en respuesta:', data);
                mostrarNotificacion('error', 'Error al cargar distritos');
            }
        } catch (error) {
            console.error('Error al cargar distritos:', error);
            mostrarNotificacion('error', 'Error de conexión al cargar distritos');
        } finally {
            setLoading(prev => ({ ...prev, distritos: false }));
        }
    };

    const cargarRecintos = async (idGeografico) => {
        setLoading(prev => ({ ...prev, recintos: true }));
        try {
            const response = await fetch(`${API_URL}/votos/recintos?id_geografico=${idGeografico}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRecintos(data.data);
                if (data.data.length === 0) {
                    mostrarNotificacion('info', 'No hay recintos disponibles para este distrito');
                }
            }
        } catch (error) {
            console.error('Error al cargar recintos:', error);
            mostrarNotificacion('error', 'Error al cargar recintos');
        } finally {
            setLoading(prev => ({ ...prev, recintos: false }));
        }
    };

    const cargarMesas = async (idRecinto) => {
        setLoading(prev => ({ ...prev, mesas: true }));
        try {
            const response = await fetch(`${API_URL}/votos/mesas?id_recinto=${idRecinto}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMesas(data.data);
                if (data.data.length === 0) {
                    mostrarNotificacion('info', 'No hay mesas disponibles para este recinto');
                }
            }
        } catch (error) {
            console.error('Error al cargar mesas:', error);
            mostrarNotificacion('error', 'Error al cargar mesas');
        } finally {
            setLoading(prev => ({ ...prev, mesas: false }));
        }
    };

    const cargarFrentes = async () => {
        setLoading(prev => ({ ...prev, frentes: true }));
        try {
            const response = await fetch(`${API_URL}/votos/frentes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setFrentes(data.data);
                const votosIniciales = data.data.map(f => ({
                    id_frente: f.id_frente,
                    nombre: f.nombre,
                    siglas: f.siglas,
                    color: f.color,
                    cantidad: 0
                }));
                setVotosAlcalde(votosIniciales);
                setVotosConcejal(JSON.parse(JSON.stringify(votosIniciales)));
            }
        } catch (error) {
            console.error('Error al cargar frentes:', error);
            mostrarNotificacion('error', 'Error al cargar frentes políticos');
        } finally {
            setLoading(prev => ({ ...prev, frentes: false }));
        }
    };

    const mostrarNotificacion = (tipo, mensaje) => {
        setToastType(tipo);
        setToastMsg(mensaje);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    const handleSelectDistrito = (distrito) => {
        setSelectedDistrito(distrito);
        setSelectedRecinto(null);
        setSelectedMesa(null);
        cargarRecintos(distrito.id_geografico);
        setCurrentStep(2);
    };

    const handleSelectRecinto = (recinto) => {
        setSelectedRecinto(recinto);
        setSelectedMesa(null);
        cargarMesas(recinto.id_recinto);
        setCurrentStep(3);
    };

    const handleSelectMesa = (mesa) => {
        setSelectedMesa(mesa);
        setCurrentStep(4);
    };

    const updateVotos = (tipo, idFrente, value) => {
        const setVotos = tipo === 'alcalde' ? setVotosAlcalde : setVotosConcejal;
        setVotos(prev => prev.map(v =>
            v.id_frente === idFrente ? { ...v, cantidad: Math.max(0, value) } : v
        ));
    };
    
    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                mostrarNotificacion('error', 'La imagen no debe superar los 10MB');
                return;
            }
            
            if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
                mostrarNotificacion('error', 'Solo se permiten imágenes JPG, PNG o PDF');
                return;
            }
            
            setImagenActa(file);
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImagen(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewImagen('pdf');
            }
        }
    };

    const handleRegistrarActa = async () => {
        setIsSaving(true);

        try {
            const token = localStorage.getItem('token');
            
            const formData = new FormData();
            formData.append('id_mesa', selectedMesa.id_mesa);
            formData.append('id_tipo_eleccion', 1);
            formData.append('votos_nulos', votosNulos);
            formData.append('votos_blancos', votosBlancos);
            formData.append('observaciones', observaciones);
            formData.append('votos_alcalde', JSON.stringify(votosAlcalde.filter(v => v.cantidad > 0)));
            formData.append('votos_concejal', JSON.stringify(votosConcejal.filter(v => v.cantidad > 0)));
            
            if (imagenActa) {
                formData.append('imagen_acta', imagenActa);
            }
            
            const response = await fetch(`${API_URL}/votos/registrar-acta`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                mostrarNotificacion('success', '¡Acta registrada exitosamente!');
                setTimeout(() => {
                    setShowModal(false);
                    resetForm();
                }, 2000);
            } else {
                throw new Error(data.message || 'Error al registrar acta');
            }

        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('error', error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setCurrentStep(1);
        setSelectedDistrito(null);
        setSelectedRecinto(null);
        setSelectedMesa(null);
        setVotosNulos(0);
        setVotosBlancos(0);
        setObservaciones('');
        setImagenActa(null);
        setPreviewImagen(null);
        if (frentes.length > 0) {
            const votosIniciales = frentes.map(f => ({
                id_frente: f.id_frente,
                nombre: f.nombre,
                siglas: f.siglas,
                color: f.color,
                cantidad: 0
            }));
            setVotosAlcalde(votosIniciales);
            setVotosConcejal(votosIniciales);
        }
    };

    const totalVotosAlcalde = votosAlcalde.reduce((sum, v) => sum + v.cantidad, 0);
    const totalVotosConcejal = votosConcejal.reduce((sum, v) => sum + v.cantidad, 0);
    const totalGeneral = totalVotosAlcalde + totalVotosConcejal + votosNulos + votosBlancos;

    const VotoCard = ({ frente, tipo }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:border-indigo-300">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                        className="w-10 h-10 rounded-lg flex-shrink-0 shadow-sm" 
                        style={{ backgroundColor: frente.color }}
                    />
                    <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{frente.siglas}</p>
                        <p className="text-xs text-gray-500 truncate">{frente.nombre}</p>
                    </div>
                </div>
                <input
                    type="text"
                    inputMode="numeric"
                    value={frente.cantidad || ''}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        updateVotos(tipo, frente.id_frente, parseInt(value) || 0);
                    }}
                    className="w-20 text-center text-xl font-bold border border-gray-300 rounded-lg py-2 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    placeholder="0"
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-indigo-50 rounded-xl">
                                <FileText className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Transcripción de Actas</h1>
                                <p className="text-sm text-gray-500">Registro electoral en tiempo real</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Nueva Acta
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Tarjetas de estadísticas */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 rounded-lg">
                                <FileCheck className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Actas Registradas</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Votos Válidos</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Participación</p>
                                <p className="text-2xl font-bold text-gray-900">0%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensaje de bienvenida */}
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-8 text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardCheck className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Sistema de Transcripción de Actas
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Selecciona "Nueva Acta" para comenzar el registro de resultados electorales
                    </p>
                </div>
            </div>

            {/* Modal Wizard */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8">
                        
                        {/* Header del Modal */}
                        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 rounded-t-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Registro de Acta Electoral</h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Stepper simplificado */}
                            <div className="flex items-center">
                                {[
                                    { num: 1, label: 'Distrito', icon: MapPin },
                                    { num: 2, label: 'Recinto', icon: Building2 },
                                    { num: 3, label: 'Mesa', icon: Grid3x3 },
                                    { num: 4, label: 'Votos', icon: Vote }
                                ].map((step, idx) => (
                                    <React.Fragment key={step.num}>
                                        <div className="flex items-center">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                                                currentStep >= step.num 
                                                    ? 'bg-indigo-600 text-white' 
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}>
                                                {currentStep > step.num ? <CheckCircle className="w-4 h-4" /> : step.num}
                                            </div>
                                            <span className={`ml-2 text-sm font-medium ${
                                                currentStep >= step.num ? 'text-gray-900' : 'text-gray-400'
                                            }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                        {idx < 3 && (
                                            <div className={`w-12 h-0.5 mx-3 ${
                                                currentStep > step.num ? 'bg-indigo-600' : 'bg-gray-200'
                                            }`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Contenido del Modal */}
                        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                            {/* Paso 1: Seleccionar Distrito */}
                            {currentStep === 1 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona el Distrito</h3>
                                    
                                    {loading.distritos ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : distritos.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                                            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600">No hay distritos disponibles</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {distritos.map(distrito => (
                                                <button
                                                    key={distrito.id_geografico}
                                                    onClick={() => handleSelectDistrito(distrito)}
                                                    className="p-4 border border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{distrito.nombre}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{distrito.tipo}</p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Paso 2: Seleccionar Recinto */}
                            {currentStep === 2 && (
                                <div>
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-4"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Volver
                                    </button>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona el Recinto</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Distrito: <span className="font-medium text-gray-900">{selectedDistrito?.nombre}</span>
                                    </p>
                                    
                                    {loading.recintos ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : recintos.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                                            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600">No hay recintos en este distrito</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recintos.map(recinto => (
                                                <button
                                                    key={recinto.id_recinto}
                                                    onClick={() => handleSelectRecinto(recinto)}
                                                    className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{recinto.nombre}</p>
                                                            <p className="text-sm text-gray-500 mt-1">{recinto.direccion}</p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {recinto.cantidad_mesas} mesas disponibles
                                                            </p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Paso 3: Seleccionar Mesa */}
                            {currentStep === 3 && (
                                <div>
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-4"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Volver
                                    </button>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona la Mesa</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Recinto: <span className="font-medium text-gray-900">{selectedRecinto?.nombre}</span>
                                    </p>
                                    
                                    {loading.mesas ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : mesas.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                                            <Grid3x3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600">No hay mesas en este recinto</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {mesas.map(mesa => (
                                                <button
                                                    key={mesa.id_mesa}
                                                    onClick={() => handleSelectMesa(mesa)}
                                                    className="p-4 border border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Mesa {mesa.numero_mesa}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{mesa.codigo}</p>
                                                        {mesa.actas_registradas > 0 && (
                                                            <p className="text-xs text-amber-600 mt-2 font-medium">
                                                                ⚠️ {mesa.actas_registradas} acta(s) registrada(s)
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Paso 4: Registrar Votos */}
                            {currentStep === 4 && (
                                <div>
                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-4"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Volver
                                    </button>
                                    
                                    {/* Resumen de selección */}
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-indigo-600 text-xs font-medium mb-1">Distrito</p>
                                                <p className="text-gray-900 font-semibold">{selectedDistrito?.nombre}</p>
                                            </div>
                                            <div>
                                                <p className="text-indigo-600 text-xs font-medium mb-1">Recinto</p>
                                                <p className="text-gray-900 font-semibold">{selectedRecinto?.nombre}</p>
                                            </div>
                                            <div>
                                                <p className="text-indigo-600 text-xs font-medium mb-1">Mesa</p>
                                                <p className="text-gray-900 font-semibold">Mesa {selectedMesa?.numero_mesa}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Votos Alcalde */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-6 bg-indigo-600 rounded"></div>
                                            <h3 className="font-semibold text-gray-900">Votos para Alcalde</h3>
                                            <span className="text-xs text-gray-500 ml-auto">
                                                Total: {totalVotosAlcalde}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {votosAlcalde.map(frente => (
                                                <VotoCard key={`alc-${frente.id_frente}`} frente={frente} tipo="alcalde" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Votos Concejal */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-6 bg-emerald-600 rounded"></div>
                                            <h3 className="font-semibold text-gray-900">Votos para Concejales</h3>
                                            <span className="text-xs text-gray-500 ml-auto">
                                                Total: {totalVotosConcejal}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {votosConcejal.map(frente => (
                                                <VotoCard key={`con-${frente.id_frente}`} frente={frente} tipo="concejal" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Votos Nulos y Blancos */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                            <label className="block text-xs font-medium text-red-700 mb-2">
                                                Votos Nulos
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={votosNulos || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    setVotosNulos(parseInt(value) || 0);
                                                }}
                                                className="w-full text-center text-xl font-bold border border-red-200 rounded-lg py-2 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Votos en Blanco
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={votosBlancos || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    setVotosBlancos(parseInt(value) || 0);
                                                }}
                                                className="w-full text-center text-xl font-bold border border-gray-200 rounded-lg py-2 focus:border-gray-600 focus:ring-1 focus:ring-gray-600 focus:outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Observaciones */}
                                    <div className="mb-6">
                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                            Observaciones
                                        </label>
                                        <textarea
                                            value={observaciones}
                                            onChange={(e) => setObservaciones(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                                            rows="2"
                                            placeholder="Observaciones adicionales..."
                                        />
                                    </div>

                                    {/* Imagen del Acta */}
                                    <div className="mb-6">
                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Camera className="w-4 h-4" />
                                                Imagen del Acta
                                            </div>
                                        </label>
                                        
                                        {!previewImagen ? (
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-600 hover:bg-indigo-50 transition">
                                                <div className="flex flex-col items-center">
                                                    <Upload className="w-6 h-6 mb-1 text-gray-400" />
                                                    <p className="text-xs text-gray-600">Click para subir</p>
                                                    <p className="text-[10px] text-gray-400">JPG, PNG, PDF (máx 10MB)</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                                                    onChange={handleImagenChange}
                                                />
                                            </label>
                                        ) : (
                                            <div className="relative border border-gray-200 rounded-lg p-2">
                                                <button
                                                    onClick={() => {
                                                        setImagenActa(null);
                                                        setPreviewImagen(null);
                                                    }}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                {previewImagen === 'pdf' ? (
                                                    <div className="flex items-center justify-center h-20 bg-gray-100 rounded">
                                                        <FileText className="w-8 h-8 text-red-500" />
                                                        <span className="text-xs text-gray-600 ml-2">{imagenActa?.name}</span>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={previewImagen}
                                                        alt="Preview"
                                                        className="w-full h-20 object-contain rounded"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Total y Botón */}
                                    <div className="bg-indigo-600 rounded-xl p-4 text-white mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium opacity-90">Total de Votos</span>
                                            <span className="text-2xl font-bold">{totalGeneral}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleRegistrarActa}
                                        disabled={isSaving || totalGeneral === 0}
                                        className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition ${
                                            isSaving || totalGeneral === 0
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Registrando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Registrar Acta
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast notification */}
            {showToast && (
                <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
                    <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-md ${
                        toastType === 'success' ? 'bg-green-50 border border-green-200' :
                        toastType === 'error' ? 'bg-red-50 border border-red-200' :
                        'bg-blue-50 border border-blue-200'
                    }`}>
                        {toastType === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {toastType === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                        {toastType === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
                        <p className={`text-sm ${
                            toastType === 'success' ? 'text-green-700' :
                            toastType === 'error' ? 'text-red-700' :
                            'text-blue-700'
                        }`}>{toastMsg}</p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Transcripcion;