import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  Save,
  Plus,
  CheckCircle,
  ClipboardCheck,
  X,
  MapPin,
  Layers,
  Building2,
  Grid3x3,
  ChevronRight,
  FileText,
  Upload,
  AlertCircle,
  ChevronLeft,
  Vote,
  Camera,
  Search
} from 'lucide-react';

// Componente VotoCard memoizado para evitar re-renders innecesarios
const VotoCard = memo(({ frente, tipo, onVotoChange }) => (
  <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-all">
    <div className="mb-2 sm:mb-3">
      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
        <div
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex-shrink-0"
          style={{ backgroundColor: frente.color }}
        />
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-xs sm:text-sm">{frente.siglas}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 truncate">{frente.nombre}</p>
        </div>
      </div>
    </div>

    {/* CLAVE: Input grande como Nulos/Blancos */}
    <input
      type="text"
      inputMode="numeric"
      enterKeyHint="done"
      autoComplete="off"
      maxLength="3"
      value={String(frente.cantidad ?? '')}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^0-9]/g, '');
        onVotoChange(tipo, frente.id_frente, cleaned);
      }}
      className="w-full text-center text-lg sm:text-2xl font-bold border border-gray-300 rounded-lg py-2 sm:py-3 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
      placeholder="0"
    />
  </div>
));

VotoCard.displayName = 'VotoCard';

const Transcripcion = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState({
    distritos: false,
    zonas: false,
    recintos: false,
    mesas: false,
    frentes: false
  });

  // Estados para el wizard
  const [distritos, setDistritos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [recintos, setRecintos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [frentes, setFrentes] = useState([]);

  // Selecciones
  const [selectedDistrito, setSelectedDistrito] = useState(null);
  const [selectedZona, setSelectedZona] = useState(null);
  const [selectedRecinto, setSelectedRecinto] = useState(null);
  const [selectedMesa, setSelectedMesa] = useState(null);

  // Búsqueda en cada paso
  const [buscarDistrito, setBuscarDistrito] = useState('');
  const [buscarZona, setBuscarZona] = useState('');
  const [buscarRecinto, setBuscarRecinto] = useState('');
  const [buscarMesa, setBuscarMesa] = useState('');

  // Votos (GUARDAR COMO STRING MIENTRAS SE ESCRIBE)
  const [votosAlcalde, setVotosAlcalde] = useState([]);
  const [votosConcejal, setVotosConcejal] = useState([]);
  const [votosNulos, setVotosNulos] = useState('');
  const [votosBlancos, setVotosBlancos] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Imagen del acta
  const [imagenActa, setImagenActa] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  // Obtener usuario y su rol
  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
      return null;
    }
  })();

  const isDelegado = usuario?.id_rol === 3;
  const isJefe = usuario?.id_rol === 4;

  const [miMesa, setMiMesa] = useState(null);
  const [miRecinto, setMiRecinto] = useState(null);

  const toInt = (v) => {
    const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  };

  // Obtener la mesa asignada al delegado o recinto asignado al jefe
  const cargarAsignacion = async () => {
    try {
      if (isDelegado) {
        const response = await fetch(`${API_URL}/permisos/delegado/mi-mesa`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setMiMesa(data.data);
          setSelectedMesa(data.data.id_mesa);
        }
      } else if (isJefe) {
        const response = await fetch(`${API_URL}/permisos/jefe/mi-recinto`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setMiRecinto(data.data);
          setSelectedRecinto(data.data.id_recinto);
        }
      }
    } catch (error) {
      console.error('Error al cargar asignación:', error);
    }
  };

  // Cargar distritos al abrir modal
  useEffect(() => {
    if (showModal) {
      cargarDistritos();
      cargarFrentes();
      // Si es delegado o jefe, cargar su asignación
      if (isDelegado || isJefe) {
        cargarAsignacion();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const cargarZonas = async (distritoId) => {
    setLoading((prev) => ({ ...prev, zonas: true }));
    setZonas([]);
    try {
      const response = await fetch(`${API_URL}/geografico`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const zonasData = data.data.filter(
          (g) =>
            String(g.fk_id_geografico) === String(distritoId) &&
            g.tipo?.toLowerCase() === 'zona'
        );
        setZonas(zonasData);
        if (zonasData.length === 0) {
          mostrarNotificacion('info', 'No hay zonas disponibles para este distrito');
        }
      }
    } catch (error) {
      console.error('Error al cargar zonas:', error);
      mostrarNotificacion('error', 'Error al cargar zonas');
    } finally {
      setLoading((prev) => ({ ...prev, zonas: false }));
    }
  };

  const cargarDistritos = async () => {
    setLoading((prev) => ({ ...prev, distritos: true }));
    try {
      const response = await fetch(`${API_URL}/geografico`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        const distritosData = data.data.filter((g) =>
          g.tipo?.toLowerCase() === 'distrito'
        );
        setDistritos(distritosData);
      } else {
        console.error('Error en respuesta:', data);
        mostrarNotificacion('error', 'Error al cargar distritos');
      }
    } catch (error) {
      console.error('Error al cargar distritos:', error);
      mostrarNotificacion('error', 'Error de conexión al cargar distritos');
    } finally {
      setLoading((prev) => ({ ...prev, distritos: false }));
    }
  };

  const cargarRecintos = async (idGeografico) => {
    setLoading((prev) => ({ ...prev, recintos: true }));
    try {
      const response = await fetch(
        `${API_URL}/votos/recintos?id_geografico=${idGeografico}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setRecintos(data.data);
        if (data.data.length === 0) {
          mostrarNotificacion('info', 'No hay recintos disponibles para este distrito');
        }
      }
    } catch (error) {
      console.error('Error al cargar recintos:', error);
      mostrarNotificacion('error', 'Error al cargar recintos');
    } finally {
      setLoading((prev) => ({ ...prev, recintos: false }));
    }
  };

  const cargarMesas = async (idRecinto) => {
    setLoading((prev) => ({ ...prev, mesas: true }));
    try {
      const response = await fetch(`${API_URL}/votos/mesas?id_recinto=${idRecinto}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMesas(data.data);
        if (data.data.length === 0) {
          mostrarNotificacion('info', 'No hay mesas disponibles para este recinto');
        }
      }
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      mostrarNotificacion('error', 'Error al cargar mesas');
    } finally {
      setLoading((prev) => ({ ...prev, mesas: false }));
    }
  };

  const cargarFrentes = async () => {
    setLoading((prev) => ({ ...prev, frentes: true }));
    try {
      const response = await fetch(`${API_URL}/votos/frentes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFrentes(data.data);
        const votosIniciales = data.data.map((f) => ({
          id_frente: f.id_frente,
          nombre: f.nombre,
          siglas: f.siglas,
          color: f.color,
          cantidad: '' // STRING
        }));
        setVotosAlcalde(votosIniciales);
        setVotosConcejal(JSON.parse(JSON.stringify(votosIniciales)));
      }
    } catch (error) {
      console.error('Error al cargar frentes:', error);
      mostrarNotificacion('error', 'Error al cargar frentes políticos');
    } finally {
      setLoading((prev) => ({ ...prev, frentes: false }));
    }
  };

  const mostrarNotificacion = (tipo, mensaje) => {
    setToastType(tipo);
    setToastMsg(mensaje);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleSelectDistrito = (distrito) => {
    setSelectedDistrito(distrito);
    setSelectedZona(null);
    setSelectedRecinto(null);
    setSelectedMesa(null);
    setZonas([]);
    setRecintos([]);
    setBuscarZona('');
    setBuscarRecinto('');
    setBuscarMesa('');
    cargarZonas(distrito.id_geografico);
    setCurrentStep(2);
  };

  const handleSelectZona = (zona) => {
    setSelectedZona(zona);
    setSelectedRecinto(null);
    setSelectedMesa(null);
    setRecintos([]);
    setBuscarRecinto('');
    setBuscarMesa('');
    cargarRecintos(zona.id_geografico);
    setCurrentStep(3);
  };

  const handleSelectRecinto = (recinto) => {
    setSelectedRecinto(recinto);
    setSelectedMesa(null);
    setBuscarMesa('');
    cargarMesas(recinto.id_recinto);
    setCurrentStep(4);
  };

  const handleSelectMesa = (mesa) => {
    setSelectedMesa(mesa);
    setCurrentStep(5);
  };

  // IMPORTANTE: NO PARSEAR A NÚMERO AQUÍ (para que deje escribir varios dígitos)
  const updateVotos = (tipo, idFrente, valueStr) => {
    const setVotos = tipo === 'alcalde' ? setVotosAlcalde : setVotosConcejal;
    setVotos((prev) =>
      prev.map((v) => (v.id_frente === idFrente ? { ...v, cantidad: valueStr } : v))
    );
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        mostrarNotificacion('error', 'La imagen no debe superar los 10MB');
        return;
      }

      if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
        mostrarNotificacion('error', 'Solo se permiten imágenes JPG, PNG o PDF');
        return;
      }

      setImagenActa(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImagen(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewImagen('pdf');
      }
    }
  };

  const handleRegistrarActa = async () => {
    const hayVotosAlcalde = votosAlcalde.some((v) => toInt(v.cantidad) > 0);
    const hayVotosConcejal = votosConcejal.some((v) => toInt(v.cantidad) > 0);

    if (!hayVotosAlcalde && !hayVotosConcejal && toInt(votosNulos) === 0 && toInt(votosBlancos) === 0) {
      mostrarNotificacion('error', 'Debe registrar al menos un voto');
      return;
    }

    setIsSaving(true);

    try {
      const tokenLocal = localStorage.getItem('token');

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
        headers: { Authorization: `Bearer ${tokenLocal}` },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        mostrarNotificacion('success', '¡Acta registrada exitosamente!');
        window.dispatchEvent(
          new CustomEvent('acta-registrada', { detail: { id_acta: data.data.id_acta } })
        );

        setTimeout(() => {
          setShowModal(false);
          resetForm();
        }, 2000);
      } else {
        throw new Error(data.message || 'Error al registrar acta');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDistrito(null);
    setSelectedZona(null);
    setSelectedRecinto(null);
    setSelectedMesa(null);
    setZonas([]);
    setRecintos([]);
    setMesas([]);
    setBuscarDistrito('');
    setBuscarZona('');
    setBuscarRecinto('');
    setBuscarMesa('');
    setVotosNulos('');
    setVotosBlancos('');
    setObservaciones('');
    setImagenActa(null);
    setPreviewImagen(null);

    if (frentes.length > 0) {
      const votosIniciales = frentes.map((f) => ({
        id_frente: f.id_frente,
        nombre: f.nombre,
        siglas: f.siglas,
        color: f.color,
        cantidad: '' // STRING
      }));
      setVotosAlcalde(votosIniciales);
      setVotosConcejal(JSON.parse(JSON.stringify(votosIniciales)));
    }
  };

  const totalVotosAlcalde = votosAlcalde.reduce((sum, v) => sum + toInt(v.cantidad), 0);
  const totalVotosConcejal = votosConcejal.reduce((sum, v) => sum + toInt(v.cantidad), 0);
  const totalGeneral = totalVotosAlcalde + totalVotosConcejal + toInt(votosNulos) + toInt(votosBlancos);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] border-b border-gray-200 sticky top-0 z-10 shadow-md">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-3 sm:py-4 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="p-2 sm:p-2.5 bg-white/10 rounded-lg sm:rounded-xl flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Transcripción de Actas</h1>
                <p className="text-xs sm:text-sm text-white/70 hidden sm:block">Registro electoral en tiempo real</p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center sm:justify-start gap-2 bg-[#F59E0B] hover:bg-[#e68906] text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap text-sm sm:text-base flex-shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nueva Acta</span>
              <span className="sm:hidden text-xs">+</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 sm:py-12">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 p-6 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#1E3A8A] to-[#152a63] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <ClipboardCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Sistema de Transcripción de Actas</h2>
          <p className="text-xs sm:text-base text-gray-600 max-w-md mx-auto mb-6 sm:mb-8">
            Selecciona "Nueva Acta" para comenzar el registro de resultados electorales
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {[
              { icon: MapPin, label: 'Paso 1', name: 'Distrito', color: 'bg-[#1E3A8A]', text: 'text-[#1E3A8A]' },
              { icon: Layers, label: 'Paso 2', name: 'Zona', color: 'bg-purple-500', text: 'text-purple-500' },
              { icon: Building2, label: 'Paso 3', name: 'Recinto', color: 'bg-[#F59E0B]', text: 'text-[#F59E0B]' },
              { icon: Grid3x3, label: 'Paso 4', name: 'Mesa', color: 'bg-[#10B981]', text: 'text-[#10B981]' },
              { icon: Vote, label: 'Paso 5', name: 'Votos', color: 'bg-red-500', text: 'text-red-500' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${item.color} bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.text}`} />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  </div>
                  <div className="text-left sm:hidden">
                    <p className="font-semibold text-gray-900 text-xs">{item.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Wizard */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-sm sm:max-w-2xl md:max-w-4xl my-4">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white z-10 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sm:rounded-t-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-bold truncate">Registro de Acta Electoral</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
                {[
                  { num: 1, label: 'Distrito', icon: MapPin },
                  { num: 2, label: 'Zona', icon: Layers },
                  { num: 3, label: 'Recinto', icon: Building2 },
                  { num: 4, label: 'Mesa', icon: Grid3x3 },
                  { num: 5, label: 'Votos', icon: Vote }
                ].map((step, idx) => (
                  <React.Fragment key={step.num}>
                    <div className="flex items-center flex-shrink-0">
                      <div
                        className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold ${
                          currentStep >= step.num ? 'bg-[#F59E0B] text-white' : 'bg-white/20 text-white'
                        }`}
                      >
                        {currentStep > step.num ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : step.num}
                      </div>
                      <span
                        className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                          currentStep >= step.num ? 'text-white' : 'text-white/60'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < 4 && (
                      <div
                        className={`w-4 sm:w-8 h-0.5 mx-0.5 sm:mx-2 flex-shrink-0 ${
                          currentStep > step.num ? 'bg-[#F59E0B]' : 'bg-white/20'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Contenido del Modal */}
            <div
              className="p-4 sm:p-6 max-h-[calc(90vh-200px)] overflow-y-auto overscroll-contain"
              style={{
                scrollbarGutter: 'stable',
                overflowAnchor: 'none'
              }}
            >
              {/* Paso 1: Seleccionar Distrito */}
              {currentStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona el Distrito</h3>

                  {/* Buscador */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={buscarDistrito}
                      onChange={(e) => setBuscarDistrito(e.target.value)}
                      placeholder="Buscar distrito..."
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  </div>

                  {loading.distritos ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : distritos.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No hay distritos disponibles</p>
                    </div>
                  ) : (
                    (() => {
                      const filtrados = distritos.filter((d) =>
                        d.nombre.toLowerCase().includes(buscarDistrito.toLowerCase())
                      );
                      return filtrados.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <p className="text-gray-500 text-sm">Sin resultados para "{buscarDistrito}"</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filtrados.map((distrito) => (
                            <button
                              key={distrito.id_geografico}
                              onClick={() => handleSelectDistrito(distrito)}
                              className="p-4 border border-gray-200 rounded-xl hover:border-[#1E3A8A] hover:bg-[#1E3A8A] hover:bg-opacity-5 transition-all text-left group"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900 group-hover:text-[#1E3A8A]">
                                    {distrito.nombre}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">{distrito.tipo}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1E3A8A]" />
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* Paso 2: Seleccionar Zona */}
              {currentStep === 2 && (
                <div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 text-[#1E3A8A] hover:text-[#152a63] font-medium text-sm mb-4"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                  </button>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona la Zona</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Distrito: <span className="font-medium text-[#1E3A8A]">{selectedDistrito?.nombre}</span>
                  </p>

                  {/* Buscador */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={buscarZona}
                      onChange={(e) => setBuscarZona(e.target.value)}
                      placeholder="Buscar zona..."
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  {loading.zonas ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : zonas.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No hay zonas en este distrito</p>
                    </div>
                  ) : (
                    (() => {
                      const filtradas = zonas.filter((z) =>
                        z.nombre.toLowerCase().includes(buscarZona.toLowerCase())
                      );
                      return filtradas.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <p className="text-gray-500 text-sm">Sin resultados para "{buscarZona}"</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filtradas.map((zona) => (
                            <button
                              key={zona.id_geografico}
                              onClick={() => handleSelectZona(zona)}
                              className="p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900 group-hover:text-purple-600">
                                    {zona.nombre}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">{zona.tipo}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* Paso 3: Seleccionar Recinto */}
              {currentStep === 3 && (
                <div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 text-[#1E3A8A] hover:text-[#152a63] font-medium text-sm mb-4"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                  </button>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona el Recinto</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Zona: <span className="font-medium text-purple-600">{selectedZona?.nombre}</span>
                  </p>

                  {/* Buscador */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={buscarRecinto}
                      onChange={(e) => setBuscarRecinto(e.target.value)}
                      placeholder="Buscar recinto..."
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] focus:outline-none"
                    />
                  </div>

                  {loading.recintos ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : recintos.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No hay recintos en esta zona</p>
                    </div>
                  ) : (
                    (() => {
                      const filtrados = recintos.filter((r) =>
                        r.nombre.toLowerCase().includes(buscarRecinto.toLowerCase()) ||
                        (r.direccion || '').toLowerCase().includes(buscarRecinto.toLowerCase())
                      );
                      return filtrados.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <p className="text-gray-500 text-sm">Sin resultados para "{buscarRecinto}"</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filtrados.map((recinto) => (
                            <button
                              key={recinto.id_recinto}
                              onClick={() => handleSelectRecinto(recinto)}
                              className="w-full p-4 border border-gray-200 rounded-xl hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:bg-opacity-5 transition-all text-left group"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900 group-hover:text-[#F59E0B]">
                                    {recinto.nombre}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">{recinto.direccion}</p>
                                  <p className="text-xs text-gray-400 mt-1">{recinto.cantidad_mesas} mesas disponibles</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#F59E0B]" />
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* Paso 4: Seleccionar Mesa */}
              {currentStep === 4 && (
                <div>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-2 text-[#1E3A8A] hover:text-[#152a63] font-medium text-sm mb-4"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                  </button>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona la Mesa</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Recinto: <span className="font-medium text-[#F59E0B]">{selectedRecinto?.nombre}</span>
                  </p>

                  {/* Buscador */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={buscarMesa}
                      onChange={(e) => setBuscarMesa(e.target.value)}
                      placeholder="Buscar mesa..."
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                    />
                  </div>

                  {loading.mesas ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : mesas.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Grid3x3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No hay mesas en este recinto</p>
                    </div>
                  ) : (
                    (() => {
                      const filtradas = mesas.filter((m) =>
                        String(m.numero_mesa).includes(buscarMesa) ||
                        (m.codigo || '').toLowerCase().includes(buscarMesa.toLowerCase())
                      );
                      return filtradas.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <p className="text-gray-500 text-sm">Sin resultados para "{buscarMesa}"</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filtradas.map((mesa) => (
                            <button
                              key={mesa.id_mesa}
                              onClick={() => handleSelectMesa(mesa)}
                              className="p-4 border border-gray-200 rounded-xl hover:border-[#10B981] hover:bg-[#10B981] hover:bg-opacity-5 transition-all text-left group"
                            >
                              <div>
                                <p className="font-semibold text-gray-900 group-hover:text-[#10B981]">
                                  Mesa {mesa.numero_mesa}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{mesa.codigo}</p>
                                {parseInt(mesa.actas_registradas) > 0 && (
                                  <p className="text-xs text-[#F59E0B] mt-2 font-medium">
                                    ⚠️ {mesa.actas_registradas} acta(s) registrada(s)
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* Paso 5: Registrar Votos */}
              {currentStep === 5 && (
                <div>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center gap-2 text-[#1E3A8A] hover:text-[#152a63] font-medium text-sm mb-4"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                  </button>

                  <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] rounded-xl p-4 mb-6 text-white">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-white/70 text-xs font-medium mb-1">Distrito</p>
                        <p className="font-semibold truncate">{selectedDistrito?.nombre}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs font-medium mb-1">Zona</p>
                        <p className="font-semibold truncate">{selectedZona?.nombre}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs font-medium mb-1">Recinto</p>
                        <p className="font-semibold truncate">{selectedRecinto?.nombre}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs font-medium mb-1">Mesa</p>
                        <p className="font-semibold">Mesa {selectedMesa?.numero_mesa}</p>
                      </div>
                    </div>
                  </div>

                  {/* Votos Alcalde */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-[#1E3A8A] rounded"></div>
                      <h3 className="font-semibold text-gray-900">Votos para Alcalde</h3>
                      <span className="text-xs text-gray-500 ml-auto">Total: {totalVotosAlcalde}</span>
                    </div>
                    <div className="space-y-2">
                      {votosAlcalde.map((frente) => (
                        <VotoCard key={`alc-${frente.id_frente}`} frente={frente} tipo="alcalde" onVotoChange={updateVotos} />
                      ))}
                    </div>
                  </div>

                  {/* Votos Concejal */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-[#F59E0B] rounded"></div>
                      <h3 className="font-semibold text-gray-900">Votos para Concejales</h3>
                      <span className="text-xs text-gray-500 ml-auto">Total: {totalVotosConcejal}</span>
                    </div>
                    <div className="space-y-2">
                      {votosConcejal.map((frente) => (
                        <VotoCard key={`con-${frente.id_frente}`} frente={frente} tipo="concejal" onVotoChange={updateVotos} />
                      ))}
                    </div>
                  </div>

                  {/* Votos Nulos y Blancos */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <label className="block text-xs font-medium text-red-700 mb-2">Votos Nulos</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        enterKeyHint="done"
                        autoComplete="off"
                        maxLength="3"
                        value={String(votosNulos ?? '')}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9]/g, '');
                          setVotosNulos(cleaned);
                        }}
                        className="w-full text-center text-lg sm:text-xl font-bold border border-red-200 rounded-lg py-2 sm:py-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Votos en Blanco</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        enterKeyHint="done"
                        autoComplete="off"
                        maxLength="3"
                        value={String(votosBlancos ?? '')}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9]/g, '');
                          setVotosBlancos(cleaned);
                        }}
                        className="w-full text-center text-lg sm:text-xl font-bold border border-gray-200 rounded-lg py-2 sm:py-3 focus:border-gray-600 focus:ring-1 focus:ring-gray-600 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Observaciones</label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] focus:outline-none"
                      rows="2"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>

                  {/* Imagen del Acta */}
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#1E3A8A]" />
                        Imagen del Acta
                      </div>
                    </label>

                    {!previewImagen ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1E3A8A] hover:bg-[#1E3A8A] hover:bg-opacity-5 transition">
                        <div className="flex flex-col items-center">
                          <Upload className="w-6 h-6 mb-1 text-gray-400" />
                          <p className="text-xs text-gray-600">Click para subir</p>
                          <p className="text-[10px] text-gray-400">JPG, PNG, PDF (máx 10MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          onChange={handleImagenChange}
                        />
                      </label>
                    ) : (
                      <div className="relative border border-gray-200 rounded-lg p-2">
                        <button
                          onClick={() => {
                            setImagenActa(null);
                            setPreviewImagen(null);
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {previewImagen === 'pdf' ? (
                          <div className="flex items-center justify-center h-20 bg-gray-100 rounded">
                            <FileText className="w-8 h-8 text-red-500" />
                            <span className="text-xs text-gray-600 ml-2">{imagenActa?.name}</span>
                          </div>
                        ) : (
                          <img src={previewImagen} alt="Preview" className="w-full h-20 object-contain rounded" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Total y Botón */}
                  <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] rounded-xl p-4 text-white mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium opacity-90">Total de Votos</span>
                      <span className="text-2xl font-bold">{totalGeneral}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleRegistrarActa}
                    disabled={isSaving}
                    className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition ${
                      isSaving
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#F59E0B] hover:bg-[#e68906] text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Registrar Acta
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-md ${
              toastType === 'success'
                ? 'bg-green-50 border border-green-200'
                : toastType === 'error'
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            {toastType === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {toastType === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            {toastType === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
            <p
              className={`text-sm ${
                toastType === 'success'
                  ? 'text-green-700'
                  : toastType === 'error'
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}
            >
              {toastMsg}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Transcripcion;
