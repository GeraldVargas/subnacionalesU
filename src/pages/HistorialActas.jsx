import React, { useState, useEffect } from 'react';
import {
    FileText,
    Clock,
    User,
    MapPin,
    CheckCircle,
    AlertCircle,
    Building2,
    Grid3x3,
    Filter,
    Search,
    Calendar,
    TrendingUp,
    Eye,
    Edit,
    Save,
    X,
    ShieldCheck,
    ClipboardCheck,
    ChevronRight,
    Image as ImageIcon,
    Hash,
    Award,
    Target,
    Percent,
    Download
} from 'lucide-react';

const HistorialActas = () => {
    const [actas, setActas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [actaSeleccionada, setActaSeleccionada] = useState(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [mostrarEdicion, setMostrarEdicion] = useState(false);
    const [frentes, setFrentes] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [errorImagen, setErrorImagen] = useState(false);
    
    // Estados para edición
    const [votosAlcalde, setVotosAlcalde] = useState([]);
    const [votosConcejal, setVotosConcejal] = useState([]);
    const [votosNulos, setVotosNulos] = useState(0);
    const [votosBlancos, setVotosBlancos] = useState(0);
    const [observaciones, setObservaciones] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // 🔥 IMPORTANTE: La URL base para archivos estáticos (sin /api)
    const BASE_URL = API_URL.replace('/api', ''); // Elimina /api si existe

    const token = localStorage.getItem('token');

    const cargarActas = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/votos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                setActas(data.data);
            }
        } catch (error) {
            console.error('Error al cargar actas:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarDetalleActa = async (id) => {
        try {
            setErrorImagen(false);
            const response = await fetch(`${API_URL}/votos/acta/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                setActaSeleccionada(data.data);
                setMostrarDetalle(true);
            }
        } catch (error) {
            console.error('Error al cargar detalle:', error);
        }
    };

    const cargarFrentes = async () => {
        try {
            const response = await fetch(`${API_URL}/votos/frentes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setFrentes(data.data);
            }
        } catch (error) {
            console.error('Error al cargar frentes:', error);
        }
    };

    const iniciarEdicion = async (id) => {
        try {
            const response = await fetch(`${API_URL}/votos/acta/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                setActaSeleccionada(data.data);
                
                if (frentes.length === 0) {
                    await cargarFrentes();
                }
                
                const votosAlcaldeMap = new Map();
                const votosConcejalesMap = new Map();
                
                data.data.votos.forEach(voto => {
                    if (voto.tipo_cargo === 'alcalde') {
                        votosAlcaldeMap.set(voto.id_frente, voto.cantidad);
                    } else if (voto.tipo_cargo === 'concejal') {
                        votosConcejalesMap.set(voto.id_frente, voto.cantidad);
                    }
                });
                
                const votosAlcaldeArray = frentes.map(f => ({
                    id_frente: f.id_frente,
                    cantidad: votosAlcaldeMap.get(f.id_frente) || 0
                }));
                
                const votosConcejalArray = frentes.map(f => ({
                    id_frente: f.id_frente,
                    cantidad: votosConcejalesMap.get(f.id_frente) || 0
                }));
                
                setVotosAlcalde(votosAlcaldeArray);
                setVotosConcejal(votosConcejalArray);
                setVotosNulos(parseInt(data.data.acta.votos_nulos) || 0);
                setVotosBlancos(parseInt(data.data.acta.votos_blancos) || 0);
                setObservaciones(data.data.acta.observaciones || '');
                
                setMostrarEdicion(true);
                setMostrarDetalle(false);
            }
        } catch (error) {
            console.error('Error al iniciar edición:', error);
            alert('Error al cargar datos para edición');
        }
    };

    const guardarEdicion = async () => {
        try {
            setGuardando(true);
            
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No estás autenticado. Por favor inicia sesión.');
                return;
            }

            const votosAlcaldeFiltrados = votosAlcalde
                .filter(v => v.cantidad > 0)
                .map(v => ({ id_frente: v.id_frente, cantidad: v.cantidad }));
                
            const votosConcejalFiltrados = votosConcejal
                .filter(v => v.cantidad > 0)
                .map(v => ({ id_frente: v.id_frente, cantidad: v.cantidad }));

            const response = await fetch(`${API_URL}/votos/acta/${actaSeleccionada.acta.id_acta}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    votos_nulos: parseInt(votosNulos) || 0,
                    votos_blancos: parseInt(votosBlancos) || 0,
                    observaciones,
                    votos_alcalde: votosAlcaldeFiltrados,
                    votos_concejal: votosConcejalFiltrados
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Acta editada exitosamente');
                setMostrarEdicion(false);
                cargarActas();
            } else {
                alert('Error: ' + (data.message || 'Error al guardar los cambios'));
            }
        } catch (error) {
            console.error('Error al guardar edición:', error);
            alert('Error al guardar los cambios');
        } finally {
            setGuardando(false);
        }
    };

    useEffect(() => {
        const handleActaRegistrada = () => {
            cargarActas();
        };
        
        window.addEventListener('acta-registrada', handleActaRegistrada);
        
        return () => {
            window.removeEventListener('acta-registrada', handleActaRegistrada);
        };
    }, []);

    const actualizarVoto = (tipo, idFrente, cantidad) => {
        const setter = tipo === 'alcalde' ? setVotosAlcalde : setVotosConcejal;
        const votos = tipo === 'alcalde' ? votosAlcalde : votosConcejal;
        
        const nuevosVotos = votos.map(v => 
            v.id_frente === idFrente ? { ...v, cantidad } : v
        );
        setter(nuevosVotos);
    };

    const getVotosPorFrente = (tipo, idFrente) => {
        const votos = tipo === 'alcalde' ? votosAlcalde : votosConcejal;
        const voto = votos.find(v => v.id_frente === idFrente);
        return voto ? voto.cantidad : 0;
    };

    useEffect(() => {
        cargarActas();
        cargarFrentes();
    }, []);

    const actasFiltradas = actas.filter(acta => {
        const coincideBusqueda = 
            (acta.codigo_mesa || '').toLowerCase().includes(busqueda.toLowerCase()) ||
            (acta.nombre_recinto || '').toLowerCase().includes(busqueda.toLowerCase()) ||
            (acta.nombre_geografico || '').toLowerCase().includes(busqueda.toLowerCase());
        
        const coincideEstado = 
            filtroEstado === 'todos' || 
            acta.estado === filtroEstado;
        
        return coincideBusqueda && coincideEstado;
    });

    const estadisticas = {
        total: actas.length,
        registradas: actas.filter(a => a.estado === 'registrada').length,
        validadas: actas.filter(a => a.estado === 'validada').length,
        rechazadas: actas.filter(a => a.estado === 'rechazada').length
    };

    const getEstadoBadge = (estado) => {
        const estados = {
            registrada: { 
                color: 'bg-[#1E3A8A] bg-opacity-10 text-[#1E3A8A] border border-[#1E3A8A] border-opacity-30', 
                icon: Clock, 
                label: 'Registrada' 
            },
            validada: { 
                color: 'bg-[#10B981] bg-opacity-10 text-[#10B981] border border-[#10B981] border-opacity-30', 
                icon: CheckCircle, 
                label: 'Validada' 
            },
            rechazada: { 
                color: 'bg-red-50 text-red-700 border border-red-200', 
                icon: AlertCircle, 
                label: 'Rechazada' 
            },
            pendiente: { 
                color: 'bg-[#F59E0B] bg-opacity-10 text-[#F59E0B] border border-[#F59E0B] border-opacity-30', 
                icon: Clock, 
                label: 'Pendiente' 
            }
        };
        
        const config = estados[estado] || estados.registrada;
        const IconComponent = config.icon;
        
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.color}`}>
                <IconComponent className="w-3.5 h-3.5" />
                {config.label}
            </span>
        );
    };

    // Función para manejar error de imagen
    const handleImageError = () => {
        setErrorImagen(true);
    };

    return (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header con diseño mejorado */}
            <div className="mb-8">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#152a63] rounded-2xl shadow-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">
                            Historial de Actas Registradas
                        </h1>
                        <p className="text-gray-600">
                            Registro completo de todas las actas procesadas en el sistema electoral
                        </p>
                    </div>
                </div>
                <div className="w-32 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#F59E0B] rounded-full mt-4 ml-4"></div>
            </div>

            {/* Estadísticas con diseño NGP */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1E3A8A] hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#1E3A8A] bg-opacity-10 rounded-lg">
                            <FileText className="w-5 h-5 text-[#1E3A8A]" />
                        </div>
                        <span className="text-gray-600 font-semibold">Total Actas</span>
                    </div>
                    <p className="text-4xl font-black text-[#1E3A8A]">{estadisticas.total}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#F59E0B] hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#F59E0B] bg-opacity-10 rounded-lg">
                            <Clock className="w-5 h-5 text-[#F59E0B]" />
                        </div>
                        <span className="text-gray-600 font-semibold">Registradas</span>
                    </div>
                    <p className="text-4xl font-black text-[#F59E0B]">{estadisticas.registradas}</p>
                </div>

               

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1E3A8A] hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#1E3A8A] bg-opacity-10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-[#1E3A8A]" />
                        </div>
                        <span className="text-gray-600 font-semibold">Votos Totales</span>
                    </div>
                    <p className="text-4xl font-black text-[#1E3A8A]">
                        {actas.reduce((sum, a) => sum + (parseInt(a.votos_totales) || 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Filtros mejorados */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por mesa, recinto o distrito..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none transition"
                            />
                        </div>
                    </div>
                 
                </div>
            </div>

            {/* Lista de Actas */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1E3A8A] rounded-full animate-spin mx-auto mb-4"></div>
                            <FileText className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#1E3A8A] w-6 h-6" />
                        </div>
                        <p className="text-gray-600 font-medium">Cargando actas...</p>
                    </div>
                ) : actasFiltradas.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-lg font-medium">No se encontraron actas</p>
                        <p className="text-gray-500 text-sm mt-1">
                            {busqueda ? 'Prueba con otros términos de búsqueda' : 'No hay actas registradas en el sistema'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Mesa</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Recinto</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Distrito</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Registrado por</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Fecha / Edición</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Votos</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Estado</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {actasFiltradas.map((acta, index) => (
                                    <tr 
                                        key={acta.id_acta} 
                                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#1E3A8A] hover:bg-opacity-5 transition-colors group`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Grid3x3 className="w-4 h-4 text-[#1E3A8A]" />
                                                <span className="font-bold text-gray-900 group-hover:text-[#1E3A8A] transition-colors">
                                                    {acta.codigo_mesa}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-[#F59E0B]" />
                                                <span className="text-sm text-gray-900">{acta.nombre_recinto || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-[#10B981]" />
                                                <span className="text-sm text-gray-600">{acta.nombre_geografico || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-[#1E3A8A]" />
                                                <span className="text-sm text-gray-600">{acta.nombre_usuario}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-[#1E3A8A]" />
                                                    <span className="text-sm text-gray-600">
                                                        {acta.fecha_registro ? new Date(acta.fecha_registro).toLocaleDateString('es-BO', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : 'N/A'}
                                                    </span>
                                                </div>
                                                {acta.editada && acta.fecha_ultima_edicion && (
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <span className="px-2 py-0.5 bg-[#F59E0B] bg-opacity-10 text-[#F59E0B] border border-[#F59E0B] border-opacity-30 rounded-full font-semibold">
                                                            Editada
                                                        </span>
                                                        <span className="text-gray-500">
                                                            {new Date(acta.fecha_ultima_edicion).toLocaleDateString('es-BO', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-center">
                                                <span className="font-bold text-[#1E3A8A]">{acta.votos_totales || 0}</span>
                                                <div className="text-xs text-gray-500">
                                                    N: <span className="text-red-600">{acta.votos_nulos || 0}</span> | 
                                                    B: <span className="text-[#F59E0B]">{acta.votos_blancos || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getEstadoBadge(acta.estado)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => cargarDetalleActa(acta.id_acta)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-[#1E3A8A] bg-opacity-10 hover:bg-opacity-20 text-[#1E3A8A] rounded-lg transition text-sm font-semibold"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Ver
                                                </button>
                                                <button
                                                    onClick={() => iniciarEdicion(acta.id_acta)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-[#F59E0B] bg-opacity-10 hover:bg-opacity-20 text-[#F59E0B] rounded-lg transition text-sm font-semibold"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Detalle con diseño NGP */}
            {mostrarDetalle && actaSeleccionada && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white z-10 px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Detalle del Acta</h2>
                                        <p className="text-white/70 text-xs mt-1">
                                            {actaSeleccionada.acta.codigo_mesa} - {actaSeleccionada.acta.nombre_recinto}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMostrarDetalle(false)}
                                    className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Información del Acta */}
                            <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
                                <h3 className="text-sm font-bold text-[#1E3A8A] mb-4 flex items-center gap-2">
                                    <Hash className="w-4 h-4" />
                                    Información General
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Mesa</p>
                                        <p className="font-bold text-[#1E3A8A]">{actaSeleccionada.acta.codigo_mesa}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Recinto</p>
                                        <p className="font-bold text-[#F59E0B]">{actaSeleccionada.acta.nombre_recinto}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Distrito</p>
                                        <p className="font-bold text-[#10B981]">{actaSeleccionada.acta.nombre_geografico}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Registrado por</p>
                                        <p className="font-semibold text-gray-900">{actaSeleccionada.acta.nombre_usuario}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Fecha de Registro</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(actaSeleccionada.acta.fecha_registro).toLocaleString('es-BO')}
                                        </p>
                                    </div>
                                    {actaSeleccionada.acta.editada && actaSeleccionada.acta.fecha_ultima_edicion && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Última Edición</p>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-[#F59E0B] bg-opacity-10 text-[#F59E0B] border border-[#F59E0B] border-opacity-30 rounded-lg text-xs font-bold">
                                                    Editada
                                                </span>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {new Date(actaSeleccionada.acta.fecha_ultima_edicion).toLocaleString('es-BO')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Votos Totales</p>
                                        <p className="font-bold text-[#1E3A8A]">{actaSeleccionada.acta.votos_totales}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Estado</p>
                                        <div>{getEstadoBadge(actaSeleccionada.acta.estado)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Imagen del Acta - CORREGIDA */}
                            {actaSeleccionada.acta.imagen_url && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-[#1E3A8A] mb-4 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        Imagen del Acta
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                        {!errorImagen ? (
                                            <img
                                                src={`${BASE_URL}${actaSeleccionada.acta.imagen_url}`}
                                                alt="Acta escaneada"
                                                className="w-full h-auto max-h-96 object-contain rounded-xl cursor-pointer hover:scale-105 transition-transform"
                                                onClick={() => window.open(`${BASE_URL}${actaSeleccionada.acta.imagen_url}`, '_blank')}
                                                onError={handleImageError}
                                            />
                                        ) : (
                                            <div className="text-center py-8">
                                                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                                <p className="text-red-600 font-medium">No se pudo cargar la imagen</p>
                                                <p className="text-xs text-gray-500 mt-1">La imagen podría haber sido eliminada</p>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 text-center mt-2">Click para ver en tamaño completo</p>
                                    </div>
                                </div>
                            )}

                            {/* Votos por Frente */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-[#1E3A8A] mb-4 flex items-center gap-2">
                                    <Award className="w-4 h-4" />
                                    Votos por Frente Político
                                </h3>
                                <div className="space-y-3">
                                    {actaSeleccionada.votos && actaSeleccionada.votos.length > 0 ? (
                                        actaSeleccionada.votos.map((voto) => (
                                            <div key={voto.id_voto} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-12 h-12 rounded-xl shadow-md"
                                                            style={{ backgroundColor: voto.color || '#1E3A8A' }}
                                                        />
                                                        <div>
                                                            <p className="font-bold text-[#1E3A8A]">{voto.siglas}</p>
                                                            <p className="text-sm text-gray-600">{voto.nombre_frente}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Cargo: <span className="font-semibold text-[#F59E0B]">{voto.tipo_cargo}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-black text-[#F59E0B]">{voto.cantidad}</p>
                                                        <p className="text-xs text-gray-500">votos</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl">
                                            No hay votos registrados para esta acta
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Observaciones */}
                            {actaSeleccionada.acta.observaciones && (
                                <div className="bg-[#F59E0B] bg-opacity-5 border border-[#F59E0B] border-opacity-30 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-[#F59E0B] mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-3 h-3" />
                                        Observaciones
                                    </h3>
                                    <p className="text-sm text-gray-700">{actaSeleccionada.acta.observaciones}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición con diseño NGP */}
            {mostrarEdicion && actaSeleccionada && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white z-10 px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        <Edit className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Editar Acta</h2>
                                        <p className="text-white/70 text-xs mt-1">
                                            {actaSeleccionada.acta.codigo_mesa} - {actaSeleccionada.acta.nombre_recinto}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMostrarEdicion(false)}
                                    disabled={guardando}
                                    className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Votos Alcalde */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-[#1E3A8A] mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5" />
                                    Votos Alcalde
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {frentes.map((frente) => (
                                        <div key={`alcalde-${frente.id_frente}`} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-[#1E3A8A] transition">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex-shrink-0 shadow-md"
                                                        style={{ backgroundColor: frente.color || '#1E3A8A' }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-[#1E3A8A] truncate">{frente.siglas}</p>
                                                        <p className="text-xs text-gray-600 truncate">{frente.nombre}</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={getVotosPorFrente('alcalde', frente.id_frente) || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                                        actualizarVoto('alcalde', frente.id_frente, value === '' ? 0 : parseInt(value));
                                                    }}
                                                    className="w-20 text-center text-xl font-bold border border-gray-300 rounded-lg py-2 focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] focus:outline-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Votos Concejal */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-[#F59E0B] mb-4 flex items-center gap-2">
                                    <ClipboardCheck className="w-5 h-5" />
                                    Votos Concejal
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {frentes.map((frente) => (
                                        <div key={`concejal-${frente.id_frente}`} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-[#F59E0B] transition">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex-shrink-0 shadow-md"
                                                        style={{ backgroundColor: frente.color || '#1E3A8A' }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-[#F59E0B] truncate">{frente.siglas}</p>
                                                        <p className="text-xs text-gray-600 truncate">{frente.nombre}</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={getVotosPorFrente('concejal', frente.id_frente) || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                                        actualizarVoto('concejal', frente.id_frente, value === '' ? 0 : parseInt(value));
                                                    }}
                                                    className="w-20 text-center text-xl font-bold border border-gray-300 rounded-lg py-2 focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] focus:outline-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Votos Nulos y Blancos */}
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                                    <label className="block text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Votos Nulos
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={votosNulos || ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            setVotosNulos(value === '' ? 0 : parseInt(value));
                                        }}
                                        className="w-full text-center text-3xl font-bold border border-red-200 rounded-xl py-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="bg-[#F59E0B] bg-opacity-5 rounded-xl p-6 border border-[#F59E0B] border-opacity-30">
                                    <label className="block text-sm font-bold text-[#F59E0B] mb-3 flex items-center gap-2">
                                        <Percent className="w-4 h-4" />
                                        Votos Blancos
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={votosBlancos || ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            setVotosBlancos(value === '' ? 0 : parseInt(value));
                                        }}
                                        className="w-full text-center text-3xl font-bold border border-gray-200 rounded-xl py-3 focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-[#1E3A8A] mb-3">
                                    Observaciones
                                </label>
                                <textarea
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    rows={3}
                                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-[#1E3A8A] focus:outline-none transition"
                                    placeholder="Observaciones adicionales sobre esta acta..."
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={guardarEdicion}
                                    disabled={guardando}
                                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white rounded-xl transition font-bold text-lg hover:from-[#152a63] hover:to-[#0f1f4a] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {guardando ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setMostrarEdicion(false)}
                                    disabled={guardando}
                                    className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition font-bold text-lg disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
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

export default HistorialActas;