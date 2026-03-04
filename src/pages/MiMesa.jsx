import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

    const API_URL = import.meta.env.VITE_API_URL;
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

    const handleRegistrarVotos = async (e) => {
        e.preventDefault();
        
        const hayVotosAlcalde = votosAlcalde.some((v) => toInt(v.cantidad) > 0);
        const hayVotosConcejal = votosConcejal.some((v) => toInt(v.cantidad) > 0);

        if (!hayVotosAlcalde && !hayVotosConcejal && toInt(votosNulos) === 0 && toInt(votosBlancos) === 0) {
            setError('Debe registrar al menos un voto');
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
                alert('✅ Votos registrados exitosamente');
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
                cargarMesaYActas();
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
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Mi Mesa Electoral</h1>
                            <p className="text-white/80 mt-1">Registrar votos por partidos políticos</p>
                        </div>
                        <button
                            onClick={() => setShowRegistrarVotos(!showRegistrarVotos)}
                            className="bg-[#10B981] hover:bg-[#059669] px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
                        >
                            <Plus size={20} />
                            Registrar Acta
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Información de la Mesa */}
                {mesaSeleccionada && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Información de tu Mesa</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Mesas Listado */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white">
                                <h3 className="font-bold flex items-center gap-2">
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
                                        const actasMesa = actas.filter(a => a.id_mesa === mesa.id_mesa);
                                        const isSelected = mesaSeleccionada?.id_mesa === mesa.id_mesa;
                                        
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
                    <div className="lg:col-span-2 space-y-8">
                        {/* Formulario Registrar Votos */}
                        {showRegistrarVotos && mesaSeleccionada && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Plus size={20} className="text-[#10B981]" />
                            Registrar Nuevos Votos
                        </h2>

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleRegistrarVotos} className="space-y-8">
                            {/* Votos Alcalde */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Votos para Alcalde</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {votosAlcalde.map((frente) => (
                                        <div key={frente.id_frente} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:border-[#F59E0B]">
                                            <div className="flex items-center justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm"
                                                        style={{ backgroundColor: frente.color }}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 text-sm truncate">{frente.siglas}</p>
                                                        <p className="text-xs text-gray-500 truncate">{frente.nombre}</p>
                                                    </div>
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent text-center font-bold"
                                                placeholder="0"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Votos Concejal */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Votos para Concejal</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {votosConcejal.map((frente) => (
                                        <div key={frente.id_frente} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:border-[#F59E0B]">
                                            <div className="flex items-center justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm"
                                                        style={{ backgroundColor: frente.color }}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 text-sm truncate">{frente.siglas}</p>
                                                        <p className="text-xs text-gray-500 truncate">{frente.nombre}</p>
                                                    </div>
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent text-center font-bold"
                                                placeholder="0"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Votos Nulos y Blancos */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Votos Nulos
                                    </label>
                                    <input
                                        type="number"
                                        value={votosNulos}
                                        onChange={(e) => setVotosNulos(e.target.value)}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Votos Blancos
                                    </label>
                                    <input
                                        type="number"
                                        value={votosBlancos}
                                        onChange={(e) => setVotosBlancos(e.target.value)}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observaciones
                                </label>
                                <textarea
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                    placeholder="Notas adicionales..."
                                    rows="4"
                                />
                            </div>

                            {/* Foto del Acta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Foto del Acta (Opcional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,application/pdf"
                                    onChange={(e) => setImagenActa(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                />
                                {imagenActa && (
                                    <p className="text-sm text-[#10B981] mt-2">
                                        ✓ {imagenActa.name} ({(imagenActa.size / 1024).toFixed(2)} KB)
                                    </p>
                                )}
                            </div>

                            {/* Resumen */}
                            <div className="bg-gradient-to-r from-[#1E3A8A]/5 to-[#10B981]/5 p-4 rounded-lg border border-[#1E3A8A]/20">
                                <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-semibold">Total Alcalde:</span> {totalVotosAlcalde} | 
                                    <span className="font-semibold ml-2">Total Concejal:</span> {totalVotosConcejal} | 
                                    <span className="font-semibold ml-2">Nulos:</span> {toInt(votosNulos)} | 
                                    <span className="font-semibold ml-2">Blancos:</span> {toInt(votosBlancos)}
                                </p>
                                <p className="text-lg font-bold text-[#1E3A8A]">Total General: {totalGeneral}</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRegistrarVotos(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingVotos}
                                    className="flex-1 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition disabled:opacity-50"
                                >
                                    {savingVotos ? 'Guardando...' : 'Registrar Acta'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                        {/* Historial de Actas */}
                        {mesaSeleccionada && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white">
                                    <h2 className="text-lg font-bold">Actas de Mesa {mesaSeleccionada.numero_mesa}</h2>
                                </div>

                                {actas.filter(a => parseInt(a.id_mesa) === parseInt(mesaSeleccionada.id_mesa)).length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No hay actas registradas para tu mesa</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Votos Válidos</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nulos</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Blancos</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {actas.filter(a => parseInt(a.id_mesa) === parseInt(mesaSeleccionada.id_mesa)).map(acta => (
                                        <tr key={acta.id_acta} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {new Date(acta.fecha_registro).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-[#1E3A8A]">
                                                {acta.votos_validos || 0}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {acta.votos_nulos || 0}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {acta.votos_blancos || 0}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                {(acta.votos_validos || 0) + (acta.votos_nulos || 0) + (acta.votos_blancos || 0)}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981]">
                                                    <CheckCircle size={14} />
                                                    Registrado
                                                </span>
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

export default MiMesa;
