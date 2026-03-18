import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertCircle, Loader, Users, Clock, XCircle, Eye, Edit, FileCheck, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalConfirmacion from '../components/ModalConfirmacion';
import useModal from '../hooks/useModal';

const MiMesa = () => {
    const navigate = useNavigate();
    const [misMesas, setMisMesas] = useState([]);
    const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
    const [actas, setActas] = useState([]);
    const [frentes, setFrentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRegistrarVotos, setShowRegistrarVotos] = useState(false);
    const [savingVotos, setSavingVotos] = useState(false);

    // Estados para votos por partidos
    const [votosAlcalde, setVotosAlcalde] = useState([]);
    const [votosConcejal, setVotosConcejal] = useState([]);
    const [votosNulos, setVotosNulos] = useState('');
    const [votosBlancos, setVotosBlancos] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [imagenActa, setImagenActa] = useState(null);

    // Estados para ver detalle/edición
    const [actaDetalle, setActaDetalle] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [editImagenActa, setEditImagenActa] = useState(null);

    // Modal
    const { isOpen, modalConfig, cerrarModal, mostrarExito, mostrarError, mostrarAdvertencia, mostrarModal } = useModal();

    const API_URL = import.meta.env.VITE_API_URL;
    const BASE_URL = API_URL.replace('/api', '');
    const token = localStorage.getItem('token');

    useEffect(() => {
        cargarMesaYActas();
        cargarFrentes();
    }, []);

    const toInt = (v) => {
        const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
        return Number.isFinite(n) ? n : 0;
    };

    const cargarMesaYActas = async () => {
        try {
            setLoading(true);

            const resMesa = await fetch(`${API_URL}/permisos/delegado/mi-mesa`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dataMesa = await resMesa.json();
            console.log('Mis mesas:', dataMesa.data);

            if (dataMesa.success) {
                const mesas = Array.isArray(dataMesa.data) ? dataMesa.data : [dataMesa.data];
                setMisMesas(mesas);

                if (mesas.length > 0) {
                    setMesaSeleccionada(mesas[0]);
                    // Cargar actas para todas las mesas
                    const resActas = await fetch(`${API_URL}/votos`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const dataActas = await resActas.json();

                    if (dataActas.success) {
                        const mesasIds = mesas.map(m => parseInt(m.id_mesa));
                        const actasMesas = dataActas.data.filter(a => mesasIds.includes(parseInt(a.id_mesa)));
                        setActas(actasMesas);
                    }
                }
            } else {
                setError('No tienes mesas asignadas');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error al cargar datos');
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

    const updateVotos = (tipo, idFrente, valueStr) => {
        const setVotos = tipo === 'alcalde' ? setVotosAlcalde : setVotosConcejal;
        setVotos((prev) =>
            prev.map((v) => (v.id_frente === idFrente ? { ...v, cantidad: valueStr } : v))
        );
    };

    const getMesaTieneActa = (idMesa) => {
        return actas.some(a => parseInt(a.id_mesa) === parseInt(idMesa));
    };

    const getActaDeMesa = (idMesa) => {
        return actas.find(a => parseInt(a.id_mesa) === parseInt(idMesa));
    };

    const handleIntentarRegistrar = () => {
        if (!mesaSeleccionada) return;

        // Verificar si la mesa ya tiene acta
        if (getMesaTieneActa(mesaSeleccionada.id_mesa)) {
            const actaExistente = getActaDeMesa(mesaSeleccionada.id_mesa);
            mostrarModal(
                'warning',
                'Mesa con Acta Registrada',
                `Esta mesa ya tiene un acta registrada (Estado: ${actaExistente?.estado_aprobacion || 'pendiente'}). Solo puedes ver o editar el acta existente, no crear una nueva.`,
                'Entendido'
            );
            return;
        }

        setShowRegistrarVotos(true);
    };

    const handleRegistrarVotos = async (e) => {
        e.preventDefault();

        const hayVotosAlcalde = votosAlcalde.some((v) => toInt(v.cantidad) > 0);
        const hayVotosConcejal = votosConcejal.some((v) => toInt(v.cantidad) > 0);

        if (!hayVotosAlcalde && !hayVotosConcejal && toInt(votosNulos) === 0 && toInt(votosBlancos) === 0) {
            mostrarError('Datos Incompletos', 'Debe registrar al menos un voto para continuar.');
            return;
        }

        try {
            setSavingVotos(true);

            const formData = new FormData();
            formData.append('id_mesa', mesaSeleccionada.id_mesa);
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
                mostrarModal(
                    'warning',
                    'Acta Ya Existe',
                    'Esta mesa ya tiene un acta registrada. Solo puedes editar el acta existente.',
                    'Entendido'
                );
                return;
            }

            if (data.success) {
                mostrarExito(
                    'Acta Registrada Exitosamente',
                    `Los votos de la Mesa ${mesaSeleccionada.numero_mesa} han sido registrados. Estado: Pendiente de aprobación.`
                );

                resetFormulario();
                setShowRegistrarVotos(false);
                cargarMesaYActas();
            } else {
                mostrarError('Error al Registrar', data.message || 'No se pudieron registrar los votos. Inténtalo de nuevo.');
            }
        } catch (err) {
            console.error('Error:', err);
            mostrarError('Error de Conexión', 'No se pudo conectar con el servidor.');
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
                cargarMesaYActas();
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

    const getBadgeEstado = (estado) => {
        switch (estado) {
            case 'aprobado':
                return { text: 'Aprobado', color: 'bg-green-100 text-green-700', icon: CheckCircle };
            case 'rechazado':
                return { text: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle };
            case 'pendiente':
            default:
                return { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-[#1E3A8A]" />
            </div>
        );
    }

    if (error && !mesaSeleccionada && misMesas.length === 0) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    const totalVotosAlcalde = votosAlcalde.reduce((sum, v) => sum + toInt(v.cantidad), 0);
    const totalVotosConcejal = votosConcejal.reduce((sum, v) => sum + toInt(v.cantidad), 0);
    const totalGeneral = totalVotosAlcalde + totalVotosConcejal + toInt(votosNulos) + toInt(votosBlancos);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Modal de Confirmación */}
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
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Mi Mesa Electoral</h1>
                            <p className="text-white/80 mt-1">Registrar y gestionar actas de votación</p>
                        </div>
                        <button
                            onClick={handleIntentarRegistrar}
                            disabled={!mesaSeleccionada || getMesaTieneActa(mesaSeleccionada?.id_mesa)}
                            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition ${
                                getMesaTieneActa(mesaSeleccionada?.id_mesa)
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-[#10B981] hover:bg-[#059669]'
                            }`}
                        >
                            <Plus size={20} />
                            {getMesaTieneActa(mesaSeleccionada?.id_mesa) ? 'Acta Registrada' : 'Registrar Acta'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Información de la Mesa */}
                {mesaSeleccionada && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Información de tu Mesa</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-[#1E3A8A]/10 to-[#1E3A8A]/5 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 font-medium">Mesa</p>
                                <p className="text-2xl font-bold text-[#1E3A8A]">{mesaSeleccionada.numero_mesa}</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 font-medium">Recinto</p>
                                <p className="text-lg font-bold text-[#10B981]">{mesaSeleccionada.recinto_nombre || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 font-medium">Distrito</p>
                                <p className="text-lg font-medium text-[#F59E0B]">{mesaSeleccionada.distrito_nombre || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 font-medium">Estado del Acta</p>
                                {getMesaTieneActa(mesaSeleccionada.id_mesa) ? (
                                    (() => {
                                        const acta = getActaDeMesa(mesaSeleccionada.id_mesa);
                                        const badge = getBadgeEstado(acta?.estado_aprobacion);
                                        const IconoBadge = badge.icon;
                                        return (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mt-1 ${badge.color}`}>
                                                <IconoBadge className="w-4 h-4" />
                                                {badge.text}
                                            </span>
                                        );
                                    })()
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mt-1 bg-gray-100 text-gray-600">
                                        <AlertCircle className="w-4 h-4" />
                                        Sin Acta
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Mostrar motivo de rechazo si existe */}
                        {getMesaTieneActa(mesaSeleccionada.id_mesa) &&
                         getActaDeMesa(mesaSeleccionada.id_mesa)?.estado_aprobacion === 'rechazado' && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm font-medium text-red-800 mb-1">Motivo del Rechazo:</p>
                                <p className="text-sm text-red-700">
                                    {getActaDeMesa(mesaSeleccionada.id_mesa)?.motivo_rechazo || 'No especificado'}
                                </p>
                                <button
                                    onClick={() => handleEditarActa(getActaDeMesa(mesaSeleccionada.id_mesa))}
                                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center gap-2"
                                >
                                    <Edit size={16} />
                                    Corregir y Reenviar
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Mesas Listado */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Users size={18} />
                                    Mis Mesas ({misMesas.length})
                                </h3>
                            </div>

                            <div className="divide-y max-h-96 overflow-y-auto">
                                {misMesas.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        No tienes mesas asignadas
                                    </div>
                                ) : (
                                    misMesas.map(mesa => {
                                        const tieneActa = getMesaTieneActa(mesa.id_mesa);
                                        const actaMesa = tieneActa ? getActaDeMesa(mesa.id_mesa) : null;
                                        const isSelected = mesaSeleccionada?.id_mesa === mesa.id_mesa;
                                        const badge = tieneActa ? getBadgeEstado(actaMesa?.estado_aprobacion) : null;

                                        return (
                                            <button
                                                key={mesa.id_mesa}
                                                onClick={() => setMesaSeleccionada(mesa)}
                                                className={`w-full p-4 text-left transition hover:bg-gray-50 ${
                                                    isSelected ? 'bg-[#1E3A8A]/5 border-l-4 border-[#1E3A8A]' : ''
                                                }`}
                                            >
                                                <div className="font-semibold text-gray-900">Mesa {mesa.numero_mesa}</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {tieneActa && badge ? (
                                                        <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${badge.color}`}>
                                                            {React.createElement(badge.icon, { className: 'w-3 h-3' })}
                                                            {badge.text}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                            Sin acta
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Panel Derecha */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Formulario Registrar Votos */}
                        {showRegistrarVotos && mesaSeleccionada && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Plus size={20} className="text-[#10B981]" />
                                    Registrar Acta - Mesa {mesaSeleccionada.numero_mesa}
                                </h2>

                                <form onSubmit={handleRegistrarVotos} className="space-y-6">
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

                        {/* Historial de Actas Mejorado */}
                        {mesaSeleccionada && !showRegistrarVotos && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white flex items-center justify-between">
                                    <h2 className="text-lg font-bold">Historial de Actas - Mesa {mesaSeleccionada.numero_mesa}</h2>
                                    {getMesaTieneActa(mesaSeleccionada.id_mesa) && (
                                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                            1 acta registrada
                                        </span>
                                    )}
                                </div>

                                {!getMesaTieneActa(mesaSeleccionada.id_mesa) ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="mb-4">No hay actas registradas para esta mesa</p>
                                        <button
                                            onClick={handleIntentarRegistrar}
                                            className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition text-sm font-medium"
                                        >
                                            Registrar Primera Acta
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {actas.filter(a => parseInt(a.id_mesa) === parseInt(mesaSeleccionada.id_mesa)).map(acta => {
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
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => { setActaDetalle(null); setModoEdicion(false); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <h3 className="text-xl font-bold">
                                {modoEdicion ? 'Editar Acta' : 'Detalle del Acta'} - Mesa {mesaSeleccionada?.numero_mesa}
                            </h3>
                            <button
                                onClick={() => { setActaDetalle(null); setModoEdicion(false); setEditImagenActa(null); }}
                                className="text-white/80 hover:text-white transition"
                            >
                                <AlertCircle className="w-6 h-6" />
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
                                    {actaDetalle.imagen_acta && (
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3">Imagen del Acta</h4>
                                            <img
                                                src={`${BASE_URL}/uploads/actas/${actaDetalle.imagen_acta}`}
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

export default MiMesa;
