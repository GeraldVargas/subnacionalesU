import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Edit, Trash2, X } from 'lucide-react';

const Geografia = () => {
    const [registros, setRegistros] = useState([]);
    const [registrosFiltrados, setRegistrosFiltrados] = useState([]);
    const [padres, setPadres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');

    // Modal detalle (padre + hijos)
    const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
    const [registroDetalle, setRegistroDetalle] = useState(null);
    const [detallePadre, setDetallePadre] = useState(null);
    const [detalleHijos, setDetalleHijos] = useState([]);

    // Gestión de tipos (admin)
    const [modalTiposAbierto, setModalTiposAbierto] = useState(false);
    const [nuevoTipo, setNuevoTipo] = useState('');
    const [tipoAEliminar, setTipoAEliminar] = useState('');
    const [reemplazoTipo, setReemplazoTipo] = useState('');

    const TIPOS_BASE = ['País', 'Ciudad', 'Municipio', 'Localidad', 'Recinto'];

    const [nuevoRegistro, setNuevoRegistro] = useState({
        nombre: '',
        codigo: '',
        tipo: '',
        fk_id_geografico: ''
    });

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

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
            setError("No se pudieron cargar los registros: " + err.message);
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

        setRegistrosFiltrados(resultado);
    }, [busqueda, filtroTipo, registros]);

    // Tipos disponibles: base + los que ya existen en DB (sin inventar)
    const tiposDesdeDB = [...new Set(registros.map(r => r.tipo).filter(Boolean))];
    const tiposDisponibles = [...new Set([...TIPOS_BASE, ...tiposDesdeDB])];

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
                alert(modoEdicion ? '✅ Registro actualizado' : '✅ Registro creado');
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

            if (!response.ok) throw new Error(data.message || 'Error al eliminar');

            if (data.success) {
                await cargarRegistros();
                await cargarPadres();
                alert('✅ Registro eliminado');
            }
        } catch (err) {
            alert('❌ ' + err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoRegistro(prev => ({ ...prev, [name]: value }));
    };

    // ---- Gestión de tipos (solo UI) ----
    // Nota: como el backend actual guarda tipo como texto, “crear tipo” significa: permitir usar un nuevo valor.
    // “Eliminar tipo” requiere reasignar los registros que usan ese tipo (para no dejar datos rotos).
    const conteoPorTipo = tiposDisponibles.reduce((acc, t) => {
        acc[t] = registros.filter(r => r.tipo === t).length;
        return acc;
    }, {});

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
        if (!t) return;

        const existe = tiposDisponibles.some(x => x.toLowerCase() === t.toLowerCase());
        if (existe) {
            setNuevoTipo('');
            return;
        }

        // No tocamos DB (no hay tabla de tipos). Solo habilitamos el valor para elegir.
        // Lo logramos “inyectándolo” en el selector mediante un registro virtual? No.
        // Entonces lo guardamos en memoria local (localStorage) para que no se pierda al recargar.
        const guardados = (() => {
            try { return JSON.parse(localStorage.getItem('tipos_geograficos_custom') || '[]'); }
            catch { return []; }
        })();

        const next = [...new Set([...guardados, t])];
        localStorage.setItem('tipos_geograficos_custom', JSON.stringify(next));
        setNuevoTipo('');
        alert('✅ Tipo creado (ya puedes seleccionarlo al crear un registro)');
    };

    // Traer tipos custom guardados (sin inventar botones)
    useEffect(() => {
        const guardados = (() => {
            try { return JSON.parse(localStorage.getItem('tipos_geograficos_custom') || '[]'); }
            catch { return []; }
        })();

        // No guardamos estado extra de tipos para no “sobreponer UI”,
        // solo los añadimos a la lista de disponibles con una variable derivada,
        // así que forzamos un re-render con un noop: usando filtroTipo setter si hace falta.
        // Mejor: guardarlos en un state mínimo.
    }, []);

    const [tiposCustom, setTiposCustom] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tipos_geograficos_custom') || '[]'); }
        catch { return []; }
    });

    const tiposDisponiblesFinal = [...new Set([...TIPOS_BASE, ...tiposDesdeDB, ...tiposCustom])];

    const conteoPorTipoFinal = tiposDisponiblesFinal.reduce((acc, t) => {
        acc[t] = registros.filter(r => r.tipo === t).length;
        return acc;
    }, {});

    const crearTipoFinal = () => {
        const t = (nuevoTipo || '').trim();
        if (!t) return;

        const existe = tiposDisponiblesFinal.some(x => x.toLowerCase() === t.toLowerCase());
        if (existe) {
            setNuevoTipo('');
            return;
        }

        const next = [...tiposCustom, t];
        setTiposCustom(next);
        localStorage.setItem('tipos_geograficos_custom', JSON.stringify(next));
        setNuevoTipo('');
        alert('✅ Tipo creado (ya puedes seleccionarlo al crear un registro)');
    };

    const eliminarTipo = async () => {
        if (!tipoAEliminar) return;

        const cantidad = conteoPorTipoFinal[tipoAEliminar] || 0;

        if (cantidad > 0) {
            if (!reemplazoTipo) {
                alert('❌ Este tipo está en uso. Selecciona un tipo de reemplazo para reasignar los registros.');
                return;
            }
            if (reemplazoTipo === tipoAEliminar) {
                alert('❌ El tipo de reemplazo no puede ser el mismo.');
                return;
            }
            if (!confirm(`Este tipo está en uso por ${cantidad} registro(s).\nSe reasignarán a "${reemplazoTipo}" y luego se eliminará el tipo.\n\n¿Continuar?`)) {
                return;
            }

            // Reasignación en DB: actualiza los registros que tienen ese tipo
            try {
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
                if (!response.ok) throw new Error(data.message || 'Error al reasignar tipos');

                await cargarRegistros();
                await cargarPadres();
            } catch (e) {
                alert('❌ ' + e.message + '\n\n(Nota: necesitas crear esta ruta en el backend para reasignar tipos)');
                return;
            }
        } else {
            if (!confirm(`¿Eliminar el tipo "${tipoAEliminar}"?`)) return;
        }

        // Eliminar tipo de la lista custom (si es custom)
        const nextCustom = tiposCustom.filter(t => t !== tipoAEliminar);
        setTiposCustom(nextCustom);
        localStorage.setItem('tipos_geograficos_custom', JSON.stringify(nextCustom));

        if (filtroTipo === tipoAEliminar) setFiltroTipo('');
        setTipoAEliminar('');
        setReemplazoTipo('');
        alert('✅ Tipo eliminado');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24]"></div>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-gray-50 font-sans">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-8 bg-[#E31E24] rounded-sm block"></span>
                        Parámetros Geográficos
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 ml-4">
                        Gestión de la estructura territorial del departamento.
                    </p>
                </div>

                <button
                    onClick={() => abrirModal()}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    Nuevo Registro
                </button>
            </div>

            {/* TARJETA DE CONTENIDO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* FILTROS Y BUSCADOR */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-end">

                    {/* Filtro Tipo */}
                    <div className="w-full md:w-64">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                            Filtrar por Tipo
                        </label>
                        <div className="relative group">
                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold focus:ring-2 focus:ring-red-100 focus:border-[#E31E24] outline-none appearance-none transition-all cursor-pointer hover:border-gray-300"
                            >
                                <option value="">Todos los tipos</option>
                                {tiposDisponiblesFinal.map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#E31E24] transition-colors">
                                <MapPin size={18} />
                            </div>
                        </div>

                        {/* Botón admin para gestionar tipos (sin “sobreponer” chips ni botones extras) */}
                        {esAdmin && (
                            <button
                                type="button"
                                onClick={abrirModalTipos}
                                className="mt-2 text-xs font-bold text-[#E31E24] hover:underline"
                            >
                                Gestionar tipos
                            </button>
                        )}
                    </div>

                    {/* Buscador */}
                    <div className="flex-1 w-full">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                            Buscar
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-red-100 focus:border-[#E31E24] outline-none transition-all placeholder:text-gray-400"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#E31E24] transition-colors">
                                <Search size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="overflow-x-auto">
                    {error && registros.length === 0 ? (
                        <div className="p-10 text-center text-red-500">{error}</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100">
                                    <th className="p-5 font-bold text-center w-20">#</th>
                                    <th className="p-5 font-bold">Nombre</th>
                                    <th className="p-5 font-bold">Código</th>
                                    <th className="p-5 font-bold">Tipo</th>
                                    <th className="p-5 font-bold">Padre</th>
                                    <th className="p-5 font-bold text-center w-48">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                                {registrosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center text-gray-400">
                                            No se encontraron registros
                                        </td>
                                    </tr>
                                ) : (
                                    registrosFiltrados.map((reg, index) => (
                                        <tr
                                            key={reg.id_geografico}
                                            className="hover:bg-red-50/30 transition-colors group cursor-pointer"
                                            onClick={() => abrirDetalle(reg)}
                                        >
                                            <td className="p-5 text-center font-bold text-gray-300 group-hover:text-[#E31E24] transition-colors">
                                                {index + 1}
                                            </td>
                                            <td className="p-5 font-bold text-gray-800 text-base">{reg.nombre}</td>
                                            <td className="p-5 text-gray-600">{reg.codigo || '-'}</td>
                                            <td className="p-5">
                                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs">
                                                    {reg.tipo}
                                                </span>
                                            </td>
                                            <td className="p-5 text-gray-500 text-xs">{reg.nombre_padre || 'Sin padre'}</td>

                                            <td className="p-5 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => abrirModal(reg)}
                                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-1"
                                                >
                                                    <Edit size={14} /> Editar
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(reg.id_geografico, reg.nombre)}
                                                    className="px-4 py-2 bg-white border border-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-all flex items-center gap-1"
                                                >
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
                    <span className="font-medium">
                        Mostrando {registrosFiltrados.length} de {registros.length} registros
                    </span>
                </div>
            </div>

            {/* MODAL CREAR/EDITAR */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        <div className="sticky top-0 bg-gray-900 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
                            <h2 className="text-xl font-bold">
                                {modoEdicion ? 'Editar Registro' : 'Nuevo Registro Geográfico'}
                            </h2>
                            <button onClick={cerrarModal} className="hover:bg-gray-800 p-2 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={nuevoRegistro.nombre}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="Ej: Cercado"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Código
                                    </label>
                                    <input
                                        type="text"
                                        name="codigo"
                                        value={nuevoRegistro.codigo}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="Ej: CBBA-CER"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Tipo *
                                    </label>
                                    <select
                                        name="tipo"
                                        value={nuevoRegistro.tipo}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    >
                                        <option value="">Selecciona un tipo...</option>
                                        {tiposDisponiblesFinal.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Padre (Jerarquía)
                                    </label>
                                    <select
                                        name="fk_id_geografico"
                                        value={nuevoRegistro.fk_id_geografico}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                                    <p className="text-xs text-gray-500 mt-1">
                                        Selecciona el registro padre si este es un nivel inferior
                                    </p>
                                </div>
                            </div>

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
                                    className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE (PADRE + HIJOS) */}
            {modalDetalleAbierto && registroDetalle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-900 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold">Detalle Geográfico</h2>
                                <p className="text-white/70 text-xs mt-1">
                                    {registroDetalle.nombre} • {registroDetalle.tipo}
                                </p>
                            </div>
                            <button onClick={cerrarDetalle} className="hover:bg-gray-800 p-2 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">
                                    Padre
                                </h3>
                                {detallePadre ? (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{detallePadre.nombre}</p>
                                            <p className="text-xs text-gray-500">{detallePadre.tipo}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                cerrarDetalle();
                                                abrirDetalle(detallePadre);
                                            }}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                                        >
                                            Ver padre
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Sin padre (nivel superior)</p>
                                )}
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">
                                    Hijos
                                </h3>

                                {detalleHijos.length === 0 ? (
                                    <p className="text-sm text-gray-500">No tiene hijos registrados.</p>
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
                                                className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:bg-gray-50 transition"
                                            >
                                                <p className="font-bold text-gray-900">{h.nombre}</p>
                                                <p className="text-xs text-gray-500">
                                                    {h.tipo}{h.codigo ? ` • ${h.codigo}` : ''}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        cerrarDetalle();
                                        abrirModal(registroDetalle);
                                    }}
                                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        cerrarDetalle();
                                        handleEliminar(registroDetalle.id_geografico, registroDetalle.nombre);
                                    }}
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
                                >
                                    Eliminar
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GESTIONAR TIPOS (ADMIN) */}
            {modalTiposAbierto && esAdmin && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-900 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
                            <h2 className="text-xl font-bold">Gestionar Tipos</h2>
                            <button onClick={cerrarModalTipos} className="hover:bg-gray-800 p-2 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Crear */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Crear nuevo tipo
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={nuevoTipo}
                                        onChange={(e) => setNuevoTipo(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="Ej: Distrito"
                                    />
                                    <button
                                        type="button"
                                        onClick={crearTipoFinal}
                                        className="px-5 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition"
                                    >
                                        Crear
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Este tipo quedará disponible para seleccionarlo al crear/editar registros.
                                </p>
                            </div>

                            {/* Eliminar */}
                            <div className="border-t border-gray-200 pt-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Eliminar tipo
                                </label>

                                <select
                                    value={tipoAEliminar}
                                    onChange={(e) => {
                                        setTipoAEliminar(e.target.value);
                                        setReemplazoTipo('');
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                >
                                    <option value="">Selecciona un tipo...</option>
                                    {tiposDisponiblesFinal.map(t => (
                                        <option key={t} value={t}>
                                            {t} ({conteoPorTipoFinal[t] || 0})
                                        </option>
                                    ))}
                                </select>

                                {tipoAEliminar && (conteoPorTipoFinal[tipoAEliminar] || 0) > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-600 mb-2">
                                            Este tipo está en uso. Para eliminarlo, reasigna sus registros a otro tipo:
                                        </p>
                                        <select
                                            value={reemplazoTipo}
                                            onChange={(e) => setReemplazoTipo(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        >
                                            <option value="">Selecciona tipo de reemplazo...</option>
                                            {tiposDisponiblesFinal
                                                .filter(t => t !== tipoAEliminar)
                                                .map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                        </select>

                                        <p className="text-[11px] text-gray-500 mt-2">
                                            ⚠️ Para que funcione la reasignación, necesitas una ruta en backend:
                                            <span className="font-mono"> POST /geografico/tipos/reasignar</span>
                                            con <span className="font-mono">{"{ tipo_origen, tipo_destino }"}</span>.
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={eliminarTipo}
                                    disabled={!tipoAEliminar}
                                    className={`mt-4 w-full px-6 py-3 rounded-lg font-bold transition ${
                                        tipoAEliminar
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Eliminar tipo
                                </button>

                                <p className="text-xs text-gray-500 mt-2">
                                    Si el tipo no está en uso, se elimina de la lista disponible. Si está en uso, se reasigna y luego se elimina.
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={cerrarModalTipos}
                                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Geografia;
