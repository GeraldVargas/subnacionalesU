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
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');

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

    // Obtener votos según categoría seleccionada
    const obtenerVotosPorCategoria = (frente) => {
        if (categoriaSeleccionada === 'alcalde') {
            return parseInt(frente.votos_alcalde) || 0;
        } else if (categoriaSeleccionada === 'concejal') {
            return parseInt(frente.votos_concejal) || 0;
        } else {
            return parseInt(frente.total_votos) || 0;
        }
    };

    // Total de votos según categoría
    const totalVotos = categoriaSeleccionada === 'todos' 
        ? (parseInt(resumen.totalVotos) || 0)
        : resultados.reduce((sum, r) => sum + obtenerVotosPorCategoria(r), 0);
    
    // Total de votos de los frentes
    const totalVotosValidos = resultados.reduce((sum, r) => sum + obtenerVotosPorCategoria(r), 0);
    
    const maxVotos = Math.max(...resultados.map(r => obtenerVotosPorCategoria(r)), 1);
    
    const actasProcesadas = parseInt(resumen.totalActas) || 0;
    
    // Ordenar resultados por votos (mayor a menor) - según categoría
    const resultadosOrdenados = [...resultados].sort((a, b) => 
        obtenerVotosPorCategoria(b) - obtenerVotosPorCategoria(a)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            {/* Header con gradiente NGP */}
            <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                            <div className="p-2 sm:p-4 bg-white/20 rounded-lg sm:rounded-2xl backdrop-blur-lg flex-shrink-0">
                                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-0 sm:mb-2">
                                    Resultados en Vivo
                                </h1>
                                <p className="text-xs sm:text-sm md:text-lg text-white/90">
                                    Elecciones Subnacionales 2026 - Colcapirhua
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto flex-wrap justify-end">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                                    autoRefresh 
                                        ? 'bg-[#10B981] text-white hover:bg-[#0e9f6e]' 
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                                title={autoRefresh ? 'Auto-actualización activada' : 'Auto-actualización desactivada'}
                            >
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">{autoRefresh ? 'Auto' : 'Manual'}</span>
                            </button>
                            
                            {/* Botones de Categoría - Stack en móvil */}
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-lg rounded-lg sm:rounded-xl p-1">
                                <button
                                    onClick={() => setCategoriaSeleccionada('todos')}
                                    className={`px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium transition-all ${
                                        categoriaSeleccionada === 'todos'
                                            ? 'bg-white text-[#1E3A8A] font-bold'
                                            : 'text-white hover:bg-white/20'
                                    }`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setCategoriaSeleccionada('alcalde')}
                                    className={`px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium transition-all ${
                                        categoriaSeleccionada === 'alcalde'
                                            ? 'bg-white text-[#1E3A8A] font-bold'
                                            : 'text-white hover:bg-white/20'
                                    }`}
                                >
                                    Alcalde
                                </button>
                                <button
                                    onClick={() => setCategoriaSeleccionada('concejal')}
                                    className={`px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium transition-all ${
                                        categoriaSeleccionada === 'concejal'
                                            ? 'bg-white text-[#1E3A8A] font-bold'
                                            : 'text-white hover:bg-white/20'
                                    }`}
                                >
                                    Concejal
                                </button>
                            </div>
                            
                            <button
                                onClick={cargarResultados}
                                disabled={loading}
                                className="flex items-center gap-1 sm:gap-2 bg-[#F59E0B] hover:bg-[#e68906] text-white px-2.5 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            >
                                <RefreshCw className={`w-3 h-3 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Actualizar</span>
                            </button>
                        </div>
                    </div>

                    {ultimaActualizacion && (
                        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center gap-2 text-white/80 text-xs sm:text-sm">
                            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse flex-shrink-0"></span>
                            <span className="line-clamp-1">Actualización: {ultimaActualizacion.toLocaleTimeString('es-BO', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            })}</span>
                            {autoRefresh && (
                                <span className="text-white/60 text-xs inline-block">
                                    (c/30s)
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Estadísticas Rápidas con colores NGP */}
            <div className="max-w-7xl mx-auto mb-6 sm:mb-8 px-2 sm:px-4">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
                    <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 border-l-4 border-[#1E3A8A] hover:shadow-xl transition-all">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <div className="p-1 sm:p-2 bg-[#1E3A8A] bg-opacity-10 rounded">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E3A8A]" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-600 font-semibold line-clamp-1">Actas</span>
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1E3A8A]">{actasProcesadas}</p>
                        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                            {resumen.actasValidadas} validadas
                        </p>
                    </div>

                    <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 border-l-4 border-[#F59E0B] hover:shadow-xl transition-all">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <div className="p-1 sm:p-2 bg-[#F59E0B] bg-opacity-10 rounded">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-600 font-semibold line-clamp-1">Votos</span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#F59E0B]">{totalVotos.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                            Totales
                        </p>
                    </div>

                    {/* 🔥 Tarjeta de Votos Válidos (nueva) */}
                    <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 border-l-4 border-[#10B981] hover:shadow-xl transition-all">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <div className="p-1 sm:p-2 bg-[#10B981] bg-opacity-10 rounded">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#10B981]" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-600 font-semibold line-clamp-1">Válidos</span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#10B981]">{totalVotosValidos.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                            {totalVotos > 0 ? ((totalVotosValidos / totalVotos) * 100).toFixed(1) : 0}%
                        </p>
                    </div>

                    <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <div className="p-1 sm:p-2 bg-purple-100 rounded">
                                <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-600 font-semibold line-clamp-1">Frentes</span>
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-purple-500">{resultados.length}</p>
                        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                            Participando
                        </p>
                    </div>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="max-w-7xl mx-auto mb-6 sm:mb-8 px-2 sm:px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-2xl p-3 sm:p-6 flex items-start gap-3 sm:gap-4">
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0 sm:mt-0.5" />
                        <div className="min-w-0">
                            <h3 className="font-bold text-red-800 mb-1 text-sm sm:text-base">Error al cargar resultados</h3>
                            <p className="text-red-600 text-xs sm:text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Resultados por Frente */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
                <div className="bg-white rounded-xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-[#F59E0B]" />
                            <h2 className="text-lg sm:text-2xl font-black text-gray-900">
                                Resultados Por Frente
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
                        <div className="space-y-6 sm:space-y-8">
                            {/* 🎨 GRÁFICO DE BARRAS MEJORADO - LIMPIO Y RESPONSIVO */}
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-3 sm:p-6 md:p-8 border border-gray-200 shadow-inner">
                                {/* Área de barras - Tabla responsiva */}
                                <div className="overflow-x-auto pb-4">
                                    <div className="flex justify-center gap-1 sm:gap-2 md:gap-3 min-w-min">
                                        {resultadosOrdenados.map((frente, index) => {
                                            const votos = obtenerVotosPorCategoria(frente);
                                            const porcentaje = calcularPorcentaje(votos, totalVotos);
                                            const barHeight = maxVotos > 0 ? (votos / maxVotos) * 140 : 0;
                                            const esGanador = index === 0;

                                            return (
                                                <div
                                                    key={frente.id_frente}
                                                    className="flex flex-col items-center group"
                                                    style={{ minWidth: '70px', maxWidth: '90px' }}
                                                >
                                                    {/* Badge de posición - Pequeño arriba */}
                                                    <div className={`
                                                        w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mb-1
                                                        text-xs font-black text-white shadow-md
                                                        ${esGanador 
                                                            ? 'bg-gradient-to-br from-[#F59E0B] to-[#d97706] ring-3 ring-[#F59E0B]/30 animate-pulse' 
                                                            : index === 1 
                                                            ? 'bg-gradient-to-br from-gray-400 to-gray-500 ring-2 ring-gray-300'
                                                            : index === 2
                                                            ? 'bg-gradient-to-br from-amber-600 to-amber-700 ring-2 ring-amber-400'
                                                            : 'bg-gradient-to-br from-[#1E3A8A] to-[#152a63] ring-1 ring-[#1E3A8A]/30'
                                                        }
                                                    `}>
                                                        {esGanador ? <Trophy className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
                                                    </div>

                                                    {/* Tooltip al hover */}
                                                    <div className="absolute opacity-0 group-hover:opacity-100 transition-all z-30 pointer-events-none mt-12">
                                                        <div className="bg-[#1E3A8A] text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
                                                            <p className="font-bold">{votos.toLocaleString()}</p>
                                                        </div>
                                                    </div>

                                                    {/* Barra */}
                                                    <div className="w-full flex justify-center mb-1">
                                                        <div className="relative w-8 sm:w-10" style={{ height: '140px' }}>
                                                            <div className="absolute bottom-0 left-0 right-0 h-full bg-gray-200 rounded-t-md overflow-hidden shadow-sm flex flex-col-reverse">
                                                                <div
                                                                    className="w-full rounded-t-md transition-all duration-1000 ease-out group-hover:brightness-125"
                                                                    style={{
                                                                        height: `${barHeight}px`,
                                                                        background: `linear-gradient(to top, ${frente.color || '#1E3A8A'}, ${frente.color || '#1E3A8A'}dd)`,
                                                                        minHeight: barHeight > 0 ? '2px' : '0px'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Información debajo compacta */}
                                                    <div className="text-center w-full">
                                                        <div 
                                                            className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-0.5 rounded shadow-sm flex items-center justify-center"
                                                            style={{ backgroundColor: frente.color || '#1E3A8A' }}
                                                        >
                                                            <p className="text-white font-black text-xs">
                                                                {frente.siglas?.substring(0, 1)}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs font-bold text-[#1E3A8A] line-clamp-1">{frente.siglas}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-1 leading-tight">
                                                            {frente.nombre?.length > 12 ? frente.nombre.substring(0, 12) + '...' : frente.nombre}
                                                        </p>
                                                        <p className="text-xs font-bold text-[#F59E0B] mt-0.5">
                                                            {porcentaje}%
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Leyenda mejorada */}
                                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-600 border-t border-gray-200 pt-3 px-2">
                                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                        <div className="flex items-center gap-1">
                                            <Trophy className="w-3 h-3 text-[#F59E0B]" />
                                            <span>1er</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Medal className="w-3 h-3 text-gray-400" />
                                            <span>2do</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Medal className="w-3 h-3 text-amber-600" />
                                            <span>3er</span>
                                        </div>
                                    </div>
                                    <span className="text-gray-500">Máx: {maxVotos.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Detalle por frente (Tarjetas) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                {resultadosOrdenados.map((frente, index) => {
                                    const votos = obtenerVotosPorCategoria(frente);
                                    const porcentaje = calcularPorcentaje(votos, totalVotos);
                                    const esGanador = index === 0;

                                    return (
                                        <div
                                            key={`${frente.id_frente}-detalle`}
                                            className={`relative border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 transition-all hover:shadow-xl transform hover:-translate-y-1 ${
                                                esGanador
                                                    ? 'border-[#F59E0B] bg-gradient-to-br from-[#F59E0B]/5 to-transparent'
                                                    : 'border-gray-200 bg-white hover:border-[#1E3A8A]'
                                            }`}
                                        >
                                            {esGanador && (
                                                <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 bg-[#F59E0B] text-white p-1 sm:p-2 rounded-full shadow-lg animate-bounce">
                                                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                                </div>
                                            )}

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                                                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                                    <div
                                                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-lg sm:text-xl md:text-2xl shadow-lg flex-shrink-0"
                                                        style={{ backgroundColor: frente.color || '#1E3A8A' }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg sm:text-xl font-bold text-[#1E3A8A] mb-0 sm:mb-1 truncate">
                                                            {frente.siglas}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{frente.nombre}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#1E3A8A] mb-0 sm:mb-1">
                                                        {votos.toLocaleString()}
                                                    </p>
                                                    <p className="text-base sm:text-lg font-bold text-[#F59E0B]">
                                                        {porcentaje}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-3 md:pt-4 border-t border-gray-200">
                                                {(categoriaSeleccionada === 'todos' || categoriaSeleccionada === 'alcalde') && (
                                                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                                                        <p className="text-xs text-gray-500 mb-0 sm:mb-1">Votos Alcalde</p>
                                                        <p className="text-base sm:text-lg font-bold text-[#F59E0B]">
                                                            {frente.votos_alcalde?.toLocaleString() || 0}
                                                        </p>
                                                    </div>
                                                )}
                                                {(categoriaSeleccionada === 'todos' || categoriaSeleccionada === 'concejal') && (
                                                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                                                        <p className="text-xs text-gray-500 mb-0 sm:mb-1">Votos Concejal</p>
                                                        <p className="text-base sm:text-lg font-bold text-[#10B981]">
                                                            {frente.votos_concejal?.toLocaleString() || 0}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Barra de progreso del porcentaje */}
                                            <div className="mt-2 sm:mt-3 md:mt-4">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-gray-200">
                                <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg sm:rounded-2xl p-4 sm:p-6 border border-red-200">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm sm:text-base text-red-700 font-bold">Votos Nulos</h4>
                                            <p className="text-xs text-red-600">Votos no válidos</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-black text-red-700 mb-1 sm:mb-2">
                                        {resumen.votosNulos?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-xs sm:text-sm text-red-600">
                                        {calcularPorcentaje(resumen.votosNulos || 0, totalVotos)}% del total
                                    </p>
                                </div>
                                
                                <div className="bg-gradient-to-br from-[#F59E0B]/5 to-[#F59E0B]/10 rounded-lg sm:rounded-2xl p-4 sm:p-6 border border-[#F59E0B]/30">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F59E0B] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm sm:text-base text-[#F59E0B] font-bold">Votos Blancos</h4>
                                            <p className="text-xs text-[#F59E0B]/70">Votos en blanco</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#F59E0B] mb-1 sm:mb-2">
                                        {resumen.votosBlancos?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-xs sm:text-sm text-[#F59E0B]">
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