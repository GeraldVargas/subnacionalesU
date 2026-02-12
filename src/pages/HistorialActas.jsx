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
    Eye
} from 'lucide-react';

const HistorialActas = () => {
    const [actas, setActas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [actaSeleccionada, setActaSeleccionada] = useState(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const cargarActas = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/votos`);
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
            const response = await fetch(`${API_URL}/votos/acta/${id}`);
            const data = await response.json();
            
            if (data.success) {
                setActaSeleccionada(data.data);
                setMostrarDetalle(true);
            }
        } catch (error) {
            console.error('Error al cargar detalle:', error);
        }
    };

    useEffect(() => {
        cargarActas();
    }, []);

    const actasFiltradas = actas.filter(acta => {
        const coincideBusqueda = 
            acta.codigo_mesa?.toLowerCase().includes(busqueda.toLowerCase()) ||
            acta.nombre_recinto?.toLowerCase().includes(busqueda.toLowerCase()) ||
            acta.nombre_geografico?.toLowerCase().includes(busqueda.toLowerCase());
        
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
            registrada: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Registrada' },
            validada: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Validada' },
            rechazada: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Rechazada' },
            pendiente: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' }
        };
        
        const config = estados[estado] || estados.registrada;
        const IconComponent = config.icon;
        
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
                <IconComponent className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                    Historial de Actas Registradas
                </h1>
                <p className="text-gray-600">
                    Registro completo de todas las actas procesadas en el sistema
                </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-6 h-6 text-gray-600" />
                        <span className="text-gray-600 font-semibold">Total</span>
                    </div>
                    <p className="text-4xl font-black text-gray-900">{estadisticas.total}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-6 h-6 text-blue-600" />
                        <span className="text-gray-600 font-semibold">Registradas</span>
                    </div>
                    <p className="text-4xl font-black text-blue-600">{estadisticas.registradas}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span className="text-gray-600 font-semibold">Validadas</span>
                    </div>
                    <p className="text-4xl font-black text-green-600">{estadisticas.validadas}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                        <span className="text-gray-600 font-semibold">Votos Totales</span>
                    </div>
                    <p className="text-4xl font-black text-purple-600">
                        {actas.reduce((sum, a) => sum + (a.votos_totales || 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por mesa, recinto o distrito..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="registrada">Registradas</option>
                            <option value="validada">Validadas</option>
                            <option value="rechazada">Rechazadas</option>
                            <option value="pendiente">Pendientes</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de Actas */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando actas...</p>
                    </div>
                ) : actasFiltradas.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No se encontraron actas</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Mesa</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Recinto</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Distrito</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Registrado por</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Votos</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {actasFiltradas.map((acta) => (
                                    <tr key={acta.id_acta} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Grid3x3 className="w-4 h-4 text-gray-400" />
                                                <span className="font-bold text-gray-900">{acta.codigo_mesa}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">{acta.nombre_recinto || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{acta.nombre_geografico || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{acta.nombre_usuario}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {new Date(acta.fecha_registro).toLocaleDateString('es-BO', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-center">
                                                <span className="font-bold text-gray-900">{acta.votos_totales || 0}</span>
                                                <div className="text-xs text-gray-500">
                                                    Nulos: {acta.votos_nulos || 0} | Blancos: {acta.votos_blancos || 0}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getEstadoBadge(acta.estado)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => cargarDetalleActa(acta.id_acta)}
                                                className="flex items-center gap-2 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition text-sm font-semibold"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver Detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Detalle */}
            {mostrarDetalle && actaSeleccionada && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-gray-200 rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-gray-900">Detalle del Acta</h2>
                                <button
                                    onClick={() => setMostrarDetalle(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Información del Acta */}
                            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Información General</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Mesa:</span>
                                        <p className="font-bold text-gray-900">{actaSeleccionada.acta.codigo_mesa}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Recinto:</span>
                                        <p className="font-bold text-gray-900">{actaSeleccionada.acta.nombre_recinto}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Distrito:</span>
                                        <p className="font-bold text-gray-900">{actaSeleccionada.acta.nombre_geografico}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Registrado por:</span>
                                        <p className="font-bold text-gray-900">{actaSeleccionada.acta.nombre_usuario}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Votos Totales:</span>
                                        <p className="font-bold text-gray-900">{actaSeleccionada.acta.votos_totales}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Estado:</span>
                                        <div className="mt-1">{getEstadoBadge(actaSeleccionada.acta.estado)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Votos por Frente */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Votos por Frente Político</h3>
                                <div className="space-y-4">
                                    {actaSeleccionada.votos.map((voto) => (
                                        <div key={voto.id_voto} className="bg-white border-2 border-gray-200 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-12 h-12 rounded-xl"
                                                        style={{ backgroundColor: voto.color || '#E31E24' }}
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900">{voto.siglas}</p>
                                                        <p className="text-sm text-gray-600">{voto.nombre_frente}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Cargo: <span className="font-semibold">{voto.tipo_cargo}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-black text-gray-900">{voto.cantidad}</p>
                                                    <p className="text-sm text-gray-600">votos</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Observaciones */}
                            {actaSeleccionada.acta.observaciones && (
                                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <h3 className="text-sm font-bold text-yellow-800 mb-2">Observaciones:</h3>
                                    <p className="text-sm text-yellow-700">{actaSeleccionada.acta.observaciones}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialActas;
