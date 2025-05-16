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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* PANEL PRINCIPAL */}
        <Route path="/panel" element={<PanelPrincipal />}>
          {/* Coordinador: puede crear proyectos y ver usuarios */}
          <Route element={<RutaPrivada roles={['Coordinador']} />}>
            <Route path="nuevo-proyecto" element={<NuevoProyecto />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>

          {/* Docente: puede ver y asignar estudiantes */}
          <Route element={<RutaPrivada roles={['Docente']} />}>
            <Route path="mis-proyectos-docente" element={<MisProyectosDocente />} />
          </Route>

          {/* Estudiante: puede ver su proyecto asignado */}
          <Route element={<RutaPrivada roles={['Estudiante']} />}>
            <Route path="mi-proyecto" element={<MiProyectoEstudiante />} />
          </Route>


          {/* Detalle del proyecto */}
          {/* Estudiante: puede ver su proyecto asignado */}
          <Route element={<RutaPrivada roles={['Estudiante', 'Docente']} />}>
            <Route path="mi-proyecto" element={<MiProyectoEstudiante />} />
            <Route path="detalle-proyecto/:id" element={<DetalleProyecto />} />  {/* <-- Aquí */}
          </Route>

        </Route>

        {/* RUTA NO ENCONTRADA */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
