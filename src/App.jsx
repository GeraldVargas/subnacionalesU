import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Páginas
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import Transcripcion from './pages/TranscripcionNueva';
import GestionUsuarios from './pages/GestionUsuarios';
import Geografia from './pages/Geografia';
import FrentesPoliticos from './pages/FrentesPoliticos';
import Mesas from './pages/Mesas';
import ResultadosEnVivo from './pages/ResultadosEnVivo';
import HistorialActas from './pages/HistorialActas';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/resultados-en-vivo" element={<ResultadosEnVivo />} />


        <Route path="/dashboard" element={<DashboardLayout />}>


          <Route index element={<DashboardHome />} />


          <Route path="transcripcion" element={<Transcripcion />} />
          <Route path="historial" element={<HistorialActas />} />
          <Route path="usuarios" element={<GestionUsuarios />} />


          <Route path="geografia" element={<Geografia />} />
          <Route path="mesas" element={<Mesas />} />


          <Route path="partidos" element={<FrentesPoliticos />} />
          <Route path="resultados" element={<ResultadosEnVivo />} />
          <Route path="supervision" element={<div className="p-10"> Página de Supervisión</div>} />

        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;