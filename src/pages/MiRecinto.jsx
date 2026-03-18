import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertCircle, Loader, Users, ArrowLeft, Building2, FileCheck, Clock, XCircle, Eye, Edit, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalConfirmacion from '../components/ModalConfirmacion';
import useModal from '../hooks/useModal';

const MiRecinto = () => {
    const navigate = useNavigate();

    // Estados principales
    const [recintos, setRecintos] = useState([]);
    const [recintoSeleccionado, setRecintoSeleccionado] = useState(null);
    const [mesas, setMesas] = useState([]);
    const [selectedMesa, setSelectedMesa] = useState(null);
    const [actas, setActas] = useState([]);
    const [frentes, setFrentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para formulario de votos
    const [showRegistrarVotos, setShowRegistrarVotos] = useState(false);
    const [savingVotos, setSavingVotos] = useState(false);
    const [votosAlcalde, setVotosAlcalde] = useState([]);
    const [votosConcejal, setVotosConcejal] = useState([]);
    const [votosNulos, setVotosNulos] = useState('');
    const [votosBlancos, setVotosBlancos] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [imagenActa, setImagenActa] = useState(null);

    // Estados para historial y detalle/edición
    const [actasRecinto, setActasRecinto] = useState([]);
    const [actaDetalle, setActaDetalle] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [editImagenActa, setEditImagenActa] = useState(null);

    // Modal
    const { isOpen, modalConfig, mostrarModal, cerrarModal, mostrarExito, mostrarError } = useModal();

    const API_URL = import.meta.env.VITE_API_URL;
    const BASE_URL = API_URL.replace('/api', '');
    const token = localStorage.getItem('token');

    const toInt = (v) => {
        const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
        return Number.isFinite(n) ? n : 0;
    };

    useEffect(() => {
        cargarRecintos();
        cargarFrentes();
    }, []);

    const cargarRecintos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/permisos/jefe/mi-recinto`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setRecintos(data.data);
                if (data.data.length === 0) {
                    setError('No tienes recintos asignados');
                }
            } else {
                setError(data.message || 'No tienes recintos asignados');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error al cargar recintos');
        } finally {
            setLoading(false);
        }
    };

    const cargarMesasRecinto = async (idRecinto) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/permisos/jefe/mesas-recinto/${idRecinto}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setMesas(data.data);
                if (data.data.length > 0) {
                    setSelectedMesa(data.data[0]);
                }

                // Cargar actas del recinto
                const mesasIds = data.data.map(m => m.id_mesa);
                if (mesasIds.length > 0) {
                    const resActas = await fetch(`${API_URL}/votos`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const dataActas = await resActas.json();

                    if (dataActas.success) {
                        const actasFiltradas = dataActas.data.filter(a =>
                            mesasIds.includes(parseInt(a.id_mesa))
                        );
                        setActasRecinto(actasFiltradas);
                    }
                }
            } else {
                setMesas([]);
                mostrarError('Error', 'No se pudieron cargar las mesas del recinto');
            }
        } catch (err) {
            console.error('Error:', err);
            mostrarError('Error', 'Error al cargar mesas del recinto');
        } finally {
            setLoading(false);
        }
    };

    const cargarFrentes = async () => {
        try {
            const response = await fetch(`${API_URL}/votos/frentes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const votosIniciales = data.data.map((f) => ({
                    id_frente: f.id_frente,
                    nombre: f.nombre,
                    siglas: f.siglas,
                    color: f.color,
                    cantidad: ''
                }));
                setFrentes(data.data);
                setVotosAlcalde(votosIniciales);
                setVotosConcejal(JSON.parse(JSON.stringify(votosIniciales)));
            }
        } catch (error) {
            console.error('Error al cargar frentes:', error);
        }
    };

    const handleSeleccionarRecinto = (recinto) => {
        setRecintoSeleccionado(recinto);
        setSelectedMesa(null);
        setShowRegistrarVotos(false);
        cargarMesasRecinto(recinto.id_recinto);
    };

    const handleVolverRecintos = () => {
        setRecintoSeleccionado(null);
        setMesas([]);
        setSelectedMesa(null);
        setShowRegistrarVotos(false);
        setActasRecinto([]);
        setActaDetalle(null);
        setModoEdicion(false);
    };

    const handleRegistrarVotos = () => {
        if (!selectedMesa) return;

        // Verificar si la mesa ya tiene acta
        const mesaConActa = mesas.find(m => m.id_mesa === selectedMesa.id_mesa);
        if (mesaConActa && mesaConActa.cantidad_actas > 0) {
            mostrarModal(
                'warning',
                'Mesa con Acta Registrada',
                `Esta mesa ya tiene ${mesaConActa.cantidad_actas} acta(s) registrada(s). Solo puedes editar el acta existente.`,
                'Entendido'
            );
            return;
        }

        setShowRegistrarVotos(true);
    };

    const handleSubmitVotos = async (e) => {
        e.preventDefault();

        if (!selectedMesa) {
            mostrarError('Error', 'Debes seleccionar una mesa');
            return;
        }

        const hayVotosAlcalde = votosAlcalde.some((v) => toInt(v.cantidad) > 0);
        const hayVotosConcejal = votosConcejal.some((v) => toInt(v.cantidad) > 0);

        if (!hayVotosAlcalde && !hayVotosConcejal && toInt(votosNulos) === 0 && toInt(votosBlancos) === 0) {
            mostrarError('Error', 'Debe registrar al menos un voto');
            return;
        }

        try {
            setSavingVotos(true);

            const formData = new FormData();
            formData.append('id_mesa', selectedMesa.id_mesa);
            formData.append('id_tipo_eleccion', 1);
            formData.append('votos_nulos', toInt(votosNulos));
            formData.append('votos_blancos', toInt(votosBlancos));
            formData.append('observaciones', observaciones);

            const votosAlcaldeFiltrados = votosAlcalde
                .map((v) => ({ id_frente: v.id_frente, cantidad: toInt(v.cantidad) }))
                .filter((v) => v.cantidad > 0);

            const votosConcejalFiltrados = votosConcejal
                .map((v) => ({ id_frente: v.id_frente, cantidad: toInt(v.cantidad) }))
                .filter((v) => v.cantidad > 0);

            formData.append('votos_alcalde', JSON.stringify(votosAlcaldeFiltrados));
            formData.append('votos_concejal', JSON.stringify(votosConcejalFiltrados));

            if (imagenActa) {
                formData.append('imagen_acta', imagenActa);
            }

            const response = await fetch(`${API_URL}/votos/registrar-acta`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (response.status === 409 && data.existe) {
                // Mesa ya tiene acta
                mostrarModal(
                    'warning',
                    'Acta Existente',
                    'Esta mesa ya tiene un acta registrada. Solo puedes editar el acta existente, no crear una nueva.',
                    'Entendido'
                );
                return;
            }

            if (data.success) {
                mostrarExito(
                    'Acta Registrada',
                    `Los votos de la Mesa ${selectedMesa.numero_mesa} han sido registrados exitosamente. Estado: Pendiente de aprobación.`
                );

                // Resetear formulario
                resetFormulario();
                setShowRegistrarVotos(false);

                // Recargar mesas
                cargarMesasRecinto(recintoSeleccionado.id_recinto);
            } else {
                mostrarError('Error', data.message || 'Error al registrar votos');
            }
        } catch (err) {
            console.error('Error:', err);
            mostrarError('Error', 'Error al registrar votos');
        } finally {
            setSavingVotos(false);
        }
    };

    const resetFormulario = () => {
        setVotosNulos('');
        setVotosBlancos('');
        setObservaciones('');
        setImagenActa(null);

        const votosIniciales = frentes.map((f) => ({
            id_frente: f.id_frente,
            nombre: f.nombre,
            siglas: f.siglas,
            color: f.color,
            cantidad: ''
        }));
        setVotosAlcalde(votosIniciales);
        setVotosConcejal(JSON.parse(JSON.stringify(votosIniciales)));
    };

    // Funciones helper para actas
    const getActasDeMesa = (idMesa) => {
        return actasRecinto.filter(a => parseInt(a.id_mesa) === parseInt(idMesa));
    };

    const getMesaTieneActa = (idMesa) => {
        return getActasDeMesa(idMesa).length > 0;
    };

    const getActaDeMesa = (idMesa) => {
        return actasRecinto.find(a => parseInt(a.id_mesa) === parseInt(idMesa));
    };

    // Funciones de ver y editar actas
    const handleVerDetalle = async (acta) => {
        try {
            const response = await fetch(`${API_URL}/votos/acta/${acta.id_acta}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                // Normalizar estructura: combinar acta y votos en un objeto plano
                setActaDetalle({
                    ...data.data.acta,
                    votos: data.data.votos
                });
                setModoEdicion(false);
            } else {
                mostrarError('Error', 'No se pudo cargar el detalle del acta.');
            }
        } catch (err) {
            console.error('Error:', err);
            mostrarError('Error', 'No se pudo cargar el detalle del acta.');
        }
    };

    const handleEditarActa = async (acta) => {
        // Si no tiene votos detallados, cargar del API
        let actaConVotos = acta;
        if (!acta.votos) {
            try {
                const response = await fetch(`${API_URL}/votos/acta/${acta.id_acta}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    actaConVotos = {
                        ...data.data.acta,
                        votos: data.data.votos
                    };
                }
            } catch (err) {
                console.error('Error al cargar votos para edición:', err);
                mostrarError('Error', 'No se pudieron cargar los datos del acta para edición.');
                return;
            }
        }

        // Preparar formulario con datos existentes
        if (actaConVotos.votos) {
            const votosAlcaldeEdit = frentes.map(f => {
                const votoExistente = actaConVotos.votos.find(v => v.id_frente === f.id_frente && v.tipo_cargo === 'alcalde');
                return {
                    id_frente: f.id_frente,
                    nombre: f.nombre,
                    siglas: f.siglas,
                    color: f.color,
                    cantidad: votoExistente ? String(votoExistente.cantidad) : ''
                };
            });

            const votosConcejalEdit = frentes.map(f => {
                const votoExistente = actaConVotos.votos.find(v => v.id_frente === f.id_frente && v.tipo_cargo === 'concejal');
                return {
                    id_frente: f.id_frente,
                    nombre: f.nombre,
                    siglas: f.siglas,
                    color: f.color,
                    cantidad: votoExistente ? String(votoExistente.cantidad) : ''
                };
            });

            setVotosAlcalde(votosAlcaldeEdit);
            setVotosConcejal(votosConcejalEdit);
        }

        setVotosNulos(String(actaConVotos.votos_nulos || 0));
        setVotosBlancos(String(actaConVotos.votos_blancos || 0));
        setObservaciones(actaConVotos.observaciones || '');
        setModoEdicion(true);
        setActaDetalle(actaConVotos);
    };

    const handleGuardarEdicion = async () => {
        if (!actaDetalle) return;

        try {
            setSavingVotos(true);

            const formData = new FormData();
            formData.append('votos_nulos', toInt(votosNulos));
            formData.append('votos_blancos', toInt(votosBlancos));
            formData.append('observaciones', observaciones);

            const votosAlcaldeFiltrados = votosAlcalde
                .map((v) => ({ id_frente: v.id_frente, cantidad: toInt(v.cantidad) }))
                .filter((v) => v.cantidad > 0);

            const votosConcejalFiltrados = votosConcejal
                .map((v) => ({ id_frente: v.id_frente, cantidad: toInt(v.cantidad) }))
                .filter((v) => v.cantidad > 0);

            formData.append('votos_alcalde', JSON.stringify(votosAlcaldeFiltrados));
            formData.append('votos_concejal', JSON.stringify(votosConcejalFiltrados));

            // Añadir nueva imagen si se seleccionó
            if (editImagenActa) {
                formData.append('imagen_acta', editImagenActa);
            }

            const response = await fetch(`${API_URL}/votos/acta/${actaDetalle.id_acta}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                mostrarExito('Acta Actualizada', 'Los cambios han sido guardados correctamente.');
                setActaDetalle(null);
                setModoEdicion(false);
                setEditImagenActa(null);
                resetFormulario();
                cargarMesasRecinto(recintoSeleccionado.id_recinto);
            } else {
                mostrarError('Error', data.message || 'No se pudo actualizar el acta.');
            }
        } catch (err) {
            console.error('Error:', err);
            mostrarError('Error de Conexión', 'No se pudo conectar con el servidor.');
        } finally {
            setSavingVotos(false);
        }
    };

    const updateVotos = (tipo, idFrente, valueStr) => {
        const setVotos = tipo === 'alcalde' ? setVotosAlcalde : setVotosConcejal;
        setVotos((prev) =>
            prev.map((v) => (v.id_frente === idFrente ? { ...v, cantidad: valueStr } : v))
        );
    };

    const getBadgeEstado = (estado) => {
        switch (estado) {
            case 'aprobado':
                return { text: 'Aprobado', color: 'bg-green-100 text-green-700', icon: CheckCircle };
            case 'rechazado':
                return { text: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle };
            case 'pendiente':
                return { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
            default:
                return { text: 'Sin acta', color: 'bg-gray-100 text-gray-600', icon: AlertCircle };
        }
    };

    if (loading && recintos.length === 0) {
        return (
            <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-[#1E3A8A]" />
            </div>
        );
    }

    if (error && recintos.length === 0) {
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    const totalVotosAlcalde = votosAlcalde.reduce((sum, v) => sum + toInt(v.cantidad), 0);
    const totalVotosConcejal = votosConcejal.reduce((sum, v) => sum + toInt(v.cantidad), 0);
    const totalGeneral = totalVotosAlcalde + totalVotosConcejal + toInt(votosNulos) + toInt(votosBlancos);

    // Vista: Lista de Recintos
    if (!recintoSeleccionado) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <ModalConfirmacion
                    isOpen={isOpen}
                    onClose={cerrarModal}
                    tipo={modalConfig.tipo}
                    titulo={modalConfig.titulo}
                    mensaje={modalConfig.mensaje}
                    botonTexto={modalConfig.botonTexto}
                />

                {/* Header */}
                <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white shadow-lg">
                    <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
                        <div className="py-6">
                            <h1 className="text-2xl md:text-3xl font-bold">Mis Recintos Electorales</h1>
                            <p className="text-sm text-white/80 mt-1">Gestiona los recintos asignados bajo tu responsabilidad</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto py-8">
                    {/* Cards de Recintos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recintos.map((recinto) => {
                            const progreso = recinto.total_mesas > 0
                                ? (recinto.total_actas / recinto.total_mesas) * 100
                                : 0;

                            return (
                                <div
                                    key={recinto.id_recinto}
                                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                                    onClick={() => handleSeleccionarRecinto(recinto)}
                                >
                                    {/* Header del Card */}
                                    <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-white/10 p-2 rounded-lg">
                                                <Building2 className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-bold text-lg truncate">
                                                    {recinto.recinto_nombre}
                                                </h3>
                                                <p className="text-white/70 text-sm truncate">
                                                    {recinto.distrito_nombre || 'Sin distrito'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body del Card */}
                                    <div className="p-4 space-y-4">
                                        {/* Dirección */}
                                        {recinto.direccion && (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {recinto.direccion}
                                            </p>
                                        )}

                                        {/* Estadísticas */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-blue-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-600 font-medium">Total Mesas</p>
                                                <p className="text-2xl font-bold text-[#1E3A8A]">
                                                    {recinto.total_mesas || 0}
                                                </p>
                                            </div>
                                            <div className="bg-green-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-600 font-medium">Actas Registradas</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {recinto.total_actas || 0}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Barra de Progreso */}
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>Progreso</span>
                                                <span className="font-semibold">{progreso.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-[#10B981] to-[#059669] h-2 rounded-full transition-all"
                                                    style={{ width: `${progreso}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Botón Ver Mesas */}
                                        <button
                                            className="w-full bg-[#1E3A8A] text-white py-2 rounded-lg font-medium hover:bg-[#152a63] transition group-hover:bg-[#152a63]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSeleccionarRecinto(recinto);
                                            }}
                                        >
                                            Ver Mesas
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {recintos.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-600 text-lg">No tienes recintos asignados</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Vista: Mesas del Recinto Seleccionado
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <ModalConfirmacion
                isOpen={isOpen}
                onClose={cerrarModal}
                tipo={modalConfig.tipo}
                titulo={modalConfig.titulo}
                mensaje={modalConfig.mensaje}
                botonTexto={modalConfig.botonTexto}
            />

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white shadow-lg sticky top-0 z-10">
                <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6">
                        <div className="min-w-0 flex items-center gap-3">
                            <button
                                onClick={handleVolverRecintos}
                                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg sm:text-2xl font-bold truncate">{recintoSeleccionado.recinto_nombre}</h1>
                                <p className="text-xs sm:text-sm text-white/80 mt-0.5">{mesas.length} mesa(s) disponibles</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRegistrarVotos}
                            disabled={!selectedMesa}
                            className="bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition text-sm sm:text-base whitespace-nowrap"
                        >
                            <Plus size={18} className="sm:w-5 sm:h-5" />
                            Registrar Acta
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Lista de Mesas */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Users size={18} />
                                    Mesas
                                </h3>
                            </div>

                            {loading ? (
                                <div className="p-8 flex justify-center">
                                    <Loader className="w-6 h-6 animate-spin text-[#1E3A8A]" />
                                </div>
                            ) : (
                                <div className="divide-y max-h-[600px] overflow-y-auto">
                                    {mesas.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500 text-sm">
                                            No hay mesas en este recinto
                                        </div>
                                    ) : (
                                        mesas.map((mesa) => {
                                            const isSelected = selectedMesa?.id_mesa === mesa.id_mesa;
                                            const badge = getBadgeEstado(
                                                mesa.cantidad_actas > 0 ? mesa.estado_aprobacion : null
                                            );
                                            const IconoBadge = badge.icon;

                                            return (
                                                <button
                                                    key={mesa.id_mesa}
                                                    onClick={() => setSelectedMesa(mesa)}
                                                    className={`w-full p-4 text-left transition hover:bg-gray-50 ${
                                                        isSelected ? 'bg-[#1E3A8A]/5 border-l-4 border-[#1E3A8A]' : ''
                                                    }`}
                                                >
                                                    <div className="font-semibold text-gray-900 mb-2">
                                                        Mesa {mesa.numero_mesa}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${badge.color}`}>
                                                            <IconoBadge className="w-3 h-3" />
                                                            {badge.text}
                                                        </span>
                                                        {mesa.votos_totales > 0 && (
                                                            <span className="text-xs text-gray-500">
                                                                {mesa.votos_totales} votos
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel Derecho */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Formulario Registrar Votos */}
                        {showRegistrarVotos && selectedMesa && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Plus size={20} className="text-[#10B981]" />
                                    Registrar Acta - Mesa {selectedMesa.numero_mesa}
                                </h2>

                                <form onSubmit={handleSubmitVotos} className="space-y-6">
                                    {/* Votos Alcalde */}
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 mb-3">Votos para Alcalde</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {votosAlcalde.map((frente) => (
                                                <div key={frente.id_frente} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all hover:border-[#F59E0B]">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div
                                                            className="w-5 h-5 rounded flex-shrink-0"
                                                            style={{ backgroundColor: frente.color }}
                                                        />
                                                        <p className="font-bold text-gray-900 text-xs truncate">{frente.siglas}</p>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={String(frente.cantidad ?? '')}
                                                        onChange={(e) => {
                                                            const cleaned = e.target.value.replace(/[^0-9]/g, '');
                                                            updateVotos('alcalde', frente.id_frente, cleaned);
                                                        }}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-center font-bold text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Votos Concejal */}
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 mb-3">Votos para Concejal</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {votosConcejal.map((frente) => (
                                                <div key={frente.id_frente} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all hover:border-[#F59E0B]">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div
                                                            className="w-5 h-5 rounded flex-shrink-0"
                                                            style={{ backgroundColor: frente.color }}
                                                        />
                                                        <p className="font-bold text-gray-900 text-xs truncate">{frente.siglas}</p>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={String(frente.cantidad ?? '')}
                                                        onChange={(e) => {
                                                            const cleaned = e.target.value.replace(/[^0-9]/g, '');
                                                            updateVotos('concejal', frente.id_frente, cleaned);
                                                        }}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-center font-bold text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Nulos y Blancos */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Votos Nulos</label>
                                            <input
                                                type="number"
                                                value={votosNulos}
                                                onChange={(e) => setVotosNulos(e.target.value)}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Votos Blancos</label>
                                            <input
                                                type="number"
                                                value={votosBlancos}
                                                onChange={(e) => setVotosBlancos(e.target.value)}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Observaciones */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                                        <textarea
                                            value={observaciones}
                                            onChange={(e) => setObservaciones(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                            placeholder="Notas adicionales..."
                                            rows="2"
                                        />
                                    </div>

                                    {/* Imagen del Acta */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Foto del Acta (Opcional)</label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,application/pdf"
                                            onChange={(e) => setImagenActa(e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent text-sm"
                                        />
                                        {imagenActa && (
                                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                {imagenActa.name} ({(imagenActa.size / 1024).toFixed(2)} KB)
                                            </p>
                                        )}
                                    </div>

                                    {/* Resumen */}
                                    <div className="bg-gradient-to-r from-[#1E3A8A]/5 to-[#10B981]/5 p-4 rounded-lg border border-[#1E3A8A]/20">
                                        <div className="text-xs text-gray-600 space-y-1">
                                            <p><span className="font-semibold">Alcalde:</span> {totalVotosAlcalde} votos</p>
                                            <p><span className="font-semibold">Concejal:</span> {totalVotosConcejal} votos</p>
                                            <p><span className="font-semibold">Nulos:</span> {toInt(votosNulos)} | <span className="font-semibold">Blancos:</span> {toInt(votosBlancos)}</p>
                                        </div>
                                        <p className="text-sm font-bold text-[#1E3A8A] mt-2">Total General: {totalGeneral} votos</p>
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowRegistrarVotos(false);
                                                resetFormulario();
                                            }}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={savingVotos}
                                            className="flex-1 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                                        >
                                            {savingVotos ? (
                                                <>
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <FileCheck className="w-4 h-4" />
                                                    Registrar Acta
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Historial de Actas - Panel Completo */}
                        {selectedMesa && !showRegistrarVotos && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white flex items-center justify-between">
                                    <h2 className="text-lg font-bold">Historial de Actas - Mesa {selectedMesa.numero_mesa}</h2>
                                    {getMesaTieneActa(selectedMesa.id_mesa) && (
                                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                            {getActasDeMesa(selectedMesa.id_mesa).length} acta(s) registrada(s)
                                        </span>
                                    )}
                                </div>

                                {!getMesaTieneActa(selectedMesa.id_mesa) ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="mb-4">No hay actas registradas para esta mesa</p>
                                        <button
                                            onClick={handleRegistrarVotos}
                                            className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition text-sm font-medium"
                                        >
                                            Registrar Primera Acta
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {getActasDeMesa(selectedMesa.id_mesa).map(acta => {
                                            const badge = getBadgeEstado(acta.estado_aprobacion);
                                            const IconoBadge = badge.icon;

                                            return (
                                                <div key={acta.id_acta} className="p-4 hover:bg-gray-50 transition">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.color}`}>
                                                                    <IconoBadge className="w-3 h-3" />
                                                                    {badge.text}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(acta.fecha_registro).toLocaleDateString('es-ES', {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-gray-500 text-xs">V. Válidos</p>
                                                                    <p className="font-bold text-[#1E3A8A]">{acta.votos_validos || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 text-xs">V. Nulos</p>
                                                                    <p className="font-semibold text-gray-900">{acta.votos_nulos || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 text-xs">V. Blancos</p>
                                                                    <p className="font-semibold text-gray-900">{acta.votos_blancos || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 text-xs">Total</p>
                                                                    <p className="font-bold text-green-600">{acta.votos_totales || 0}</p>
                                                                </div>
                                                            </div>

                                                            {acta.estado_aprobacion === 'rechazado' && acta.motivo_rechazo && (
                                                                <div className="mt-3 p-2 bg-red-50 rounded-lg">
                                                                    <p className="text-xs text-red-600 font-medium">Motivo de rechazo:</p>
                                                                    <p className="text-xs text-red-700">{acta.motivo_rechazo}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={() => handleVerDetalle(acta)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Ver detalle"
                                                            >
                                                                <Eye className="w-5 h-5" />
                                                            </button>
                                                            {(acta.estado_aprobacion === 'pendiente' || acta.estado_aprobacion === 'rechazado') && (
                                                                <button
                                                                    onClick={() => handleEditarActa(acta)}
                                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                                                    title="Editar acta"
                                                                >
                                                                    <Edit className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Detalle/Edición */}
            {actaDetalle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => { setActaDetalle(null); setModoEdicion(false); setEditImagenActa(null); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                            <h3 className="text-xl font-bold">
                                {modoEdicion ? 'Editar Acta' : 'Detalle del Acta'} - Mesa {selectedMesa?.numero_mesa}
                            </h3>
                            <button
                                onClick={() => { setActaDetalle(null); setModoEdicion(false); setEditImagenActa(null); }}
                                className="text-white/80 hover:text-white transition"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {modoEdicion ? (
                                // Formulario de edición
                                <div className="space-y-6">
                                    {/* Votos Alcalde */}
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 mb-3">Votos para Alcalde</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {votosAlcalde.map((frente) => (
                                                <div key={frente.id_frente} className="bg-white rounded-lg border border-gray-200 p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-5 h-5 rounded" style={{ backgroundColor: frente.color }} />
                                                        <p className="font-bold text-gray-900 text-xs">{frente.siglas}</p>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={String(frente.cantidad ?? '')}
                                                        onChange={(e) => updateVotos('alcalde', frente.id_frente, e.target.value.replace(/[^0-9]/g, ''))}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-center font-bold text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Votos Concejal */}
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 mb-3">Votos para Concejal</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {votosConcejal.map((frente) => (
                                                <div key={frente.id_frente} className="bg-white rounded-lg border border-gray-200 p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-5 h-5 rounded" style={{ backgroundColor: frente.color }} />
                                                        <p className="font-bold text-gray-900 text-xs">{frente.siglas}</p>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={String(frente.cantidad ?? '')}
                                                        onChange={(e) => updateVotos('concejal', frente.id_frente, e.target.value.replace(/[^0-9]/g, ''))}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-center font-bold text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Nulos, Blancos, Observaciones */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Votos Nulos</label>
                                            <input
                                                type="number"
                                                value={votosNulos}
                                                onChange={(e) => setVotosNulos(e.target.value)}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Votos Blancos</label>
                                            <input
                                                type="number"
                                                value={votosBlancos}
                                                onChange={(e) => setVotosBlancos(e.target.value)}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                                        <textarea
                                            value={observaciones}
                                            onChange={(e) => setObservaciones(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            rows="2"
                                        />
                                    </div>

                                    {/* Nueva imagen */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cambiar Foto del Acta (Opcional)
                                        </label>
                                        {actaDetalle.imagen_url && (
                                            <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4 text-gray-500" />
                                                <span className="text-xs text-gray-600">Imagen actual existente</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,application/pdf"
                                            onChange={(e) => setEditImagenActa(e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                        {editImagenActa && (
                                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Nueva imagen: {editImagenActa.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => { setModoEdicion(false); resetFormulario(); setEditImagenActa(null); }}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleGuardarEdicion}
                                            disabled={savingVotos}
                                            className="flex-1 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                                        >
                                            {savingVotos ? (
                                                <>
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <FileCheck className="w-4 h-4" />
                                                    Guardar Cambios
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Vista de detalle
                                <div className="space-y-6">
                                    {/* Estado */}
                                    <div className="flex items-center gap-3">
                                        {(() => {
                                            const badge = getBadgeEstado(actaDetalle.estado_aprobacion);
                                            const IconoBadge = badge.icon;
                                            return (
                                                <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${badge.color}`}>
                                                    <IconoBadge className="w-4 h-4" />
                                                    {badge.text}
                                                </span>
                                            );
                                        })()}
                                        <span className="text-sm text-gray-500">
                                            Registrado el {new Date(actaDetalle.fecha_registro).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {/* Resumen de votos */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                                            <p className="text-xs text-gray-600">V. Válidos</p>
                                            <p className="text-2xl font-bold text-[#1E3A8A]">{actaDetalle.votos_validos || 0}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <p className="text-xs text-gray-600">V. Nulos</p>
                                            <p className="text-2xl font-bold text-gray-700">{actaDetalle.votos_nulos || 0}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <p className="text-xs text-gray-600">V. Blancos</p>
                                            <p className="text-2xl font-bold text-gray-700">{actaDetalle.votos_blancos || 0}</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg text-center">
                                            <p className="text-xs text-gray-600">Total</p>
                                            <p className="text-2xl font-bold text-green-600">{actaDetalle.votos_totales || 0}</p>
                                        </div>
                                    </div>

                                    {/* Votos por frente */}
                                    {actaDetalle.votos && actaDetalle.votos.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3">Votos por Frente</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-2">Alcalde</p>
                                                    <div className="space-y-2">
                                                        {actaDetalle.votos.filter(v => v.tipo_cargo === 'alcalde').map(v => (
                                                            <div key={v.id_voto} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                                <span className="text-sm">{v.frente_nombre || v.siglas}</span>
                                                                <span className="font-bold">{v.cantidad}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-2">Concejal</p>
                                                    <div className="space-y-2">
                                                        {actaDetalle.votos.filter(v => v.tipo_cargo === 'concejal').map(v => (
                                                            <div key={v.id_voto} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                                <span className="text-sm">{v.frente_nombre || v.siglas}</span>
                                                                <span className="font-bold">{v.cantidad}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Imagen del acta */}
                                    {actaDetalle.imagen_url && (
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3">Imagen del Acta</h4>
                                            <img
                                                src={`${BASE_URL}${actaDetalle.imagen_url}`}
                                                alt="Acta"
                                                className="w-full max-h-96 object-contain rounded-lg border"
                                            />
                                        </div>
                                    )}

                                    {/* Observaciones */}
                                    {actaDetalle.observaciones && (
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-2">Observaciones</h4>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{actaDetalle.observaciones}</p>
                                        </div>
                                    )}

                                    {/* Motivo de rechazo */}
                                    {actaDetalle.estado_aprobacion === 'rechazado' && actaDetalle.motivo_rechazo && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <h4 className="font-bold text-red-800 mb-2">Motivo del Rechazo</h4>
                                            <p className="text-sm text-red-700">{actaDetalle.motivo_rechazo}</p>
                                        </div>
                                    )}

                                    {/* Botón editar */}
                                    {(actaDetalle.estado_aprobacion === 'pendiente' || actaDetalle.estado_aprobacion === 'rechazado') && (
                                        <button
                                            onClick={() => handleEditarActa(actaDetalle)}
                                            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
                                        >
                                            <Edit className="w-5 h-5" />
                                            Editar Acta
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MiRecinto;
