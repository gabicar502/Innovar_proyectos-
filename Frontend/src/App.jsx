import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/LOGIN/Login';
import Registro from './components/REGISTER/Register';
import Home from './pages/HOME/Home';
import NotFound from './pages/NOTFOUND/NotFound';
import PanelPrincipal from './components/INICIO/PanelPrincipal';
import Usuarios from './components/Usuarios/Usuarios';
import NuevoProyecto from './components/PROYECTOS/NuevoProyecto'; // Asegúrate de que esta línea está presente

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas anidadas en el panel */}
        <Route path="/panel" element={<PanelPrincipal />}>
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="nuevo-proyecto" element={<NuevoProyecto />} /> {/* Esta es la ruta que agregamos */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
