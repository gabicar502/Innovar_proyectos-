import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/LOGIN/Login';
import Registro from './components/REGISTER/Register';
import Home from './pages/HOME/Home';
import NotFound from './pages/NOTFOUND/NotFound';

import PanelPrincipal from './components/INICIO/PanelPrincipal';
import Usuarios from './components/Usuarios/Usuarios';
import NuevoProyecto from './components/PROYECTOS/NuevoProyecto';
import MisProyectosDocente from './components/DOCENTE/MisProyectosDocente';
import MiProyectoEstudiante from './components/ESTUDIANTE/MiProyectoEstudiante';

import RutaPrivada from './components/RutasPrivada/RutaPrivada';
import DetalleProyecto from './pages/DetalleProyecto/DetalleProyecto';

import GenerarReporte from './components/REPORTES/GenerarReporte';
import ListaProyectos from './components/REPORTES/ListaProyectos';
import BuscarProyectos from './components/BUSCAR/BuscarProyectos';  

function App() {
  return (
    <Router>
      <Routes>

        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Panel principal con rutas protegidas */}
        <Route path="/panel" element={<PanelPrincipal />}>

          {/* 🔐 Coordinador: puede crear proyectos y ver usuarios */}
          <Route element={<RutaPrivada roles={['Coordinador']} />}>
            <Route path="nuevo-proyecto" element={<NuevoProyecto />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>

          {/* 🔐 Docente: puede ver sus proyectos */}
          <Route element={<RutaPrivada roles={['Docente']} />}>
            <Route path="mis-proyectos-docente" element={<MisProyectosDocente />} />
          </Route>

          {/* 🔐 Estudiante: puede ver su proyecto */}
          <Route element={<RutaPrivada roles={['Estudiante']} />}>
            <Route path="mi-proyecto" element={<MiProyectoEstudiante />} />
          </Route>

          {/* 🔐 Estudiante y Docente: pueden ver detalles del proyecto */}
          <Route element={<RutaPrivada roles={['Estudiante', 'Docente']} />}>
            <Route path="detalle-proyecto/:id" element={<DetalleProyecto />} />
          </Route>

          {/* 🔐 Todos los roles: pueden ver/generar reportes y buscar */}
          <Route element={<RutaPrivada roles={['Estudiante', 'Docente', 'Coordinador']} />}>
            <Route path="generar-reporte/:id" element={<GenerarReporte />} />
            <Route path="lista-proyectos" element={<ListaProyectos />} />
            <Route path="buscar-proyectos" element={<BuscarProyectos />} /> {/* ✅ NUEVA RUTA */}
          </Route>

        </Route>

        {/* Ruta por defecto si no encuentra coincidencia */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;
