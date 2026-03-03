import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertCircle, Loader, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MiRecinto = () => {
    const navigate = useNavigate();
    const [miRecinto, setMiRecinto] = useState(null);
    const [mesas, setMesas] = useState([]);
    const [actas, setActas] = useState([]);
    const [frentes, setFrentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMesa, setSelectedMesa] = useState(null);
    const [showRegistrarVotos, setShowRegistrarVotos] = useState(false);
    const [savingVotos, setSavingVotos] = useState(false);
    
    // Estados para votos por partidos
    const [votosAlcalde, setVotosAlcalde] = useState([]);
    const [votosConcejal, setVotosConcejal] = useState([]);
    const [votosNulos, setVotosNulos] = useState('');
    const [votosBlancos, setVotosBlancos] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [imagenActa, setImagenActa] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    const toInt = (v) => {
        const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
        return Number.isFinite(n) ? n : 0;
    };

    useEffect(() => {
        cargarRecintoyMesas();
        cargarFrentes();
    }, []);

    useEffect(() => {
        if (selectedMesa) {
            cargarActasMesa(selectedMesa.id_mesa);
        }
    }, [selectedMesa]);

    const cargarRecintoyMesas = async () => {
        try {
            setLoading(true);

            // Cargar recinto asignado
            const resRecinto = await fetch(`${API_URL}/permisos/jefe/mi-recinto`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dataRecinto = await resRecinto.json();

            if (dataRecinto.success) {
                console.log('Recinto asignado:', dataRecinto.data);
                setMiRecinto(dataRecinto.data);

                // Cargar mesas del recinto directamente
                const resMesas = await fetch(
                    `${API_URL}/geografico?tipo=mesa&id_recinto=${dataRecinto.data.id_recinto}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const dataMesas = await resMesas.json();
                console.log('Mesas del recinto:', dataMesas);

                if (dataMesas.success && Array.isArray(dataMesas.data)) {
                    setMesas(dataMesas.data);
                    if (dataMesas.data.length > 0) {
                        setSelectedMesa(dataMesas.data[0]);
                    }
                } else {
                    setMesas([]);
                }

                // Cargar actas del recinto
                const resActas = await fetch(`${API_URL}/votos`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const dataActas = await resActas.json();

                if (dataActas.success && Array.isArray(dataActas.data)) {
                    const mesasDelRecinto = dataMesas.data?.map(m => parseInt(m.id_mesa)) || [];
                    const actasRecinto = dataActas.data.filter(acta => 
                        mesasDelRecinto.includes(parseInt(acta.id_mesa))
                    );
                    setActas(actasRecinto);
                }
            } else {
                setError('No tienes un recinto asignado');
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

    const cargarActasMesa = async (idMesa) => {
        try {
            const response = await fetch(`${API_URL}/votos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                const actasMesa = data.data.filter(a => parseInt(a.id_mesa) === parseInt(idMesa));
                setActas(actasMesa);
            }
        } catch (error) {
            console.error('Error al cargar actas:', error);
        }
    };

    const updateVotos = (tipo, idFrente, valueStr) => {
        const setVotos = tipo === 'alcalde' ? setVotosAlcalde : setVotosConcejal;
        setVotos((prev) =>
            prev.map((v) => (v.id_frente === idFrente ? { ...v, cantidad: valueStr } : v))
        );
    };

    const handleRegistrarVotos = async (e) => {
        e.preventDefault();

        if (!selectedMesa) {
            setError('Debes seleccionar una mesa');
            return;
        }

        const hayVotosAlcalde = votosAlcalde.some((v) => toInt(v.cantidad) > 0);
        const hayVotosConcejal = votosConcejal.some((v) => toInt(v.cantidad) > 0);

        if (!hayVotosAlcalde && !hayVotosConcejal && toInt(votosNulos) === 0 && toInt(votosBlancos) === 0) {
            setError('Debe registrar al menos un voto');
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
                .map((v) => ({ ...v, cantidad: toInt(v.cantidad) }))
                .filter((v) => v.cantidad > 0);

            const votosConcejalFiltrados = votosConcejal
                .map((v) => ({ ...v, cantidad: toInt(v.cantidad) }))
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

            if (data.success) {
                setError(null);
                alert(`✅ Votos registrados para Mesa ${selectedMesa.numero_mesa}`);
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
                
                setShowRegistrarVotos(false);
                cargarRecintoyMesas();
            } else {
                setError(data.message || 'Error al registrar votos');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error al registrar votos');
        } finally {
            setSavingVotos(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-[#1E3A8A]" />
            </div>
        );
    }

    if (error && !miRecinto) {
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
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
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white shadow-lg sticky top-0 z-10">
                <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6">
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold truncate">Mi Recinto Electoral</h1>
                            <p className="text-xs sm:text-sm text-white/80 mt-0.5 sm:mt-1">Gestión de mesas y votos</p>
                        </div>
                        <button
                            onClick={() => setShowRegistrarVotos(!showRegistrarVotos)}
                            disabled={!selectedMesa}
                            className="bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition text-sm sm:text-base whitespace-nowrap flex-shrink-0"
                        >
                            <Plus size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Registrar Votos</span>
                            <span className="sm:hidden">+Votos</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto py-6 sm:py-8">
                {/* Info Recinto */}
                {miRecinto && (
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Información del Recinto</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                            <div className="bg-gradient-to-br from-[#1E3A8A]/10 to-[#1E3A8A]/5 p-3 sm:p-4 rounded-lg">
                                <p className="text-xs sm:text-sm text-gray-600 font-medium">Recinto</p>
                                <p className="text-lg sm:text-2xl font-bold text-[#1E3A8A] break-words">{miRecinto.nombre}</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 p-3 sm:p-4 rounded-lg">
                                <p className="text-xs sm:text-sm text-gray-600 font-medium">Distrito</p>
                                <p className="text-base sm:text-lg font-medium text-[#F59E0B] break-words">{miRecinto.distrito_nombre || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 p-3 sm:p-4 rounded-lg">
                                <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Mesas</p>
                                <p className="text-lg sm:text-2xl font-bold text-[#10B981]">{mesas.length}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Mesas Listado */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white">
                                <h3 className="font-bold flex items-center gap-2 text-sm sm:text-base">
                                    <Users size={16} className="sm:w-5 sm:h-5" />
                                    Mesas ({mesas.length})
                                </h3>
                            </div>

                            <div className="divide-y max-h-96 overflow-y-auto">
                                {mesas.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-xs sm:text-sm">
                                        No hay mesas en este recinto
                                    </div>
                                ) : (
                                    mesas.map(mesa => {
                                        const actasMesa = actas.filter(a => parseInt(a.id_mesa) === parseInt(mesa.id_mesa));
                                        const isSelected = selectedMesa?.id_mesa === mesa.id_mesa;
                                        
                                        return (
                                            <button
                                                key={mesa.id_mesa}
                                                onClick={() => setSelectedMesa(mesa)}
                                                className={`w-full p-3 sm:p-4 text-left transition hover:bg-gray-50 text-sm sm:text-base ${
                                                    isSelected ? 'bg-[#1E3A8A]/5 border-l-4 border-[#1E3A8A]' : ''
                                                }`}
                                            >
                                                <div className="font-semibold text-gray-900">Mesa {mesa.numero_mesa}</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                                                        actasMesa.length > 0 
                                                            ? 'bg-[#10B981]/10 text-[#10B981]' 
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {actasMesa.length} acta{actasMesa.length !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Panel Derecha */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                        {/* Registrar Votos*/}
                        {showRegistrarVotos && selectedMesa && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Plus size={20} className="text-[#10B981]" />
                                    Registrar Votos - Mesa {selectedMesa.numero_mesa}
                                </h2>

                                {error && (
                                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleRegistrarVotos} className="space-y-6">
                                    {/* Votos Alcalde */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Votos para Alcalde</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {votosAlcalde.map((frente) => (
                                                <div key={frente.id_frente} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all hover:border-[#F59E0B]">
                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <div
                                                                className="w-6 h-6 rounded flex-shrink-0 shadow-sm"
                                                                style={{ backgroundColor: frente.color }}
                                                            />
                                                            <p className="font-bold text-gray-900 text-xs truncate">{frente.siglas}</p>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={String(frente.cantidad ?? '')}
                                                        onChange={(e) => {
                                                            const cleaned = e.target.value.replace(/[^0-9]/g, '');
                                                            updateVotos('alcalde', frente.id_frente, cleaned);
                                                        }}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-center font-bold text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Votos Concejal */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Votos para Concejal</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {votosConcejal.map((frente) => (
                                                <div key={frente.id_frente} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all hover:border-[#F59E0B]">
                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <div
                                                                className="w-6 h-6 rounded flex-shrink-0 shadow-sm"
                                                                style={{ backgroundColor: frente.color }}
                                                            />
                                                            <p className="font-bold text-gray-900 text-xs truncate">{frente.siglas}</p>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={String(frente.cantidad ?? '')}
                                                        onChange={(e) => {
                                                            const cleaned = e.target.value.replace(/[^0-9]/g, '');
                                                            updateVotos('concejal', frente.id_frente, cleaned);
                                                        }}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-center font-bold text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Votos Nulos y Blancos */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nulos</label>
                                            <input
                                                type="number"
                                                value={votosNulos}
                                                onChange={(e) => setVotosNulos(e.target.value)}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent text-sm"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Blancos</label>
                                            <input
                                                type="number"
                                                value={votosBlancos}
                                                onChange={(e) => setVotosBlancos(e.target.value)}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent text-sm"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent text-sm"
                                            placeholder="Notas..."
                                            rows="2"
                                        />
                                    </div>

                                    {/* Foto del Acta */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Foto del Acta (Opcional)</label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,application/pdf"
                                            onChange={(e) => setImagenActa(e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent text-sm"
                                        />
                                        {imagenActa && (
                                            <p className="text-xs text-[#10B981] mt-1">
                                                ✓ {imagenActa.name} ({(imagenActa.size / 1024).toFixed(2)} KB)
                                            </p>
                                        )}
                                    </div>

                                    {/* Resumen */}
                                    <div className="bg-gradient-to-r from-[#1E3A8A]/5 to-[#10B981]/5 p-3 rounded-lg border border-[#1E3A8A]/20">
                                        <p className="text-xs text-gray-600 mb-1">
                                            <span className="font-semibold">Alcalde:</span> {totalVotosAlcalde} | 
                                            <span className="font-semibold ml-2">Concejal:</span> {totalVotosConcejal} | 
                                            <span className="font-semibold ml-2">Nulos:</span> {toInt(votosNulos)} | 
                                            <span className="font-semibold ml-2">Blancos:</span> {toInt(votosBlancos)}
                                        </p>
                                        <p className="text-sm font-bold text-[#1E3A8A]">Total: {totalGeneral}</p>
                                    </div>

                                    <div className="flex gap-2 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowRegistrarVotos(false)}
                                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={savingVotos}
                                            className="flex-1 px-3 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition disabled:opacity-50 text-sm font-medium"
                                        >
                                            {savingVotos ? 'Guardando...' : 'Registrar Acta'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Actas de Mesa Seleccionada */}
                        {selectedMesa && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white">
                                    <h3 className="font-bold">
                                        Actas de Mesa {selectedMesa.numero_mesa} ({actas.length})
                                    </h3>
                                </div>

                                {actas.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No hay actas registradas para esta mesa</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">Fecha</th>
                                                    <th className="px-4 py-3 text-center font-medium text-gray-600 text-xs">Votos Válidos</th>
                                                    <th className="px-4 py-3 text-center font-medium text-gray-600 text-xs">Nulos</th>
                                                    <th className="px-4 py-3 text-center font-medium text-gray-600 text-xs">Blancos</th>
                                                    <th className="px-4 py-3 text-center font-medium text-gray-600 text-xs">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {actas.map(acta => (
                                                    <tr key={acta.id_acta} className="hover:bg-gray-50 transition">
                                                        <td className="px-4 py-3 text-gray-900">
                                                            {new Date(acta.fecha_registro).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-semibold text-[#1E3A8A]">
                                                            {acta.votos_validos || 0}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-gray-600">
                                                            {acta.votos_nulos || 0}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-gray-600">
                                                            {acta.votos_blancos || 0}
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-bold text-gray-900">
                                                            {(acta.votos_validos || 0) + (acta.votos_nulos || 0) + (acta.votos_blancos || 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiRecinto;
