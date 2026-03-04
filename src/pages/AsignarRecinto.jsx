import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Loader, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AsignarRecinto = () => {
    const navigate = useNavigate();
    const [jefes, setJefes] = useState([]);
    const [recintos, setRecintos] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [selectedJefe, setSelectedJefe] = useState('');
    const [selectedRecinto, setSelectedRecinto] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [jefasActual, setJefasActual] = useState(null);
    const [usuario, setUsuario] = useState(null);

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

    // Verificar si el jefe seleccionado ya tiene asignación
    useEffect(() => {
        if (selectedJefe) {
            const asignacionExistente = asignaciones.find(
                (a) => a.id_usuario === parseInt(selectedJefe) && a.activo === true
            );
            setJefasActual(asignacionExistente || null);
        } else {
            setJefasActual(null);
        }
    }, [selectedJefe, asignaciones]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            // Cargar jefes (usuarios con rol Delegado de Mesa que pueden ser jefes)
            const resJefes = await fetch(`${API_URL}/usuarios?id_rol=3`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Jefes response:', resJefes.status);

            // Cargar recintos
            const resRecintos = await fetch(`${API_URL}/geografico?tipo=recinto`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Recintos response:', resRecintos.status);

            // Cargar asignaciones actuales
            const resAsignaciones = await fetch(`${API_URL}/permisos/jefes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Asignaciones response:', resAsignaciones.status);

            if (!resJefes.ok) {
                const errData = await resJefes.json();
                throw new Error(`Jefes error (${resJefes.status}): ${errData.message || resJefes.statusText}`);
            }
            if (!resRecintos.ok) {
                const errData = await resRecintos.json();
                throw new Error(`Recintos error (${resRecintos.status}): ${errData.message || resRecintos.statusText}`);
            }
            if (!resAsignaciones.ok) {
                const errData = await resAsignaciones.json();
                throw new Error(`Asignaciones error (${resAsignaciones.status}): ${errData.message || resAsignaciones.statusText}`);
            }

            const dataJefes = await resJefes.json();
            const dataRecintos = await resRecintos.json();
            const dataAsignaciones = await resAsignaciones.json();

            // Extraer .data si existe, sino usar directamente
            setJefes(dataJefes.data ? dataJefes.data : (Array.isArray(dataJefes) ? dataJefes : []));
            setRecintos(dataRecintos.data ? dataRecintos.data : (Array.isArray(dataRecintos) ? dataRecintos : []));
            setAsignaciones(Array.isArray(dataAsignaciones) ? dataAsignaciones : (dataAsignaciones.data || []));
        } catch (error) {
            console.error('Error detallado:', error);
            setMessage({ type: 'error', text: 'Error al cargar datos: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleAsignar = async (e) => {
        e.preventDefault();

        if (!selectedJefe || !selectedRecinto) {
            setMessage({ type: 'error', text: 'Selecciona un jefe y un recinto' });
            return;
        }

        // Validar que el jefe no tenga ya un recinto asignado
        if (jefasActual) {
            setMessage({ 
                type: 'error', 
                text: `Este jefe ya tiene asignado el recinto "${jefasActual.nombre}". Un jefe de recinto solo puede tener UN recinto. Desactiva la asignación anterior primero.` 
            });
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch(`${API_URL}/permisos/asignar-jefe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_usuario: parseInt(selectedJefe),
                    id_recinto: parseInt(selectedRecinto)
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Recinto asignado exitosamente' });
                setSelectedJefe('');
                setSelectedRecinto('');
                // Recargar asignaciones
                setTimeout(() => cargarDatos(), 1000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al asignar recinto' });
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
            const response = await fetch(`${API_URL}/permisos/jefe/${idAsignacion}`, {
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
                    <h1 className="text-3xl font-bold text-gray-900">Asignar Recinto a Jefe</h1>
                    <p className="text-gray-600 mt-1">Asigna recintos a jefes de recinto</p>
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
                    {/* Alerta si el jefe ya tiene asignación */}
                    {jefasActual && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex items-start gap-3 rounded">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-blue-900">Asignación Existente</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Este jefe ya tiene asignado el recinto <strong>"{jefasActual.nombre}"</strong>. 
                                    Un jefe debe tener SOLO UN recinto. Desactiva la asignación anterior para poder asignar otro.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        {/* Seleccionar Jefe */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Jefe de Recinto
                            </label>
                            <select
                                value={selectedJefe}
                                onChange={(e) => setSelectedJefe(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition"
                            >
                                <option value="">-- Selecciona un jefe --</option>
                                {jefes.map((j) => (
                                    <option key={j.id_usuario} value={j.id_usuario}>
                                        {j.nombre_usuario}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Seleccionar Recinto */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Recinto
                            </label>
                            <select
                                value={selectedRecinto}
                                onChange={(e) => setSelectedRecinto(e.target.value)}
                                disabled={!!jefasActual}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">-- Selecciona un recinto --</option>
                                {recintos.map((r) => (
                                    <option key={r.id_recinto} value={r.id_recinto}>
                                        {r.nombre} - {r.distrito_nombre || r.nombre_geografico || 'Sin distrito'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !!jefasActual}
                        className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Asignando...
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5" />
                                Asignar Recinto
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Listado de Asignaciones */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] px-8 py-4">
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
                                        Jefe
                                    </th>
                                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700">
                                        Recinto
                                    </th>
                                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700">
                                        Mesas
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
                                            {a.nombre}
                                        </td>
                                        <td className="px-8 py-4 text-sm text-gray-700">
                                            {a.mesas_count || 0}
                                        </td>
                                        <td className="px-8 py-4 text-sm text-gray-600">
                                            {new Date(a.fecha_asignacion).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            {a.activo && (
                                                <button
                                                    onClick={() => handleEliminar(a.id_jefe_recinto)}
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

export default AsignarRecinto;
