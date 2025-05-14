import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * RutaPrivada protege las rutas según autenticación y roles.
 * 
 * @param {Array} roles - Lista de roles autorizados para acceder a la ruta.
 * @returns {JSX.Element} - Componente autorizado o redirección.
 */
const RutaPrivada = ({ roles }) => {
  const usuario = localStorage.getItem("userName");
  const rol = localStorage.getItem("userRole");
  const location = useLocation();

  // 🛑 No autenticado
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ⚠️ Autenticado pero sin permiso
  if (roles && !roles.includes(rol)) {
    return <Navigate to="/panel" replace />;
  }

  // ✅ Autenticado y con rol permitido
  return <Outlet />;
};

export default RutaPrivada;
