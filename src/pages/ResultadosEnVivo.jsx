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
    ArrowLeft
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

    const API_URL = import.meta.env.VITE_API_URL;

    const cargarResultados = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/votos/resultados-vivo`);
            const data = await response.json();

            if (data.success) {
                setResultados(data.data.resultados || []);
                setResumen(data.data.resumen || resumen);
                setUltimaActualizacion(new Date());
            }
        } catch (error) {
            console.error('Error al cargar resultados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarResultados();
        const interval = setInterval(cargarResultados, 10000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const calcularPorcentaje = (votos, total) => {
        if (total === 0) return 0;
        return ((votos / total) * 100).toFixed(2);
    };

    const totalVotosValidos = resultados.reduce((sum, r) => sum + (r.total_votos || 0), 0);
    const maxVotos = Math.max(...resultados.map(r => r.total_votos || 0), 1);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl shadow-2xl p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl transition"
                                title="Volver al inicio"
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
                        <button
                            onClick={cargarResultados}
                            disabled={loading}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white px-6 py-3 rounded-xl font-bold transition"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                    </div>

                    {ultimaActualizacion && (
                        <div className="mt-4 text-white/80 text-sm">
                            Última actualización: {ultimaActualizacion.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <span className="text-gray-600 font-semibold">Actas Procesadas</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900">{resumen.totalActas}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-6 h-6 text-green-600" />
                            <span className="text-gray-600 font-semibold">Total Votos</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900">{resumen.totalVotos.toLocaleString()}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-6 h-6 text-purple-600" />
                            <span className="text-gray-600 font-semibold">Validadas</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900">{resumen.actasValidadas}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                            <span className="text-gray-600 font-semibold">Participación</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900">
                            {resumen.totalActas > 0 ? '92%' : '0%'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Resultados por Frente (Barras Verticales Centradas y Cuadradas) */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        Resultados Por Frente Político
                    </h2>

                    {loading && resultados.length === 0 ? (
                        <div className="text-center py-12">
                            <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Cargando resultados...</p>
                        </div>
                    ) : resultados.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">No hay resultados disponibles aún</p>
                            <p className="text-gray-500 text-sm mt-2">
                                Los datos aparecerán cuando se registren las primeras actas
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Contenedor tipo gráfico */}
                            <div className="bg-gray-50 rounded-2xl p-6 pt-14 border border-gray-200 overflow-visible">


                                {/* ✅ Centradas: justify-center */}
                                <div className="flex items-end justify-center gap-10 overflow-x-auto pb-2">
                                    {resultados.map((frente, index) => {
                                        const votos = frente.total_votos || 0;
                                        const porcentaje = calcularPorcentaje(votos, totalVotosValidos);
                                        const barHeight = (votos / maxVotos) * 100;
                                        const esGanador = index === 0;

                                        return (
                                            <div
                                                key={frente.id_frente}
                                                className="relative flex flex-col items-center min-w-[120px]"
                                                title={`${frente.siglas} - ${votos.toLocaleString()} votos`}
                                            >
                                    


                                                {/* Valor arriba */}
                                                <div className="text-center mb-2">
                                                    <p className="text-sm font-black text-gray-900">
                                                        {votos.toLocaleString()}
                                                    </p>
                                                    <p
                                                        className="text-xs font-bold"
                                                        style={{ color: frente.color || '#E31E24' }}
                                                    >
                                                        {porcentaje}%
                                                    </p>
                                                </div>

                                                {/* ✅ Barra cuadrada */}
                                                <div className="w-full h-64 flex items-end justify-center">
                                                    {/* Contenedor cuadrado (sin rounded) */}
                                                    <div className="relative w-12 h-full bg-gray-200 overflow-hidden">
                                                        <div
                                                            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
                                                            style={{
                                                                height: `${barHeight}%`,
                                                                backgroundColor: frente.color || '#E31E24'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Etiqueta abajo */}
                                                <div className="mt-3 text-center">
                                                    <p className="text-xs font-black text-gray-900">{frente.siglas}</p>
                                                    <p className="text-[11px] text-gray-500 line-clamp-2">
                                                        {frente.nombre}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 text-xs text-gray-500">
                                    Escala: La barra más alta representa {maxVotos.toLocaleString()} votos.
                                </div>
                            </div>

                            {/* Detalle por frente (Tarjetas) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {resultados.map((frente, index) => {
                                    const votos = frente.total_votos || 0;
                                    const porcentaje = calcularPorcentaje(votos, totalVotosValidos);
                                    const esGanador = index === 0;

                                    return (
                                        <div
                                            key={`${frente.id_frente}-detalle`}
                                            className={`relative border-2 rounded-2xl p-6 transition-all hover:shadow-lg ${
                                                esGanador
                                                    ? 'border-yellow-400 bg-yellow-50'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            {esGanador && (
                                                <div className="absolute -top-3 -right-3 bg-yellow-500 text-white p-2 rounded-full shadow-lg">
                                                    <Medal className="w-6 h-6" />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                                                        style={{ backgroundColor: frente.color || '#E31E24' }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                            {frente.siglas}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">{frente.nombre}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-black text-gray-900 mb-1">
                                                        {votos.toLocaleString()}
                                                    </p>
                                                    <p className="text-lg font-bold" style={{ color: frente.color || '#E31E24' }}>
                                                        {porcentaje}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                                <div>
                                                    <span className="text-xs text-gray-500">Votos Alcalde:</span>
                                                    <span className="ml-2 font-bold text-gray-900">
                                                        {frente.votos_alcalde?.toLocaleString() || 0}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Votos Concejal:</span>
                                                    <span className="ml-2 font-bold text-gray-900">
                                                        {frente.votos_concejal?.toLocaleString() || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Votos Nulos y Blancos */}
                    {resultados.length > 0 && (
                        <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t-2 border-gray-200">
                            <div className="bg-gray-100 rounded-xl p-6">
                                <h4 className="text-gray-600 font-semibold mb-2">Votos Nulos</h4>
                                <p className="text-3xl font-black text-gray-900">
                                    {resumen.votosNulos.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {calcularPorcentaje(resumen.votosNulos, resumen.totalVotos)}% del total
                                </p>
                            </div>
                            <div className="bg-gray-100 rounded-xl p-6">
                                <h4 className="text-gray-600 font-semibold mb-2">Votos Blancos</h4>
                                <p className="text-3xl font-black text-gray-900">
                                    {resumen.votosBlancos.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {calcularPorcentaje(resumen.votosBlancos, resumen.totalVotos)}% del total
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultadosEnVivo;
