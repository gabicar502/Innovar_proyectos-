import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/LOGIN/Login';
import Registro from './components/REGISTER/Register';
import Home from './pages/HOME/Home';
import NotFound from './pages/NOTFOUND/NotFound';
import PanelPrincipal from './components/INICIO/PanelPrincipal';
import Usuarios from './components/Usuarios/Usuarios'; // 👈 cuidado con la mayúscula

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
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;





