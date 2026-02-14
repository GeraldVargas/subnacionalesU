import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    TrendingUp,
    Users,
    FileText,
    CheckCircle,
    RefreshCw,
    Trophy,
    Medal,
    ArrowLeft,
    Award,
    Target,
    Clock,
    AlertCircle,
    PieChart,
    Percent,
    Hash
} from 'lucide-react';

const ResultadosEnVivo = () => {
    const navigate = useNavigate();
    const [resultados, setResultados] = useState([]);
    const [resumen, setResumen] = useState({
        totalActas: 0,
        totalVotos: 0,
        actasValidadas: 0,
        votosNulos: 0,
        votosBlancos: 0
    });
    const [loading, setLoading] = useState(true);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
    const [error, setError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    const cargarResultados = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await fetch(`${API_URL}/votos/resultados-vivo`, {
                headers
            });
            
            const data = await response.json();

            if (data.success) {
                setResultados(data.data.resultados || []);
                setResumen(data.data.resumen || resumen);
                setUltimaActualizacion(new Date());
            } else {
                throw new Error(data.message || 'Error al cargar resultados');
            }
        } catch (error) {
            console.error('Error al cargar resultados:', error);
            setError('No se pudieron cargar los resultados. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarResultados();
        
        let interval;
        if (autoRefresh) {
            interval = setInterval(cargarResultados, 30000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    // 🔥 FUNCIÓN DE PORCENTAJE CORREGIDA - Usa el total de votos (incluye nulos y blancos)
    const calcularPorcentaje = (votos, total) => {
        if (!total || total === 0) return 0;
        return ((votos / total) * 100).toFixed(2);
    };

    // Total de votos (incluye nulos y blancos)
    const totalVotos = parseInt(resumen.totalVotos) || 0;
    
    // Total de votos de los frentes
    const totalVotosValidos = resultados.reduce((sum, r) => sum + (parseInt(r.total_votos) || 0), 0);
    
    const maxVotos = Math.max(...resultados.map(r => parseInt(r.total_votos) || 0), 1);
    
    const actasProcesadas = parseInt(resumen.totalActas) || 0;
    
    // Ordenar resultados por votos (mayor a menor)
    const resultadosOrdenados = [...resultados].sort((a, b) => 
        (parseInt(b.total_votos) || 0) - (parseInt(a.total_votos) || 0)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            {/* Header con gradiente NGP */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] rounded-3xl shadow-2xl p-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl transition-all hover:scale-105"
                                title="Volver"
                            >
                                <ArrowLeft className="w-6 h-6 text-white" />
                            </button>
                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-lg">
                                <BarChart3 className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2">
                                    Resultados en Vivo
                                </h1>
                                <p className="text-white/90 text-lg">
                                    Elecciones Subnacionales 2026 - Colcapirhua
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                                    autoRefresh 
                                        ? 'bg-[#10B981] text-white hover:bg-[#0e9f6e]' 
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                                title={autoRefresh ? 'Auto-actualización activada' : 'Auto-actualización desactivada'}
                            >
                                <Clock className="w-4 h-4" />
                                {autoRefresh ? 'Auto' : 'Manual'}
                            </button>
                            
                            <button
                                onClick={cargarResultados}
                                disabled={loading}
                                className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#e68906] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </button>
                        </div>
                    </div>

                    {ultimaActualizacion && (
                        <div className="mt-4 flex items-center gap-3 text-white/80 text-sm">
                            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
                            <span>Última actualización: {ultimaActualizacion.toLocaleTimeString('es-BO', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            })}</span>
                            {autoRefresh && (
                                <span className="text-white/60 text-xs">
                                    (Actualizando cada 30s)
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Estadísticas Rápidas con colores NGP */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1E3A8A] hover:shadow-xl transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#1E3A8A] bg-opacity-10 rounded-lg">
                                <FileText className="w-5 h-5 text-[#1E3A8A]" />
                            </div>
                            <span className="text-gray-600 font-semibold">Actas Procesadas</span>
                        </div>
                        <p className="text-4xl font-black text-[#1E3A8A]">{actasProcesadas}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {resumen.actasValidadas} validadas
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#F59E0B] hover:shadow-xl transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#F59E0B] bg-opacity-10 rounded-lg">
                                <Users className="w-5 h-5 text-[#F59E0B]" />
                            </div>
                            <span className="text-gray-600 font-semibold">Total Votos</span>
                        </div>
                        <p className="text-4xl font-black text-[#F59E0B]">{totalVotos.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Votos válidos: {totalVotosValidos.toLocaleString()}
                        </p>
                    </div>

                    {/* 🔥 Tarjeta de Votos Válidos (nueva) */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#10B981] hover:shadow-xl transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#10B981] bg-opacity-10 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                            </div>
                            <span className="text-gray-600 font-semibold">Votos Válidos</span>
                        </div>
                        <p className="text-4xl font-black text-[#10B981]">{totalVotosValidos.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {totalVotos > 0 ? ((totalVotosValidos / totalVotos) * 100).toFixed(1) : 0}% del total
                        </p>
                    </div>

                    
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-800 mb-1">Error al cargar resultados</h3>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Resultados por Frente */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-[#F59E0B]" />
                            <h2 className="text-2xl font-black text-gray-900">
                                Resultados Por Frente Político
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
                            <Hash className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                                {resultados.length} frentes
                            </span>
                        </div>
                    </div>

                    {loading && resultados.length === 0 ? (
                        <div className="text-center py-16">
                            <RefreshCw className="w-16 h-16 text-[#1E3A8A] animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">Cargando resultados...</p>
                            <p className="text-gray-500 text-sm mt-2">
                                Obteniendo datos del sistema electoral
                            </p>
                        </div>
                    ) : resultados.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <PieChart className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-xl font-bold mb-2">
                                No hay resultados disponibles aún
                            </p>
                            <p className="text-gray-500 text-base max-w-md mx-auto">
                                Los resultados aparecerán cuando se registren las primeras actas en el sistema
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* 🎨 GRÁFICO DE BARRAS MEJORADO - ESPACIO OPTIMIZADO */}
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 pt-16 border border-gray-200 shadow-inner">
                                {/* Área de badges de posición - SEPARADA */}
                                <div className="flex justify-center gap-4 mb-6 px-4">
                                    {resultadosOrdenados.map((frente, index) => {
                                        const esGanador = index === 0;
                                        return (
                                            <div key={`badge-${frente.id_frente}`} className="min-w-[110px] flex justify-center">
                                                <div className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center
                                                    text-sm font-black text-white shadow-lg
                                                    ${esGanador 
                                                        ? 'bg-gradient-to-br from-[#F59E0B] to-[#d97706] ring-4 ring-[#F59E0B]/30 animate-pulse' 
                                                        : index === 1 
                                                        ? 'bg-gradient-to-br from-gray-400 to-gray-500 ring-2 ring-gray-300'
                                                        : index === 2
                                                        ? 'bg-gradient-to-br from-amber-600 to-amber-700 ring-2 ring-amber-400'
                                                        : 'bg-gradient-to-br from-[#1E3A8A] to-[#152a63] ring-2 ring-[#1E3A8A]/30'
                                                    }
                                                `}>
                                                    {esGanador && <Trophy className="w-5 h-5" />}
                                                    {!esGanador && index + 1}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Área de barras */}
                                <div className="flex items-end justify-center gap-4 overflow-x-auto pb-2 min-h-[350px] px-4">
                                    {resultadosOrdenados.map((frente, index) => {
                                        const votos = parseInt(frente.total_votos) || 0;
                                        const porcentaje = calcularPorcentaje(votos, totalVotos);
                                        const barHeight = maxVotos > 0 ? (votos / maxVotos) * 200 : 0;

                                        return (
                                            <div
                                                key={frente.id_frente}
                                                className="relative flex flex-col items-center min-w-[110px] group"
                                            >
                                                {/* Tooltip de información al hover */}
                                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 pointer-events-none">
                                                    <div className="bg-[#1E3A8A] text-white px-4 py-2 rounded-xl shadow-xl whitespace-nowrap">
                                                        <p className="text-sm font-bold">{votos.toLocaleString()} votos</p>
                                                        <p className="text-xs text-white/80">{porcentaje}% del total</p>
                                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#1E3A8A]"></div>
                                                    </div>
                                                </div>

                                                {/* Barra con diseño mejorado */}
                                                <div className="w-full h-[240px] flex items-end justify-center pt-8">
                                                    <div className="relative w-16 h-full">
                                                        {/* Fondo de la barra */}
                                                        <div className="absolute bottom-0 left-0 right-0 h-[220px] bg-gray-200 rounded-t-xl overflow-hidden shadow-inner">
                                                            {/* Barra animada */}
                                                            <div
                                                                className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out group-hover:brightness-110 rounded-t-xl overflow-hidden"
                                                                style={{
                                                                    height: `${barHeight}px`,
                                                                    background: `linear-gradient(to top, ${frente.color || '#1E3A8A'}, ${frente.color || '#1E3A8A'}dd)`
                                                                }}
                                                            >
                                                                {/* Brillo en la parte superior */}
                                                                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/30 to-transparent"></div>
                                                                
                                                                {/* Valor de votos dentro de la barra */}
                                                                {barHeight > 40 && (
                                                                    <div className="absolute top-2 left-1/2 -translate-x-1/2">
                                                                        <p className="text-white font-black text-sm drop-shadow-lg">
                                                                            {votos.toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Etiqueta del frente */}
                                                <div className="mt-4 text-center">
                                                    <div 
                                                        className="w-12 h-12 mx-auto mb-2 rounded-xl shadow-lg flex items-center justify-center"
                                                        style={{ backgroundColor: frente.color || '#1E3A8A' }}
                                                    >
                                                        <p className="text-white font-black text-lg">
                                                            {frente.siglas?.substring(0, 3)}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-bold text-[#1E3A8A]">{frente.siglas}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-2 max-w-[110px] mt-1">
                                                        {frente.nombre}
                                                    </p>
                                                    <p className="text-xs font-bold text-[#F59E0B] mt-1">
                                                        {porcentaje}%
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Leyenda mejorada */}
                                <div className="mt-8 flex items-center justify-between text-xs text-gray-600 border-t border-gray-200 pt-4 px-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-[#F59E0B]" />
                                            <span>1er lugar</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Medal className="w-4 h-4 text-gray-400" />
                                            <span>2do lugar</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Medal className="w-4 h-4 text-amber-600" />
                                            <span>3er lugar</span>
                                        </div>
                                    </div>
                                    <span className="text-gray-500">
                                        Máximo: {maxVotos.toLocaleString()} votos
                                    </span>
                                </div>
                            </div>

                            {/* Detalle por frente (Tarjetas) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {resultadosOrdenados.map((frente, index) => {
                                    const votos = parseInt(frente.total_votos) || 0;
                                    const porcentaje = calcularPorcentaje(votos, totalVotos);
                                    const esGanador = index === 0;

                                    return (
                                        <div
                                            key={`${frente.id_frente}-detalle`}
                                            className={`relative border-2 rounded-2xl p-6 transition-all hover:shadow-xl transform hover:-translate-y-1 ${
                                                esGanador
                                                    ? 'border-[#F59E0B] bg-gradient-to-br from-[#F59E0B]/5 to-transparent'
                                                    : 'border-gray-200 bg-white hover:border-[#1E3A8A]'
                                            }`}
                                        >
                                            {esGanador && (
                                                <div className="absolute -top-3 -right-3 bg-[#F59E0B] text-white p-2 rounded-full shadow-lg animate-bounce">
                                                    <Trophy className="w-5 h-5" />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                                                        style={{ backgroundColor: frente.color || '#1E3A8A' }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-[#1E3A8A] mb-1">
                                                            {frente.siglas}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">{frente.nombre}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-black text-[#1E3A8A] mb-1">
                                                        {votos.toLocaleString()}
                                                    </p>
                                                    <p className="text-lg font-bold text-[#F59E0B]">
                                                        {porcentaje}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Votos Alcalde</p>
                                                    <p className="text-lg font-bold text-[#F59E0B]">
                                                        {frente.votos_alcalde?.toLocaleString() || 0}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Votos Concejal</p>
                                                    <p className="text-lg font-bold text-[#10B981]">
                                                        {frente.votos_concejal?.toLocaleString() || 0}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Barra de progreso del porcentaje */}
                                            <div className="mt-4">
                                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{ 
                                                            width: `${porcentaje}%`,
                                                            backgroundColor: frente.color || '#1E3A8A'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Votos Nulos y Blancos */}
                            <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t-2 border-gray-200">
                                <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-6 border border-red-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-red-700 font-bold">Votos Nulos</h4>
                                            <p className="text-xs text-red-600">Votos no válidos</p>
                                        </div>
                                    </div>
                                    <p className="text-4xl font-black text-red-700 mb-2">
                                        {resumen.votosNulos?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-sm text-red-600">
                                        {calcularPorcentaje(resumen.votosNulos || 0, totalVotos)}% del total
                                    </p>
                                </div>
                                
                                <div className="bg-gradient-to-br from-[#F59E0B]/5 to-[#F59E0B]/10 rounded-2xl p-6 border border-[#F59E0B]/30">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-[#F59E0B] rounded-xl flex items-center justify-center">
                                            <Target className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-[#F59E0B] font-bold">Votos Blancos</h4>
                                            <p className="text-xs text-[#F59E0B]/70">Votos en blanco</p>
                                        </div>
                                    </div>
                                    <p className="text-4xl font-black text-[#F59E0B] mb-2">
                                        {resumen.votosBlancos?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-sm text-[#F59E0B]">
                                        {calcularPorcentaje(resumen.votosBlancos || 0, totalVotos)}% del total
                                    </p>
                                </div>
                            </div>
                            
                            
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultadosEnVivo;