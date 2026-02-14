import React, { useState, useEffect } from 'react';
import { 
  MapPin, Plus, Search, Edit, Trash2, X, 
  ChevronDown, Filter, Layers, Globe, 
  Hash, Type, FolderTree, AlertCircle,
  CheckCircle, XCircle, RefreshCw
} from 'lucide-react';

const Geografia = () => {
    // ========== ESTADOS PRINCIPALES ==========
    const [registros, setRegistros] = useState([]);
    const [registrosFiltrados, setRegistrosFiltrados] = useState([]);
    const [padres, setPadres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // ========== ESTADOS DE MODALES ==========
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [guardando, setGuardando] = useState(false);
    
    // Modal detalle
    const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
    const [registroDetalle, setRegistroDetalle] = useState(null);
    const [detallePadre, setDetallePadre] = useState(null);
    const [detalleHijos, setDetalleHijos] = useState([]);
    
    // Modal tipos
    const [modalTiposAbierto, setModalTiposAbierto] = useState(false);
    const [nuevoTipo, setNuevoTipo] = useState('');
    const [tipoAEliminar, setTipoAEliminar] = useState('');
    const [reemplazoTipo, setReemplazoTipo] = useState('');
    const [tiposCustom, setTiposCustom] = useState([]);
    const [cargandoTipos, setCargandoTipos] = useState(false);

    // ========== ESTADOS DE FILTROS ==========
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroPadre, setFiltroPadre] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    // ========== CONSTANTES ==========
    // ⚠️ IMPORTANTE: Vacío para que todo sea dinámico desde la BD
    const TIPOS_POR_DEFECTO = [];
    
    const [nuevoRegistro, setNuevoRegistro] = useState({
        nombre: '',
        codigo: '',
        tipo: '',
        fk_id_geografico: ''
    });

    // ========== CONFIGURACIÓN API ==========
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    // ========== USUARIO Y PERMISOS ==========
    const usuario = (() => {
        try {
            return JSON.parse(localStorage.getItem('usuario') || 'null');
        } catch {
            return null;
        }
    })();

    const esAdmin = (usuario?.rol || usuario?.nombre_rol || usuario?.tipo_rol || '')
        .toString()
        .toLowerCase()
        .includes('admin');

    // ========== TIPOS DINÁMICOS ==========
    const [tiposDisponibles, setTiposDisponibles] = useState([]);

    // ========== EFFECTS ==========
    
    // Cargar tipos custom de localStorage
    useEffect(() => {
        try {
            const guardados = JSON.parse(localStorage.getItem('tipos_geograficos_custom') || '[]');
            setTiposCustom(guardados);
        } catch {
            setTiposCustom([]);
        }
    }, []);

    // Actualizar tipos disponibles cuando cambian registros o tipos custom
    useEffect(() => {
        // 🔴 SOLO tipos que existen en la BD o son custom
        const tiposDesdeDB = [...new Set(registros.map(r => r.tipo).filter(Boolean))];
        const todosLosTipos = [...new Set([...tiposDesdeDB, ...tiposCustom])];
        
        // Ordenar alfabéticamente
        todosLosTipos.sort((a, b) => a.localeCompare(b));
        
        setTiposDisponibles(todosLosTipos);
        
        // Si el filtro actual ya no existe, limpiarlo
        if (filtroTipo && !todosLosTipos.includes(filtroTipo)) {
            setFiltroTipo('');
        }
    }, [registros, tiposCustom, filtroTipo]);

    // Cargar datos iniciales
    useEffect(() => {
        cargarRegistros();
        cargarPadres();
    }, []);

    // Filtrar registros
    useEffect(() => {
        let resultado = registros;

        if (busqueda) {
            resultado = resultado.filter(r =>
                r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                r.codigo?.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        if (filtroTipo) {
            resultado = resultado.filter(r => r.tipo === filtroTipo);
        }

        if (filtroPadre) {
            if (filtroPadre === 'sin_padre') {
                resultado = resultado.filter(r => !r.fk_id_geografico);
            } else {
                resultado = resultado.filter(r => r.fk_id_geografico === parseInt(filtroPadre));
            }
        }

        setRegistrosFiltrados(resultado);
    }, [busqueda, filtroTipo, filtroPadre, registros]);

    // ========== FUNCIONES API ==========
    
    const mostrarMensaje = (tipo, mensaje) => {
        if (tipo === 'error') {
            setError(mensaje);
            setTimeout(() => setError(null), 5000);
        } else {
            setSuccess(mensaje);
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const cargarRegistros = async () => {
        try {
            const response = await fetch(`${API_URL}/geografico`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setRegistros(data.data);
                setRegistrosFiltrados(data.data);
            }
        } catch (err) {
            console.error("Error:", err);
            mostrarMensaje('error', "No se pudieron cargar los registros");
        } finally {
            setLoading(false);
        }
    };

    const cargarPadres = async () => {
        try {
            const response = await fetch(`${API_URL}/geografico/padres`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setPadres(data.data);
            }
        } catch (err) {
            console.error("Error al cargar padres:", err);
        }
    };

    // ========== FUNCIONES DE MODALES ==========
    
    const abrirModal = (registro = null) => {
        if (registro) {
            setModoEdicion(true);
            setNuevoRegistro({
                id_geografico: registro.id_geografico,
                nombre: registro.nombre,
                codigo: registro.codigo || '',
                tipo: registro.tipo,
                fk_id_geografico: registro.fk_id_geografico || ''
            });
        } else {
            setModoEdicion(false);
            setNuevoRegistro({
                nombre: '',
                codigo: '',
                tipo: '',
                fk_id_geografico: ''
            });
        }
        setModalAbierto(true);
        setError(null);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setError(null);
    };

    const abrirDetalle = (registro) => {
        setRegistroDetalle(registro);

        const padre = registro.fk_id_geografico
            ? registros.find(r => r.id_geografico === registro.fk_id_geografico)
            : null;
        setDetallePadre(padre || null);

        const hijos = registros.filter(r => r.fk_id_geografico === registro.id_geografico);
        setDetalleHijos(hijos);

        setModalDetalleAbierto(true);
    };

    const cerrarDetalle = () => {
        setModalDetalleAbierto(false);
        setRegistroDetalle(null);
        setDetallePadre(null);
        setDetalleHijos([]);
    };

    // ========== CRUD OPERATIONS ==========
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        try {
            const url = modoEdicion
                ? `${API_URL}/geografico/${nuevoRegistro.id_geografico}`
                : `${API_URL}/geografico`;

            const method = modoEdicion ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre: nuevoRegistro.nombre,
                    codigo: nuevoRegistro.codigo || null,
                    tipo: nuevoRegistro.tipo,
                    fk_id_geografico: nuevoRegistro.fk_id_geografico || null
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Error al guardar');

            if (data.success) {
                await cargarRegistros();
                await cargarPadres();
                cerrarModal();
                mostrarMensaje('success', modoEdicion ? 'Registro actualizado' : 'Registro creado');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id, nombre) => {
        if (!confirm(`¿Estás seguro de eliminar "${nombre}"?`)) return;

        try {
            const response = await fetch(`${API_URL}/geografico/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    mostrarMensaje('error', `No se puede eliminar "${nombre}" porque tiene ${data.data?.totalHijos || ''} hijo(s)`);
                    return;
                }
                throw new Error(data.message || 'Error al eliminar');
            }

            if (data.success) {
                await cargarRegistros();
                await cargarPadres();
                mostrarMensaje('success', 'Registro eliminado');
            }
        } catch (err) {
            mostrarMensaje('error', err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoRegistro(prev => ({ ...prev, [name]: value }));
    };

    // ========== GESTIÓN DE TIPOS ==========
    
    const abrirModalTipos = () => {
        if (!esAdmin) return;
        setNuevoTipo('');
        setTipoAEliminar('');
        setReemplazoTipo('');
        setModalTiposAbierto(true);
    };

    const cerrarModalTipos = () => {
        setModalTiposAbierto(false);
        setNuevoTipo('');
        setTipoAEliminar('');
        setReemplazoTipo('');
    };

    const crearTipo = () => {
        const t = (nuevoTipo || '').trim();
        if (!t) {
            mostrarMensaje('error', 'Ingresa un nombre para el tipo');
            return;
        }

        const existe = tiposDisponibles.some(x => x.toLowerCase() === t.toLowerCase());
        if (existe) {
            mostrarMensaje('error', 'Este tipo ya existe');
            setNuevoTipo('');
            return;
        }

        const next = [...tiposCustom, t];
        setTiposCustom(next);
        localStorage.setItem('tipos_geograficos_custom', JSON.stringify(next));
        setNuevoTipo('');
        mostrarMensaje('success', 'Tipo creado correctamente');
    };

    const eliminarTipo = async () => {
        if (!tipoAEliminar) {
            mostrarMensaje('error', 'Selecciona un tipo para eliminar');
            return;
        }

        const cantidad = registros.filter(r => r.tipo === tipoAEliminar).length;

        // Si tiene registros, pedir reasignación
        if (cantidad > 0) {
            if (!reemplazoTipo) {
                mostrarMensaje('error', 'Este tipo está en uso. Debes seleccionar un tipo de reemplazo.');
                return;
            }
            if (reemplazoTipo === tipoAEliminar) {
                mostrarMensaje('error', 'El tipo de reemplazo no puede ser el mismo');
                return;
            }
            
            if (!confirm(`⚠️ Este tipo está en uso por ${cantidad} registro(s).\nSe reasignarán a "${reemplazoTipo}".\n¿Continuar?`)) {
                return;
            }

            // Reasignar en el backend
            try {
                setCargandoTipos(true);
                const response = await fetch(`${API_URL}/geografico/tipos/reasignar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        tipo_origen: tipoAEliminar,
                        tipo_destino: reemplazoTipo
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Error al reasignar');

                await cargarRegistros();
                
            } catch (e) {
                mostrarMensaje('error', 'Error al reasignar: ' + e.message);
                setCargandoTipos(false);
                return;
            }
        } else {
            if (!confirm(`¿Eliminar el tipo "${tipoAEliminar}"?`)) return;
        }

        // Eliminar el tipo del backend
        try {
            const response = await fetch(`${API_URL}/geografico/tipos/${encodeURIComponent(tipoAEliminar)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al eliminar tipo');
            }

            // Si era un tipo custom, eliminarlo de localStorage
            if (tiposCustom.includes(tipoAEliminar)) {
                const nextCustom = tiposCustom.filter(t => t !== tipoAEliminar);
                setTiposCustom(nextCustom);
                localStorage.setItem('tipos_geograficos_custom', JSON.stringify(nextCustom));
            }

            // 🔴 IMPORTANTE: Recargar registros para actualizar tiposDesdeDB
            await cargarRegistros();

            // Limpiar filtro si estaba seleccionado
            if (filtroTipo === tipoAEliminar) {
                setFiltroTipo('');
            }

            setTipoAEliminar('');
            setReemplazoTipo('');
            mostrarMensaje('success', 'Tipo eliminado correctamente');
            
        } catch (e) {
            mostrarMensaje('error', e.message);
        } finally {
            setCargandoTipos(false);
        }
    };

    // ========== UTILS ==========
    
    const limpiarFiltros = () => {
        setBusqueda('');
        setFiltroTipo('');
        setFiltroPadre('');
    };

    const getTipoColor = (tipo) => {
        const colores = {
            'País': 'bg-purple-100 text-purple-700 border-purple-200',
            'Ciudad': 'bg-blue-100 text-blue-700 border-blue-200',
            'Municipio': 'bg-green-100 text-green-700 border-green-200',
            'Localidad': 'bg-amber-100 text-amber-700 border-amber-200',
            'Recinto': 'bg-rose-100 text-rose-700 border-rose-200'
        };
        return colores[tipo] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // ========== RENDER ==========
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-gray-200 border-t-[#E31E24] rounded-full animate-spin"></div>
                        <Globe className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#E31E24] w-8 h-8" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Cargando parámetros geográficos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans">
            
            {/* Mensajes de notificación */}
            {error && (
                <div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-red-500 shadow-lg rounded-lg p-4 flex items-start gap-3 animate-slideIn">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{error}</p>
                    <button onClick={() => setError(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                </div>
            )}
            
            {success && (
                <div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-green-500 shadow-lg rounded-lg p-4 flex items-start gap-3 animate-slideIn">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{success}</p>
                    <button onClick={() => setSuccess(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Header Principal */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-[#E31E24] bg-opacity-10 rounded-xl flex items-center justify-center">
                                <Globe className="w-6 h-6 text-[#E31E24]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Parámetros Geográficos</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Gestión de la estructura territorial del departamento
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            {esAdmin && (
                                <button
                                    onClick={abrirModalTipos}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                                >
                                    <Layers size={18} />
                                    Gestionar Tipos
                                </button>
                            )}
                            <button
                                onClick={() => abrirModal()}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                                <Plus size={18} />
                                Nuevo Registro
                            </button>
                        </div>
                    </div>
                </div>

                {/* Panel de Filtros */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <div 
                        className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    >
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-gray-500" />
                            <span className="font-medium text-gray-700">Filtros y búsqueda</span>
                        </div>
                        <ChevronDown 
                            size={18} 
                            className={`text-gray-500 transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`}
                        />
                    </div>
                    
                    {mostrarFiltros && (
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Búsqueda */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Buscar
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Nombre o código..."
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E31E24] focus:border-transparent outline-none transition-all"
                                        />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Filtro por Tipo */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Tipo
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filtroTipo}
                                            onChange={(e) => setFiltroTipo(e.target.value)}
                                            className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E31E24] focus:border-transparent outline-none appearance-none"
                                        >
                                            <option value="">Todos los tipos</option>
                                            {tiposDisponibles.map(tipo => (
                                                <option key={tipo} value={tipo}>{tipo}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Filtro por Padre */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Padre
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filtroPadre}
                                            onChange={(e) => setFiltroPadre(e.target.value)}
                                            className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E31E24] focus:border-transparent outline-none appearance-none"
                                        >
                                            <option value="">Todos los padres</option>
                                            <option value="sin_padre">Sin padre (nivel superior)</option>
                                            {padres.map(padre => (
                                                <option key={padre.id_geografico} value={padre.id_geografico}>
                                                    {padre.nombre} ({padre.tipo})
                                                </option>
                                            ))}
                                        </select>
                                        <FolderTree className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Botón limpiar filtros */}
                            {(busqueda || filtroTipo || filtroPadre) && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={limpiarFiltros}
                                        className="text-sm text-[#E31E24] hover:text-[#B00000] font-medium flex items-center gap-1"
                                    >
                                        <X size={14} />
                                        Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabla de Registros */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Cabecera de tabla */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                Mostrando {registrosFiltrados.length} de {registros.length} registros
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <RefreshCw 
                                size={14} 
                                className="cursor-pointer hover:text-[#E31E24] transition-colors" 
                                onClick={() => {
                                    cargarRegistros();
                                    cargarPadres();
                                }}
                            />
                            <span>Actualizar</span>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        {registrosFiltrados.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <MapPin className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No hay registros</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    {busqueda || filtroTipo || filtroPadre 
                                        ? 'No se encontraron resultados con los filtros aplicados'
                                        : 'Comienza creando un nuevo registro geográfico'}
                                </p>
                                {(busqueda || filtroTipo || filtroPadre) && (
                                    <button
                                        onClick={limpiarFiltros}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
                                    >
                                        <X size={16} />
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">#</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Padre</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {registrosFiltrados.map((reg, index) => (
                                        <tr 
                                            key={reg.id_geografico} 
                                            className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                            onClick={() => abrirDetalle(reg)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400 group-hover:text-[#E31E24]">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{reg.nombre}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {reg.codigo ? (
                                                    <span className="text-sm text-gray-600 font-mono">{reg.codigo}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTipoColor(reg.tipo)}`}>
                                                    {reg.tipo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">
                                                    {reg.nombre_padre || (
                                                        <span className="text-gray-400">Sin padre</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => abrirModal(reg)}
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                                        title="Editar"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminar(reg.id_geografico, reg.nombre)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer de tabla */}
                    {registrosFiltrados.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>Total de registros: {registros.length}</span>
                                <span>Página 1 de 1</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CREAR/EDITAR REGISTRO */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        
                        {/* Header del modal */}
                        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    {modoEdicion ? <Edit size={18} /> : <Plus size={18} />}
                                </div>
                                <h2 className="text-lg font-semibold">
                                    {modoEdicion ? 'Editar Registro' : 'Nuevo Registro Geográfico'}
                                </h2>
                            </div>
                            <button 
                                onClick={cerrarModal} 
                                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Cuerpo del modal */}
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            
                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <div className="space-y-5">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={nuevoRegistro.nombre}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E31E24] focus:border-transparent outline-none transition"
                                        placeholder="Ej: Cercado"
                                    />
                                </div>

                                {/* Código */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código
                                    </label>
                                    <input
                                        type="text"
                                        name="codigo"
                                        value={nuevoRegistro.codigo}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E31E24] focus:border-transparent outline-none transition"
                                        placeholder="Ej: CBBA-CER"
                                    />
                                </div>

                                {/* Tipo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="tipo"
                                        value={nuevoRegistro.tipo}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E31E24] focus:border-transparent outline-none appearance-none"
                                    >
                                        <option value="">Selecciona un tipo...</option>
                                        {tiposDisponibles.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Padre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Padre (Jerarquía)
                                    </label>
                                    <select
                                        name="fk_id_geografico"
                                        value={nuevoRegistro.fk_id_geografico}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E31E24] focus:border-transparent outline-none appearance-none"
                                    >
                                        <option value="">Sin padre (nivel superior)</option>
                                        {padres
                                            .filter(p => p.id_geografico !== nuevoRegistro.id_geografico)
                                            .map(padre => (
                                                <option key={padre.id_geografico} value={padre.id_geografico}>
                                                    {padre.nombre} ({padre.tipo})
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Selecciona el registro padre si este es un nivel inferior
                                    </p>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {guardando ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        modoEdicion ? 'Actualizar' : 'Crear'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE */}
            {modalDetalleAbierto && registroDetalle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                        
                        {/* Header */}
                        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Detalle Geográfico</h2>
                                    <p className="text-xs text-white/70 mt-0.5">
                                        {registroDetalle.nombre} • {registroDetalle.tipo}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={cerrarDetalle} 
                                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Cuerpo */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            
                            {/* Información del registro */}
                            <div className="bg-gray-50 rounded-xl p-5 mb-6">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Información del registro
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Nombre</p>
                                        <p className="text-sm font-medium text-gray-900">{registroDetalle.nombre}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Código</p>
                                        <p className="text-sm font-medium text-gray-900">{registroDetalle.codigo || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Tipo</p>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTipoColor(registroDetalle.tipo)}`}>
                                            {registroDetalle.tipo}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">ID</p>
                                        <p className="text-sm font-mono text-gray-600">{registroDetalle.id_geografico}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Padre */}
                            <div className="bg-gray-50 rounded-xl p-5 mb-6">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Padre
                                </h3>
                                {detallePadre ? (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base font-semibold text-gray-900">{detallePadre.nombre}</p>
                                            <p className="text-xs text-gray-500">{detallePadre.tipo}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                cerrarDetalle();
                                                abrirDetalle(detallePadre);
                                            }}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                                        >
                                            Ver padre
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 italic">
                                        Sin padre (nivel superior)
                                    </div>
                                )}
                            </div>

                            {/* Hijos */}
                            <div className="bg-gray-50 rounded-xl p-5 mb-6">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Hijos ({detalleHijos.length})
                                </h3>
                                
                                {detalleHijos.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No tiene hijos registrados</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {detalleHijos.map(h => (
                                            <button
                                                key={h.id_geografico}
                                                type="button"
                                                onClick={() => {
                                                    cerrarDetalle();
                                                    abrirDetalle(h);
                                                }}
                                                className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:bg-gray-50 transition-all"
                                            >
                                                <p className="font-medium text-gray-900">{h.nombre}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${getTipoColor(h.tipo)}`}>
                                                        {h.tipo}
                                                    </span>
                                                    {h.codigo && (
                                                        <span className="ml-2 font-mono">{h.codigo}</span>
                                                    )}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Botones de acción */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        cerrarDetalle();
                                        abrirModal(registroDetalle);
                                    }}
                                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                                >
                                    <Edit size={16} />
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        cerrarDetalle();
                                        handleEliminar(registroDetalle.id_geografico, registroDetalle.nombre);
                                    }}
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Eliminar
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={cerrarDetalle}
                                className="w-full mt-3 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GESTIONAR TIPOS */}
            {modalTiposAbierto && esAdmin && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        
                        {/* Header */}
                        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Layers size={18} />
                                </div>
                                <h2 className="text-lg font-semibold">Gestionar Tipos</h2>
                            </div>
                            <button 
                                onClick={cerrarModalTipos} 
                                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Cuerpo */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            
                            {/* Sección: Crear tipo */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Plus size={16} className="text-green-600" />
                                    Crear nuevo tipo
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={nuevoTipo}
                                        onChange={(e) => setNuevoTipo(e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E31E24] focus:border-transparent outline-none"
                                        placeholder="Ej: Distrito, Provincia, Cantón..."
                                    />
                                    <button
                                        type="button"
                                        onClick={crearTipo}
                                        disabled={cargandoTipos}
                                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
                                    >
                                        Crear
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Los tipos creados estarán disponibles en el selector de todos los registros
                                </p>
                            </div>

                            {/* Sección: Eliminar tipo */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Trash2 size={16} className="text-red-600" />
                                    Eliminar tipo
                                </h3>

                                <select
                                    value={tipoAEliminar}
                                    onChange={(e) => {
                                        setTipoAEliminar(e.target.value);
                                        setReemplazoTipo('');
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E31E24] focus:border-transparent outline-none mb-4"
                                >
                                    <option value="">Selecciona un tipo...</option>
                                    {tiposDisponibles.map(t => {
                                        const cantidad = registros.filter(r => r.tipo === t).length;
                                        return (
                                            <option key={t} value={t}>
                                                {t} ({cantidad} registro{cantidad !== 1 ? 's' : ''})
                                            </option>
                                        );
                                    })}
                                </select>

                                {tipoAEliminar && (
                                    <>
                                        {registros.filter(r => r.tipo === tipoAEliminar).length > 0 && (
                                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                                <p className="text-xs font-medium text-amber-800 mb-2 flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    Este tipo está en uso
                                                </p>
                                                <select
                                                    value={reemplazoTipo}
                                                    onChange={(e) => setReemplazoTipo(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                                >
                                                    <option value="">Selecciona tipo de reemplazo...</option>
                                                    {tiposDisponibles
                                                        .filter(t => t !== tipoAEliminar)
                                                        .map(t => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                </select>
                                                <p className="text-xs text-amber-700 mt-2">
                                                    Los registros serán reasignados al tipo seleccionado
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={eliminarTipo}
                                            disabled={cargandoTipos}
                                            className={`w-full px-6 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                                                tipoAEliminar && !cargandoTipos
                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {cargandoTipos ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Procesando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 size={16} />
                                                    Eliminar tipo
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}

                                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Tipos actuales:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {tiposDisponibles.map(t => {
                                            const cantidad = registros.filter(r => r.tipo === t).length;
                                            return (
                                                <span 
                                                    key={t} 
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border ${getTipoColor(t)}`}
                                                >
                                                    {t}
                                                    <span className="ml-1 px-1.5 py-0.5 bg-white/50 rounded-full text-[10px]">
                                                        {cantidad}
                                                    </span>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Botón cerrar */}
                            <button
                                type="button"
                                onClick={cerrarModalTipos}
                                className="w-full mt-6 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Estilos adicionales */}
            <style jsx>{`
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

export default Geografia;