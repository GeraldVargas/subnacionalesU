import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Loader, AlertCircle, CheckCircle, Lock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AsignarMesa = () => {
    const navigate = useNavigate();
    const [delegados, setDelegados] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [selectedDelegado, setSelectedDelegado] = useState('');
    const [selectedMesa, setSelectedMesa] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [usuario, setUsuario] = useState(null);
    const [busquedaDelegado, setBusquedaDelegado] = useState('');
    const [busquedaMesa, setBusquedaMesa] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Decodificar token para verificar rol
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('Usuario desde token:', payload);
                setUsuario(payload);
                if (payload.id_rol !== 1 && payload.id_rol !== 2) {
                    setLoading(false);
                    const roles = { 2: 'Operador', 3: 'Delegado de Mesa', 4: 'Jefe de Recinto' };
                    setMessage({ type: 'error', text: `Solo administradores y operadores pueden acceder. Tu rol: ${roles[payload.id_rol] || 'Desconocido'}` });
                    return;
                }
                cargarDatos();
            } catch (e) {
                console.error('Error al decodificar token:', e);
                setMessage({ type: 'error', text: 'Error al verificar tu rol. Intenta login nuevamente.' });
                setLoading(false);
            }
        } else {
            navigate('/login');
        }
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            // Cargar delegados (usuarios con rol Delegado de Mesa)
            const resDelegados = await fetch(`${API_URL}/usuarios?id_rol=3`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Delegados response:', resDelegados.status);

            // Cargar mesas
            const resMesas = await fetch(`${API_URL}/geografico?tipo=mesa`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Mesas response:', resMesas.status);

            // Cargar asignaciones actuales
            const resAsignaciones = await fetch(`${API_URL}/permisos/delegados`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Asignaciones response:', resAsignaciones.status);

            if (!resDelegados.ok) {
                const errData = await resDelegados.json();
                throw new Error(`Delegados error (${resDelegados.status}): ${errData.message || resDelegados.statusText}`);
            }
            if (!resMesas.ok) {
                const errData = await resMesas.json();
                throw new Error(`Mesas error (${resMesas.status}): ${errData.message || resMesas.statusText}`);
            }
            if (!resAsignaciones.ok) {
                const errData = await resAsignaciones.json();
                throw new Error(`Asignaciones error (${resAsignaciones.status}): ${errData.message || resAsignaciones.statusText}`);
            }

            const dataDelegados = await resDelegados.json();
            const dataMesas = await resMesas.json();
            const dataAsignaciones = await resAsignaciones.json();

            // Extraer .data si existe, sino usar directamente
            setDelegados(dataDelegados.data ? dataDelegados.data : (Array.isArray(dataDelegados) ? dataDelegados : []));
            setMesas(dataMesas.data ? dataMesas.data : (Array.isArray(dataMesas) ? dataMesas : []));
            setAsignaciones(Array.isArray(dataAsignaciones) ? dataAsignaciones : (dataAsignaciones.data || []));
        } catch (error) {
            console.error('Error detallado:', error);
            setMessage({ type: 'error', text: 'Error al cargar datos: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    // Filtrar delegados
    const delegadosFiltrados = delegados.filter(d => {
        if (!busquedaDelegado) return true;
        const term = busquedaDelegado.toLowerCase();
        return d.nombre_usuario?.toLowerCase().includes(term);
    });

    // Filtrar mesas
    const mesasFiltradas = mesas.filter(m => {
        if (!busquedaMesa) return true;
        const term = busquedaMesa.toLowerCase();
        const matchCodigo = m.codigo?.toLowerCase().includes(term);
        const matchNumero = m.numero_mesa?.toString().includes(term);
        const matchRecinto = m.recinto_nombre?.toLowerCase().includes(term);
        return matchCodigo || matchNumero || matchRecinto;
    });

    const handleAsignar = async (e) => {
        e.preventDefault();

        if (!selectedDelegado || !selectedMesa) {
            setMessage({ type: 'error', text: 'Selecciona un delegado y una mesa' });
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch(`${API_URL}/permisos/asignar-delegado`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_usuario: parseInt(selectedDelegado),
                    id_mesa: parseInt(selectedMesa)
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Mesa asignada exitosamente' });
                setSelectedDelegado('');
                setSelectedMesa('');
                // Recargar asignaciones
                setTimeout(() => cargarDatos(), 1000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al asignar mesa' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error: ' + error.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEliminar = async (idAsignacion) => {
        if (!window.confirm('¿Desactivar esta asignación?')) return;

        try {
            const response = await fetch(`${API_URL}/permisos/delegado/${idAsignacion}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Asignación desactivada' });
                setTimeout(() => cargarDatos(), 500);
            } else {
                setMessage({ type: 'error', text: 'Error al desactivar asignación' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error: ' + error.message });
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-[#1E3A8A]" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Asignar Mesa a Delegado</h1>
                    <p className="text-gray-600 mt-1">Asigna mesas a delegados de mesa</p>
                </div>
            </div>

            {/* Messages */}
            {message.text && (
                <div
                    className={`mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3 ${
                        message.type === 'success'
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : 'bg-red-50 border-red-500 text-red-700'
                    }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Formulario */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <form onSubmit={handleAsignar} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Seleccionar Delegado */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Delegado de Mesa
                            </label>
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={busquedaDelegado}
                                    onChange={(e) => setBusquedaDelegado(e.target.value)}
                                    placeholder="Buscar delegado..."
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1E3A8A] text-sm"
                                />
                            </div>
                            <select
                                value={selectedDelegado}
                                onChange={(e) => setSelectedDelegado(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition"
                            >
                                <option value="">-- Selecciona un delegado --</option>
                                {delegadosFiltrados.map((d) => (
                                    <option key={d.id_usuario} value={d.id_usuario}>
                                        {d.nombre_usuario}
                                    </option>
                                ))}
                            </select>
                            {busquedaDelegado && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {delegadosFiltrados.length} de {delegados.length} delegados
                                </p>
                            )}
                        </div>

                        {/* Seleccionar Mesa */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Mesa
                            </label>
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={busquedaMesa}
                                    onChange={(e) => setBusquedaMesa(e.target.value)}
                                    placeholder="Buscar por codigo, numero o recinto..."
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1E3A8A] text-sm"
                                />
                            </div>
                            <select
                                value={selectedMesa}
                                onChange={(e) => setSelectedMesa(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition"
                            >
                                <option value="">-- Selecciona una mesa --</option>
                                {mesasFiltradas.map((m) => (
                                    <option key={m.id_mesa} value={m.id_mesa}>
                                        {m.codigo || '-'} | Mesa {m.numero_mesa} | {m.recinto_nombre || 'Sin recinto'}
                                    </option>
                                ))}
                            </select>
                            {busquedaMesa && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {mesasFiltradas.length} de {mesas.length} mesas
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Asignando...
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5" />
                                Asignar Mesa
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Listado de Asignaciones */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] px-8 py-4">
                    <h2 className="text-xl font-bold text-white">Asignaciones Actuales</h2>
                </div>

                {asignaciones.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No hay asignaciones aún</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700">
                                        Delegado
                                    </th>
                                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700">
                                        Mesa
                                    </th>
                                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700">
                                        Recinto
                                    </th>
                                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700">
                                        Asignado
                                    </th>
                                    <th className="px-8 py-4 text-center text-sm font-bold text-gray-700">
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {asignaciones.map((a, idx) => (
                                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                        <td className="px-8 py-4 text-sm text-gray-900 font-semibold">
                                            {a.nombre_usuario}
                                        </td>
                                        <td className="px-8 py-4 text-sm text-gray-700">
                                            {a.numero_mesa}
                                        </td>
                                        <td className="px-8 py-4 text-sm text-gray-700">
                                            {a.recinto}
                                        </td>
                                        <td className="px-8 py-4 text-sm text-gray-600">
                                            {new Date(a.fecha_asignacion).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            {a.activo && (
                                                <button
                                                    onClick={() => handleEliminar(a.id_delegado_mesa)}
                                                    className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AsignarMesa;
