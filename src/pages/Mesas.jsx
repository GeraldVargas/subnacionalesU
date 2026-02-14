// REEMPLAZA COMPLETO: src/pages/Mesas.jsx

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  Grid3x3,
  X,
  Save,
  Search,
  MapPin,
  Hash,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const Mesas = () => {
  const [activeTab, setActiveTab] = useState('recintos');
  const [distritos, setDistritos] = useState([]);
  const [recintos, setRecintos] = useState([]);
  const [todosLosRecintos, setTodosLosRecintos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [selectedDistrito, setSelectedDistrito] = useState('');
  const [selectedRecinto, setSelectedRecinto] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState({
    distritos: false,
    recintos: false,
    mesas: false
  });

  // Buscador por código (solo afecta a pestaña Mesas)
  const [buscarCodigo, setBuscarCodigo] = useState('');

  // Estados del formulario
  const [formRecinto, setFormRecinto] = useState({
    nombre: '',
    direccion: '',
    id_geografico: ''
  });

  const [formMesa, setFormMesa] = useState({
    codigo: '',
    descripcion: '',
    numero_mesa: '',
    id_recinto: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  // Cargar datos iniciales
  useEffect(() => {
    cargarDistritos();
    cargarTodosLosRecintos();
  }, []);

  // Cargar recintos cuando cambia el distrito seleccionado
  useEffect(() => {
    cargarRecintos();
  }, [selectedDistrito]);

  // Cargar mesas cuando cambia el recinto seleccionado
  useEffect(() => {
    if (selectedRecinto) {
      cargarMesas(selectedRecinto);
    } else {
      setMesas([]);
    }
    setBuscarCodigo('');
  }, [selectedRecinto]);

  const cargarDistritos = async () => {
    setCargando(prev => ({ ...prev, distritos: true }));
    try {
      const response = await fetch(`${API_URL}/geografico`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const distritosData = data.data.filter(g =>
          ['Distrito', 'Municipio', 'Ciudad'].includes(g.tipo)
        );
        setDistritos(distritosData.length > 0 ? distritosData : data.data);
      }
    } catch (error) {
      console.error('Error al cargar distritos:', error);
    } finally {
      setCargando(prev => ({ ...prev, distritos: false }));
    }
  };

  const cargarTodosLosRecintos = async () => {
    try {
      const response = await fetch(`${API_URL}/votos/recintos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTodosLosRecintos(data.data);
      }
    } catch (error) {
      console.error('Error al cargar todos los recintos:', error);
    }
  };

  const cargarRecintos = async () => {
    setCargando(prev => ({ ...prev, recintos: true }));
    try {
      const url = selectedDistrito
        ? `${API_URL}/votos/recintos?id_geografico=${selectedDistrito}`
        : `${API_URL}/votos/recintos`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setRecintos(data.data);
      }
    } catch (error) {
      console.error('Error al cargar recintos:', error);
    } finally {
      setCargando(prev => ({ ...prev, recintos: false }));
    }
  };

  const cargarMesas = async (idRecinto) => {
    setCargando(prev => ({ ...prev, mesas: true }));
    try {
      const response = await fetch(`${API_URL}/votos/mesas?id_recinto=${idRecinto}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMesas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    } finally {
      setCargando(prev => ({ ...prev, mesas: false }));
    }
  };

  const abrirModal = (tipo, item = null) => {
    setModalType(tipo);
    setEditingItem(item);

    if (tipo === 'recinto') {
      if (item) {
        setFormRecinto({
          nombre: item.nombre,
          direccion: item.direccion || '',
          id_geografico: item.id_geografico
        });
      } else {
        setFormRecinto({
          nombre: '',
          direccion: '',
          id_geografico: selectedDistrito || ''
        });
      }
    } else if (tipo === 'mesa') {
      if (item) {
        setFormMesa({
          codigo: item.codigo,
          descripcion: item.descripcion || '',
          numero_mesa: item.numero_mesa,
          id_recinto: item.id_recinto
        });
      } else {
        setFormMesa({
          codigo: '',
          descripcion: '',
          numero_mesa: '',
          id_recinto: selectedRecinto || ''
        });
      }
    }

    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setModalType('');
    setFormRecinto({ nombre: '', direccion: '', id_geografico: '' });
    setFormMesa({ codigo: '', descripcion: '', numero_mesa: '', id_recinto: '' });
  };

  const guardarRecinto = async () => {
    setLoading(true);

    try {
      const url = editingItem
        ? `${API_URL}/votos/recintos/${editingItem.id_recinto}`
        : `${API_URL}/votos/recintos`;

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formRecinto)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ ' + data.message);
        cerrarModal();
        await cargarRecintos();
        await cargarTodosLosRecintos();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al guardar recinto:', error);
      alert('❌ Error al guardar recinto');
    } finally {
      setLoading(false);
    }
  };

  const guardarMesa = async () => {
    setLoading(true);
    try {
      const url = editingItem
        ? `${API_URL}/votos/mesas/${editingItem.id_mesa}`
        : `${API_URL}/votos/mesas`;

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formMesa)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ ' + data.message);
        cerrarModal();
        await cargarTodosLosRecintos();
        if (selectedRecinto) {
          await cargarMesas(selectedRecinto);
        }
        await cargarRecintos();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al guardar mesa:', error);
      alert('❌ Error al guardar mesa');
    } finally {
      setLoading(false);
    }
  };

  const eliminarRecinto = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este recinto?')) return;

    try {
      const response = await fetch(`${API_URL}/votos/recintos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ ' + data.message);
        await cargarRecintos();
        await cargarTodosLosRecintos();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al eliminar recinto:', error);
      alert('❌ Error al eliminar recinto');
    }
  };

  const eliminarMesa = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta mesa?')) return;

    try {
      const response = await fetch(`${API_URL}/votos/mesas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ ' + data.message);
        if (selectedRecinto) {
          await cargarMesas(selectedRecinto);
        }
        await cargarRecintos();
        await cargarTodosLosRecintos();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      alert('❌ Error al eliminar mesa');
    }
  };

  // Filtrado por código
  const mesasFiltradas = mesas.filter(m =>
    (m.codigo || '').toLowerCase().includes(buscarCodigo.trim().toLowerCase())
  );

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#152a63] rounded-2xl shadow-lg flex items-center justify-center">
            <Grid3x3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Gestión de Recintos y Mesas
            </h1>
            <p className="text-gray-600">
              Administra los recintos electorales y sus mesas de votación
            </p>
          </div>
        </div>
        <div className="w-32 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#F59E0B] rounded-full mt-4 ml-4"></div>
      </div>

      {/* Tabs con colores NGP */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('recintos')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'recintos'
              ? 'bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Building2 className="w-5 h-5" />
          Recintos
        </button>
        <button
          onClick={() => setActiveTab('mesas')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'mesas'
              ? 'bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Grid3x3 className="w-5 h-5" />
          Mesas
        </button>
      </div>

      {/* Contenido - Recintos */}
      {activeTab === 'recintos' && (
        <div>
          {/* Filtros y acciones */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Filtrar por Distrito
                </label>
                <div className="relative">
                  <select
                    value={selectedDistrito}
                    onChange={(e) => setSelectedDistrito(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none appearance-none"
                  >
                    <option value="">Todos los distritos</option>
                    {distritos.map(d => (
                      <option key={d.id_geografico} value={d.id_geografico}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <button
                onClick={() => abrirModal('recinto')}
                className="flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] hover:from-[#152a63] hover:to-[#0f1f4a] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Nuevo Recinto
              </button>
            </div>
          </div>

          {/* Lista de Recintos */}
          {cargando.recintos ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-[#1E3A8A] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando recintos...</p>
            </div>
          ) : recintos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No hay recintos disponibles</p>
              <p className="text-gray-500 text-sm mt-2">
                Selecciona un distrito o crea un nuevo recinto
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recintos.map(recinto => (
                <div 
                  key={recinto.id_recinto} 
                  className="bg-white rounded-2xl shadow-lg border-l-4 border-[#1E3A8A] p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#1E3A8A] bg-opacity-10 rounded-xl">
                        <Building2 className="w-6 h-6 text-[#1E3A8A]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1E3A8A] text-lg">{recinto.nombre}</h3>
                        <p className="text-sm text-gray-600">{recinto.nombre_geografico}</p>
                      </div>
                    </div>
                  </div>
                  
                  {recinto.direccion && (
                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {recinto.direccion}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Grid3x3 className="w-4 h-4 text-[#F59E0B]" />
                      <span className="text-sm font-bold text-[#F59E0B]">
                        {recinto.cantidad_mesas} mesas
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirModal('recinto', recinto)}
                        className="p-2 hover:bg-[#F59E0B] hover:bg-opacity-10 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4 text-[#F59E0B]" />
                      </button>
                      <button
                        onClick={() => eliminarRecinto(recinto.id_recinto)}
                        className="p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contenido - Mesas */}
      {activeTab === 'mesas' && (
        <div>
          {/* Selector de Recinto + Buscador */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selector de Recinto */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Selecciona un Recinto
                  </label>
                  <div className="relative">
                    <select
                      value={selectedRecinto}
                      onChange={(e) => setSelectedRecinto(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none appearance-none"
                    >
                      <option value="">Selecciona un recinto...</option>
                      {todosLosRecintos.map(r => (
                        <option key={r.id_recinto} value={r.id_recinto}>
                          {r.nombre} ({r.cantidad_mesas} mesas)
                        </option>
                      ))}
                    </select>
                    <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Buscador por Código */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Buscar Por Código De Mesa
                  </label>
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={buscarCodigo}
                      onChange={(e) => setBuscarCodigo(e.target.value)}
                      disabled={!selectedRecinto}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={selectedRecinto ? "Ej: 1A-123, MESA-001..." : "Primero selecciona un recinto"}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => abrirModal('mesa')}
                disabled={!selectedRecinto}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  selectedRecinto
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#e68906] hover:from-[#e68906] hover:to-[#cc7a05] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-5 h-5" />
                Nueva Mesa
              </button>
            </div>
          </div>

          {/* Lista de Mesas */}
          {selectedRecinto ? (
            cargando.mesas ? (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-[#1E3A8A] animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Cargando mesas...</p>
              </div>
            ) : mesasFiltradas.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Grid3x3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {buscarCodigo ? 'No se encontraron mesas con ese código' : 'No hay mesas registradas'}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {buscarCodigo ? 'Prueba con otro código' : 'Crea una nueva mesa para este recinto'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mesasFiltradas.map(mesa => (
                  <div 
                    key={mesa.id_mesa} 
                    className="bg-white rounded-2xl shadow-lg border-l-4 border-[#10B981] p-5 hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#10B981] bg-opacity-10 rounded-lg">
                          <Grid3x3 className="w-5 h-5 text-[#10B981]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1E3A8A]">Mesa {mesa.numero_mesa}</h3>
                          <p className="text-xs text-gray-500">{mesa.codigo}</p>
                        </div>
                      </div>
                    </div>
                    
                    {mesa.descripcion && (
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {mesa.descripcion}
                      </p>
                    )}
                    
                    {mesa.actas_registradas > 0 ? (
                      <div className="bg-[#F59E0B] bg-opacity-10 text-[#F59E0B] text-xs font-semibold px-3 py-1.5 rounded-lg mb-3 border border-[#F59E0B] border-opacity-30 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {mesa.actas_registradas} acta(s) registrada(s)
                      </div>
                    ) : (
                      <div className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-lg mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Sin actas registradas
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => abrirModal('mesa', mesa)}
                        className="flex-1 p-2 hover:bg-[#F59E0B] hover:bg-opacity-10 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4 text-[#F59E0B]" />
                        <span className="text-xs font-medium text-gray-600">Editar</span>
                      </button>
                      <button
                        onClick={() => eliminarMesa(mesa.id_mesa)}
                        className="flex-1 p-2 hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-medium text-gray-600">Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Selecciona un recinto para ver sus mesas</p>
            </div>
          )}
        </div>
      )}

      {/* Modal con colores NGP */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    {modalType === 'recinto' ? <Building2 size={18} /> : <Grid3x3 size={18} />}
                  </div>
                  <h2 className="text-lg font-bold">
                    {editingItem ? 'Editar' : 'Nuevo'} {modalType === 'recinto' ? 'Recinto' : 'Mesa'}
                  </h2>
                </div>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cuerpo del modal */}
            <div className="p-6 space-y-4">
              {modalType === 'recinto' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nombre del Recinto <span className="text-[#F59E0B]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formRecinto.nombre}
                      onChange={(e) => setFormRecinto({ ...formRecinto, nombre: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none"
                      placeholder="Ej: Unidad Educativa San Agustín"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formRecinto.direccion}
                      onChange={(e) => setFormRecinto({ ...formRecinto, direccion: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none"
                      placeholder="Ej: Av. Principal #123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Distrito <span className="text-[#F59E0B]">*</span>
                    </label>
                    <select
                      value={formRecinto.id_geografico}
                      onChange={(e) => setFormRecinto({ ...formRecinto, id_geografico: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none"
                    >
                      <option value="">Selecciona un distrito...</option>
                      {distritos.map(d => (
                        <option key={d.id_geografico} value={d.id_geografico}>
                          {d.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {modalType === 'mesa' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Código de Mesa <span className="text-[#F59E0B]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formMesa.codigo}
                      onChange={(e) => setFormMesa({ ...formMesa, codigo: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none"
                      placeholder="Ej: MESA-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Número de Mesa <span className="text-[#F59E0B]">*</span>
                    </label>
                    <input
                      type="number"
                      value={formMesa.numero_mesa}
                      onChange={(e) => setFormMesa({ ...formMesa, numero_mesa: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none"
                      placeholder="Ej: 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={formMesa.descripcion}
                      onChange={(e) => setFormMesa({ ...formMesa, descripcion: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none"
                      placeholder="Ej: Mesa 1 - Zona A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Recinto <span className="text-[#F59E0B]">*</span>
                    </label>
                    <select
                      value={formMesa.id_recinto}
                      onChange={(e) => setFormMesa({ ...formMesa, id_recinto: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A8A] focus:outline-none"
                    >
                      <option value="">Selecciona un recinto...</option>
                      {todosLosRecintos.map(r => (
                        <option key={r.id_recinto} value={r.id_recinto}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={cerrarModal}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={modalType === 'recinto' ? guardarRecinto : guardarMesa}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] text-white rounded-xl font-bold hover:from-[#152a63] hover:to-[#0f1f4a] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos de animación */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Mesas;