import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Loader, AlertCircle, CheckCircle, Lock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalConfirmacion from '../components/ModalConfirmacion';
import useModal from '../hooks/useModal';

const AsignarRecinto = () => {
    const navigate = useNavigate();
    const [jefes, setJefes] = useState([]);
    const [recintos, setRecintos] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [selectedJefe, setSelectedJefe] = useState('');
    const [selectedRecinto, setSelectedRecinto] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [jefasActual, setJefasActual] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [errorAcceso, setErrorAcceso] = useState(null);
    const [busquedaJefe, setBusquedaJefe] = useState('');
    const [busquedaRecinto, setBusquedaRecinto] = useState('');

    // Modal
    const { isOpen, modalConfig, cerrarModal, mostrarExito, mostrarError, mostrarAdvertencia, mostrarModal } = useModal();
    const [modalEliminar, setModalEliminar] = useState({ open: false, idAsignacion: null, nombre: '' });

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
                    setErrorAcceso(`Solo administradores y operadores pueden acceder. Tu rol: ${roles[payload.id_rol] || 'Desconocido'}`);
                    return;
                }
                cargarDatos();
            } catch (e) {
                console.error('Error al decodificar token:', e);
                setErrorAcceso('Error al verificar tu rol. Intenta login nuevamente.');
                setLoading(false);
            }
        } else {
            navigate('/login');
        }
    }, []);

    // Verificar asignaciones del jefe seleccionado
    useEffect(() => {
        if (selectedJefe) {
            const asignacionesJefe = asignaciones.filter(
                (a) => a.id_usuario === parseInt(selectedJefe) && a.activo === true
            );
            setJefasActual(asignacionesJefe.length > 0 ? asignacionesJefe : null);
        } else {
            setJefasActual(null);
        }
    }, [selectedJefe, asignaciones]);

    const cargarDatos = async () => {
        try {
            setLoading(true);

            // Cargar jefes (usuarios con rol Jefe de Recinto)
            const resJefes = await fetch(`${API_URL}/usuarios?id_rol=4`, {
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
            mostrarError('Error al Cargar Datos', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar jefes
    const jefesFiltrados = jefes.filter(j => {
        if (!busquedaJefe) return true;
        const term = busquedaJefe.toLowerCase();
        return j.nombre_usuario?.toLowerCase().includes(term);
    });

    // Filtrar recintos
    const recintosFiltrados = recintos.filter(r => {
        if (!busquedaRecinto) return true;
        const term = busquedaRecinto.toLowerCase();
        const matchNombre = r.nombre?.toLowerCase().includes(term);
        const matchDistrito = r.distrito_nombre?.toLowerCase().includes(term);
        const matchMunicipio = r.nombre_geografico?.toLowerCase().includes(term);
        return matchNombre || matchDistrito || matchMunicipio;
    });

    const handleAsignar = async (e) => {
        e.preventDefault();

        if (!selectedJefe || !selectedRecinto) {
            mostrarError('Campos Requeridos', 'Selecciona un jefe y un recinto para continuar.');
            return;
        }

        // Verificar que el recinto no esté ya asignado a este jefe
        if (jefasActual) {
            const yaAsignado = Array.isArray(jefasActual)
                ? jefasActual.some(a => a.id_recinto === parseInt(selectedRecinto))
                : jefasActual.id_recinto === parseInt(selectedRecinto);

            if (yaAsignado) {
                mostrarAdvertencia(
                    'Recinto Ya Asignado',
                    'Este jefe ya tiene asignado este recinto. Por favor selecciona otro recinto diferente.'
                );
                return;
            }
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
                mostrarExito('Asignaci\u00f3n Exitosa', 'El recinto ha sido asignado al jefe correctamente.');
                setSelectedJefe('');
                setSelectedRecinto('');
                // Recargar asignaciones
                setTimeout(() => cargarDatos(), 1000);
            } else {
                mostrarError('Error al Asignar', data.error || 'No se pudo asignar el recinto. Int\u00e9ntalo de nuevo.');
            }
        } catch (error) {
            mostrarError('Error de Conexi\u00f3n', 'No se pudo conectar con el servidor. Verifica tu conexi\u00f3n.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmarEliminar = (idAsignacion, nombre) => {
        setModalEliminar({ open: true, idAsignacion, nombre });
    };

    const handleEliminar = async () => {
        const { idAsignacion } = modalEliminar;
        setModalEliminar({ open: false, idAsignacion: null, nombre: '' });

        try {
            const response = await fetch(`${API_URL}/permisos/jefe/${idAsignacion}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                mostrarExito('Asignaci\u00f3n Desactivada', 'La asignaci\u00f3n del jefe al recinto ha sido desactivada correctamente.');
                setTimeout(() => cargarDatos(), 500);
            } else {
                mostrarError('Error', 'No se pudo desactivar la asignaci\u00f3n. Int\u00e9ntalo de nuevo.');
            }
        } catch (error) {
            mostrarError('Error de Conexi\u00f3n', 'No se pudo conectar con el servidor.');
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
            {/* Modal de Confirmaci\u00f3n */}
            <ModalConfirmacion
                isOpen={isOpen}
                onClose={cerrarModal}
                tipo={modalConfig.tipo}
                titulo={modalConfig.titulo}
                mensaje={modalConfig.mensaje}
                botonTexto={modalConfig.botonTexto}
            />

            {/* Modal de Confirmaci\u00f3n para Eliminar */}
            {modalEliminar.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setModalEliminar({ open: false, idAsignacion: null, nombre: '' })} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mb-4">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                            Confirmar Desactivaci\u00f3n
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            \u00bfEst\u00e1s seguro de desactivar la asignaci\u00f3n del recinto <strong>{modalEliminar.nombre}</strong>? Esta acci\u00f3n se puede revertir.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setModalEliminar({ open: false, idAsignacion: null, nombre: '' })}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEliminar}
                                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                            >
                                Desactivar
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    <p className="text-gray-600 mt-1">Asigna recintos a jefes de recinto (pueden tener m\u00faltiples recintos)</p>
                </div>
            </div>

            {/* Error de Acceso */}
            {errorAcceso && (
                <div className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3 bg-red-50 border-red-500 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{errorAcceso}</span>
                </div>
            )}

            {/* Formulario */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <form onSubmit={handleAsignar} className="space-y-6">
                    {/* Alerta si el jefe ya tiene asignaciones */}
                    {jefasActual && Array.isArray(jefasActual) && jefasActual.length > 0 && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex items-start gap-3 rounded">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-blue-900">Asignaciones Actuales</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Este jefe tiene {jefasActual.length} recinto(s) asignado(s):
                                </p>
                                <ul className="mt-2 space-y-1">
                                    {jefasActual.map((asig, index) => (
                                        <li key={index} className="text-sm text-blue-700">
                                            • <strong>{asig.nombre}</strong> ({asig.total_mesas || 0} mesas)
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-blue-600 mt-2 italic">
                                    Puedes asignar recintos adicionales a este jefe
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
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={busquedaJefe}
                                    onChange={(e) => setBusquedaJefe(e.target.value)}
                                    placeholder="Buscar jefe..."
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5CF6] text-sm"
                                />
                            </div>
                            <select
                                value={selectedJefe}
                                onChange={(e) => setSelectedJefe(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition"
                            >
                                <option value="">-- Selecciona un jefe --</option>
                                {jefesFiltrados.map((j) => (
                                    <option key={j.id_usuario} value={j.id_usuario}>
                                        {j.nombre_usuario}
                                    </option>
                                ))}
                            </select>
                            {busquedaJefe && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {jefesFiltrados.length} de {jefes.length} jefes
                                </p>
                            )}
                        </div>

                        {/* Seleccionar Recinto */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Recinto
                            </label>
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={busquedaRecinto}
                                    onChange={(e) => setBusquedaRecinto(e.target.value)}
                                    placeholder="Buscar por nombre, distrito o municipio..."
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5CF6] text-sm"
                                />
                            </div>
                            <select
                                value={selectedRecinto}
                                onChange={(e) => setSelectedRecinto(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] transition"
                            >
                                <option value="">-- Selecciona un recinto --</option>
                                {recintosFiltrados.map((r) => (
                                    <option key={r.id_recinto} value={r.id_recinto}>
                                        {r.nombre} | {r.distrito_nombre || 'Sin distrito'} | {r.nombre_geografico || 'Sin municipio'}
                                    </option>
                                ))}
                            </select>
                            {busquedaRecinto && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {recintosFiltrados.length} de {recintos.length} recintos
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
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
                                                    onClick={() => handleConfirmarEliminar(a.id_jefe_recinto, a.nombre)}
                                                    className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Desactivar asignaci\u00f3n"
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
