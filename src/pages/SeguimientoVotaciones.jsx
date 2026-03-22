import React, { useState, useEffect } from 'react';
import {
    ClipboardCheck,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Search,
    Filter,
    Building2,
    Users,
    FileText,
    ChevronDown,
    ChevronUp,
    Eye,
    ThumbsUp,
    ThumbsDown,
    Loader,
    MapPin,
    TrendingUp,
    BarChart3,
    RefreshCw,
    User
} from 'lucide-react';
import ModalConfirmacion from '../components/ModalConfirmacion';
import useModal from '../hooks/useModal';

const SeguimientoVotaciones = () => {
    const [mesas, setMesas] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todos'); // todos, con_acta, sin_acta, pendientes, aprobadas, rechazadas
    const [busqueda, setBusqueda] = useState('');
    const [mesaExpandida, setMesaExpandida] = useState(null);
    const [mesaDetalle, setMesaDetalle] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [errorImagen, setErrorImagen] = useState(false);

    // Modal para aprobar/rechazar
    const [modalAccion, setModalAccion] = useState({ open: false, tipo: '', mesa: null });
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [procesando, setProcesando] = useState(false);

    // Modal de confirmacion
    const { isOpen, modalConfig, cerrarModal, mostrarExito, mostrarError } = useModal();

    const API_URL = import.meta.env.VITE_API_URL;
    const BASE_URL = API_URL.replace('/api', '');
    const token = localStorage.getItem('token');

    useEffect(() => {
        cargarSeguimiento();
    }, []);

    const cargarSeguimiento = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/votos/seguimiento`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setMesas(data.data.mesas || []);
                setEstadisticas(data.data.estadisticas || null);
            } else {
                mostrarError('Error', data.message || 'No se pudo cargar el seguimiento');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de Conexion', 'No se pudo conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const cargarDetalleMesa = async (idActa) => {
        if (!idActa) return;

        try {
            setLoadingDetalle(true);
            setErrorImagen(false);
            const response = await fetch(`${API_URL}/votos/acta/${idActa}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setMesaDetalle(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const handleAprobar = async () => {
        if (!modalAccion.mesa?.id_acta_ultima) return;

        try {
            setProcesando(true);
            const response = await fetch(`${API_URL}/votos/acta/${modalAccion.mesa.id_acta_ultima}/aprobar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                // Actualizar el estado local inmediatamente
                setMesas(prevMesas =>
                    prevMesas.map(mesa =>
                        mesa.id_mesa === modalAccion.mesa.id_mesa
                            ? { ...mesa, estado_mesa: 'aprobado', estado_aprobacion: 'aprobado', ya_actualizado: true }
                            : mesa
                    )
                );

                // Actualizar estadísticas inmediatamente
                if (estadisticas) {
                    setEstadisticas(prev => ({
                        ...prev,
                        actas_pendientes: Math.max(0, prev.actas_pendientes - 1),
                        actas_aprobadas: prev.actas_aprobadas + 1
                    }));
                }

                mostrarExito('Acta Aprobada', 'El acta ha sido aprobada correctamente.');
                setModalAccion({ open: false, tipo: '', mesa: null });

                // Recargar desde el servidor después para confirmar y sincronizar
                setTimeout(() => cargarSeguimiento(), 500);
            } else {
                mostrarError('Error', data.message || 'No se pudo aprobar el acta');
                // Cerrar modal también en caso de error
                setModalAccion({ open: false, tipo: '', mesa: null });
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error', 'Error de conexion al aprobar');
            // Cerrar modal en caso de error
            setModalAccion({ open: false, tipo: '', mesa: null });
        } finally {
            setProcesando(false);
        }
    };

    const handleRechazar = async () => {
        if (!modalAccion.mesa?.id_acta_ultima || !motivoRechazo.trim()) {
            mostrarError('Motivo Requerido', 'Debes ingresar el motivo del rechazo');
            return;
        }

        try {
            setProcesando(true);
            const response = await fetch(`${API_URL}/votos/acta/${modalAccion.mesa.id_acta_ultima}/rechazar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ motivo: motivoRechazo })
            });

            const data = await response.json();

            if (data.success) {
                // Actualizar el estado local inmediatamente
                setMesas(prevMesas =>
                    prevMesas.map(mesa =>
                        mesa.id_mesa === modalAccion.mesa.id_mesa
                            ? {
                                ...mesa,
                                estado_mesa: 'rechazado',
                                estado_aprobacion: 'rechazado',
                                motivo_rechazo: motivoRechazo,
                                ya_actualizado: true
                            }
                            : mesa
                    )
                );

                // Actualizar estadísticas inmediatamente
                if (estadisticas) {
                    setEstadisticas(prev => ({
                        ...prev,
                        actas_pendientes: Math.max(0, prev.actas_pendientes - 1),
                        actas_rechazadas: prev.actas_rechazadas + 1
                    }));
                }

                mostrarExito('Acta Rechazada', 'El acta ha sido rechazada. El delegado debera corregirla.');
                setModalAccion({ open: false, tipo: '', mesa: null });
                setMotivoRechazo('');

                // Recargar desde el servidor después para confirmar y sincronizar
                setTimeout(() => cargarSeguimiento(), 500);
            } else {
                mostrarError('Error', data.message || 'No se pudo rechazar el acta');
                // Cerrar modal también en caso de error
                setModalAccion({ open: false, tipo: '', mesa: null });
                setMotivoRechazo('');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error', 'Error de conexion al rechazar');
            // Cerrar modal en caso de error
            setModalAccion({ open: false, tipo: '', mesa: null });
            setMotivoRechazo('');
        } finally {
            setProcesando(false);
        }
    };

    const getBadgeEstado = (estado) => {
        switch (estado) {
            case 'aprobado':
                return { text: 'Aprobado', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
            case 'rechazado':
                return { text: 'Rechazado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle };
            case 'pendiente':
                return { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock };
            case 'sin_acta':
            default:
                return { text: 'Sin Acta', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: AlertCircle };
        }
    };

    const getJerarquiaString = (mesa) => {
        if (!mesa.jerarquia_nombres || mesa.jerarquia_nombres.length === 0) {
            return mesa.nombre_recinto || 'Sin ubicacion';
        }
        return mesa.jerarquia_nombres.join(' > ');
    };

    // Funcion auxiliar para obtener el distrito de una mesa
    const getDistritoMesa = (mesa) => {
        // Primero verificar si el backend ya extrajo el distrito
        if (mesa.distrito_nombre) return mesa.distrito_nombre;

        // Buscar en jerarquia un elemento que empiece con "distrito" (case insensitive)
        if (mesa.jerarquia_nombres) {
            const distritoEncontrado = mesa.jerarquia_nombres.find(j =>
                j.toLowerCase().startsWith('distrito')
            );
            if (distritoEncontrado) return distritoEncontrado;
        }
        return null;
    };

    // Filtrar mesas
    const mesasFiltradas = mesas.filter(mesa => {
        // Filtro por estado - Ser muy explícito
        if (filtro === 'con_acta' && (mesa.cantidad_actas === 0 || !mesa.cantidad_actas)) return false;
        if (filtro === 'sin_acta' && (mesa.cantidad_actas > 0 || mesa.cantidad_actas)) return false;

        // Para pendientes: SOLO mostrar si el estado es explícitamente 'pendiente'
        if (filtro === 'pendientes') {
            const estado = (mesa.estado_mesa || '').toLowerCase();
            if (estado !== 'pendiente') {
                return false;
            }
        }

        if (filtro === 'aprobadas') {
            const estado = (mesa.estado_mesa || '').toLowerCase();
            if (estado !== 'aprobado' && estado !== 'aprobada' && estado !== 'approved') return false;
        }

        if (filtro === 'rechazadas') {
            const estado = (mesa.estado_mesa || '').toLowerCase();
            if (estado !== 'rechazado' && estado !== 'rechazada' && estado !== 'rejected') return false;
        }

        // Filtro por busqueda
        if (busqueda) {
            const term = busqueda.toLowerCase().trim();
            const matchMesa = mesa.numero_mesa?.toString().includes(term);
            const matchRecinto = mesa.nombre_recinto?.toLowerCase().includes(term);
            const matchDelegado = mesa.nombre_delegado?.toLowerCase().includes(term);
            const matchJefe = mesa.nombre_jefe?.toLowerCase().includes(term);
            const matchCodigo = mesa.codigo_mesa?.toLowerCase().includes(term);

            // Busqueda por distrito - case insensitive
            const distritoMesa = getDistritoMesa(mesa);
            let matchDistrito = false;
            if (distritoMesa) {
                const distritoLower = distritoMesa.toLowerCase();
                // Comparacion case insensitive
                // Ej: busqueda="distrito 1" distrito="Distrito 1" -> match
                // Ej: busqueda="DISTRITO 1" distrito="Distrito 1" -> match
                // Ej: busqueda="1" distrito="Distrito 1" -> match (por numero)
                matchDistrito = distritoLower.includes(term) || term.includes(distritoLower);

                // Si buscan solo un numero, verificar si el distrito tiene ese numero
                if (!matchDistrito && /^\d+$/.test(term)) {
                    const numeroEnDistrito = distritoMesa.match(/\d+/);
                    if (numeroEnDistrito && numeroEnDistrito[0] === term) {
                        matchDistrito = true;
                    }
                }

                // Busqueda especial: "distrito X" donde X es numero
                // Normalizar la busqueda removiendo espacios extras
                if (!matchDistrito && term.includes('distrito')) {
                    const numBusqueda = term.replace(/distrito/gi, '').trim();
                    const numDistrito = distritoMesa.toLowerCase().replace(/distrito/gi, '').trim();
                    if (numBusqueda && numDistrito && numBusqueda === numDistrito) {
                        matchDistrito = true;
                    }
                }
            }

            // Busqueda en jerarquia completa
            const matchJerarquia = mesa.jerarquia_nombres?.some(j => j.toLowerCase().includes(term));

            return matchMesa || matchRecinto || matchDelegado || matchJefe || matchJerarquia || matchDistrito || matchCodigo;
        }

        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-[#1E3A8A]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Modal de Confirmacion */}
            <ModalConfirmacion
                isOpen={isOpen}
                onClose={cerrarModal}
                tipo={modalConfig.tipo}
                titulo={modalConfig.titulo}
                mensaje={modalConfig.mensaje}
                botonTexto={modalConfig.botonTexto}
            />

            {/* Modal de Aprobar/Rechazar */}
            {modalAccion.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setModalAccion({ open: false, tipo: '', mesa: null })} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                            modalAccion.tipo === 'aprobar' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                        }`}>
                            {modalAccion.tipo === 'aprobar' ? (
                                <ThumbsUp className="w-8 h-8 text-green-500" />
                            ) : (
                                <ThumbsDown className="w-8 h-8 text-red-500" />
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            {modalAccion.tipo === 'aprobar' ? 'Aprobar Acta' : 'Rechazar Acta'}
                        </h3>

                        <p className="text-gray-600 text-center mb-4">
                            Mesa <strong>{modalAccion.mesa?.numero_mesa}</strong> - {modalAccion.mesa?.nombre_recinto}
                        </p>

                        {modalAccion.tipo === 'rechazar' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo del Rechazo <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Describe el motivo por el cual rechazas esta acta..."
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setModalAccion({ open: false, tipo: '', mesa: null });
                                    setMotivoRechazo('');
                                }}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                                disabled={procesando}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={modalAccion.tipo === 'aprobar' ? handleAprobar : handleRechazar}
                                disabled={procesando || (modalAccion.tipo === 'rechazar' && !motivoRechazo.trim())}
                                className={`flex-1 py-3 px-4 rounded-xl text-white font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                                    modalAccion.tipo === 'aprobar'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {procesando && <Loader className="w-4 h-4 animate-spin" />}
                                {modalAccion.tipo === 'aprobar' ? 'Aprobar' : 'Rechazar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalle */}
            {mesaDetalle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMesaDetalle(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <h3 className="text-xl font-bold">
                                Detalle del Acta - Mesa {mesaDetalle.acta?.numero_mesa}
                            </h3>
                            <button onClick={() => setMesaDetalle(null)} className="text-white/80 hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Estado y Resumen */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <p className="text-xs text-gray-600">V. Validos</p>
                                    <p className="text-2xl font-bold text-[#1E3A8A]">{mesaDetalle.acta?.votos_validos || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <p className="text-xs text-gray-600">V. Nulos</p>
                                    <p className="text-2xl font-bold text-gray-700">{mesaDetalle.acta?.votos_nulos || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <p className="text-xs text-gray-600">V. Blancos</p>
                                    <p className="text-2xl font-bold text-gray-700">{mesaDetalle.acta?.votos_blancos || 0}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-center">
                                    <p className="text-xs text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-green-600">{mesaDetalle.acta?.votos_totales || 0}</p>
                                </div>
                            </div>

                            {/* Votos por frente */}
                            {mesaDetalle.votos && mesaDetalle.votos.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3">Votos por Frente</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 mb-2">Alcalde</p>
                                            <div className="space-y-2">
                                                {mesaDetalle.votos.filter(v => v.tipo_cargo === 'alcalde').map(v => (
                                                    <div key={v.id_voto} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: v.color }} />
                                                            <span className="text-sm">{v.siglas}</span>
                                                        </div>
                                                        <span className="font-bold">{v.cantidad}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 mb-2">Concejal</p>
                                            <div className="space-y-2">
                                                {mesaDetalle.votos.filter(v => v.tipo_cargo === 'concejal').map(v => (
                                                    <div key={v.id_voto} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: v.color }} />
                                                            <span className="text-sm">{v.siglas}</span>
                                                        </div>
                                                        <span className="font-bold">{v.cantidad}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Imagen del acta */}
                            {mesaDetalle.acta?.imagen_url && (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3">📸 Imagen del Acta</h4>
                                    {!errorImagen ? (
                                        <img
                                            src={`${BASE_URL}${mesaDetalle.acta.imagen_url}`}
                                            alt="Acta"
                                            className="w-full max-h-96 object-contain rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition"
                                            onClick={() => window.open(`${BASE_URL}${mesaDetalle.acta.imagen_url}`, '_blank')}
                                            onError={() => setErrorImagen(true)}
                                        />
                                    ) : (
                                        <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
                                            <p className="text-red-600 font-medium">No se pudo cargar la imagen</p>
                                            <p className="text-xs text-gray-500 mt-1">La ruta podría estar incorrecta</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white shadow-lg">
                <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
                    <div className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                                <ClipboardCheck className="w-8 h-8" />
                                Seguimiento de Votaciones
                            </h1>
                            <p className="text-sm text-white/80 mt-1">Control y aprobacion de actas electorales</p>
                        </div>
                        <button
                            onClick={cargarSeguimiento}
                            className="self-start md:self-auto bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Actualizar
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto py-6">
                {/* Estadisticas */}
                {estadisticas && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Total Mesas</p>
                                    <p className="text-xl font-bold text-gray-900">{estadisticas.total_mesas}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Con Acta</p>
                                    <p className="text-xl font-bold text-green-600">{estadisticas.mesas_con_acta}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Sin Acta</p>
                                    <p className="text-xl font-bold text-gray-600">{estadisticas.mesas_sin_acta}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Pendientes</p>
                                    <p className="text-xl font-bold text-yellow-600">{estadisticas.actas_pendientes}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Aprobadas</p>
                                    <p className="text-xl font-bold text-green-600">{estadisticas.actas_aprobadas}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Rechazadas</p>
                                    <p className="text-xl font-bold text-red-600">{estadisticas.actas_rechazadas}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtros y Busqueda */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Busqueda */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por mesa, recinto, distrito, delegado o jefe..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                            />
                        </div>

                        {/* Filtros */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'todos', label: 'Todos', count: mesas.length },
                                { value: 'con_acta', label: 'Con Acta', count: estadisticas?.mesas_con_acta },
                                { value: 'sin_acta', label: 'Sin Acta', count: estadisticas?.mesas_sin_acta },
                                { value: 'pendientes', label: 'Pendientes', count: estadisticas?.actas_pendientes },
                                { value: 'aprobadas', label: 'Aprobadas', count: estadisticas?.actas_aprobadas },
                                { value: 'rechazadas', label: 'Rechazadas', count: estadisticas?.actas_rechazadas }
                            ].map(f => (
                                <button
                                    key={f.value}
                                    onClick={() => setFiltro(f.value)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                                        filtro === f.value
                                            ? 'bg-[#1E3A8A] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {f.label}
                                    {f.count !== undefined && (
                                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                                            filtro === f.value ? 'bg-white/20' : 'bg-gray-200'
                                        }`}>
                                            {f.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lista de Mesas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white">
                        <h2 className="text-lg font-bold">
                            Mesas Electorales ({mesasFiltradas.length})
                        </h2>
                    </div>

                    {mesasFiltradas.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No se encontraron mesas con los filtros aplicados</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {mesasFiltradas.map(mesa => {
                                const badge = getBadgeEstado(mesa.estado_mesa);
                                const IconoBadge = badge.icon;
                                const isExpanded = mesaExpandida === mesa.id_mesa;

                                return (
                                    <div key={mesa.id_mesa} className="hover:bg-gray-50 transition">
                                        {/* Fila principal */}
                                        <div
                                            className="p-4 cursor-pointer"
                                            onClick={() => setMesaExpandida(isExpanded ? null : mesa.id_mesa)}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Numero de Mesa */}
                                                <div className="w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#152a63] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                                                    {mesa.numero_mesa}
                                                </div>

                                                {/* Info principal */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-gray-900">
                                                            {mesa.codigo_mesa && <span className="text-[#1E3A8A]">[{mesa.codigo_mesa}]</span>} Mesa {mesa.numero_mesa} - {mesa.nombre_recinto || 'Sin Recinto'}
                                                        </h3>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${badge.color}`}>
                                                            <IconoBadge className="w-3 h-3" />
                                                            {badge.text}
                                                        </span>
                                                    </div>

                                                    {/* Distrito */}
                                                    {getDistritoMesa(mesa) && (
                                                        <p className="text-sm text-[#1E3A8A] font-semibold mt-1">
                                                            Distrito: {getDistritoMesa(mesa)}
                                                        </p>
                                                    )}

                                                    {/* Jerarquia */}
                                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {getJerarquiaString(mesa)}
                                                    </p>

                                                    {/* Delegado y Jefe */}
                                                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
                                                        {mesa.nombre_delegado && (
                                                            <span className="flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                Delegado: <strong>{mesa.nombre_delegado}</strong>
                                                            </span>
                                                        )}
                                                        {mesa.nombre_jefe && (
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                Jefe: <strong>{mesa.nombre_jefe}</strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Votos totales si tiene acta */}
                                                {mesa.cantidad_actas > 0 && (
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-xs text-gray-500">Votos</p>
                                                        <p className="text-xl font-bold text-[#1E3A8A]">{mesa.votos_totales || 0}</p>
                                                    </div>
                                                )}

                                                {/* Icono expandir */}
                                                <div className="flex-shrink-0">
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contenido expandido */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 bg-gray-50 border-t">
                                                <div className="pt-4 flex flex-wrap gap-3">
                                                    {mesa.cantidad_actas > 0 && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    cargarDetalleMesa(mesa.id_acta_ultima);
                                                                }}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                Ver Detalle
                                                            </button>

                                                            {mesa.estado_mesa !== 'aprobado' && mesa.estado_mesa !== 'rechazado' && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setModalAccion({ open: true, tipo: 'aprobar', mesa });
                                                                        }}
                                                                        disabled={procesando}
                                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {procesando && modalAccion.mesa?.id_mesa === mesa.id_mesa ? (
                                                                            <Loader className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <ThumbsUp className="w-4 h-4" />
                                                                        )}
                                                                        {procesando && modalAccion.mesa?.id_mesa === mesa.id_mesa ? 'Procesando...' : 'Aprobar'}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setModalAccion({ open: true, tipo: 'rechazar', mesa });
                                                                        }}
                                                                        disabled={procesando}
                                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {procesando && modalAccion.mesa?.id_mesa === mesa.id_mesa ? (
                                                                            <Loader className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <ThumbsDown className="w-4 h-4" />
                                                                        )}
                                                                        {procesando && modalAccion.mesa?.id_mesa === mesa.id_mesa ? 'Procesando...' : 'Rechazar'}
                                                                    </button>
                                                                </>
                                                            )}

                                                            {mesa.estado_mesa === 'aprobado' && (
                                                                <div className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Acta ya aprobada
                                                                </div>
                                                            )}

                                                            {mesa.estado_mesa === 'rechazado' && (
                                                                <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                                                    <XCircle className="w-4 h-4" />
                                                                    Acta rechazada - Requiere corrección
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    {mesa.cantidad_actas === 0 && (
                                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4" />
                                                            Esta mesa aun no tiene acta registrada
                                                        </div>
                                                    )}

                                                    {mesa.estado_mesa === 'rechazado' && mesa.motivo_rechazo && (
                                                        <div className="w-full mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                            <p className="text-xs font-medium text-red-800">Motivo del rechazo:</p>
                                                            <p className="text-sm text-red-700">{mesa.motivo_rechazo}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeguimientoVotaciones;
