import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Páginas
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import Transcripcion from './pages/Transcripcion';
import GestionUsuarios from './pages/GestionUsuarios';
import Geografia from './pages/Geografia';
import FrentesPoliticos from './pages/FrentesPoliticos';
// Componente temporal para Resultados
const ResultadosPublicos = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <h1 className="text-4xl font-bold text-[#E31E24]">RESULTADOS EN VIVO (TV)</h1>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/resultados-en-vivo" element={<ResultadosPublicos />} />


        <Route path="/dashboard" element={<DashboardLayout />}>


          <Route index element={<DashboardHome />} />


          <Route path="transcripcion" element={<Transcripcion />} />
          <Route path="usuarios" element={<GestionUsuarios />} />


          <Route path="geografia" element={<Geografia />} />



          <Route path="partidos" element={<FrentesPoliticos />} />
          <Route path="supervision" element={<div className="p-10"> Página de Supervisión</div>} />

        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;