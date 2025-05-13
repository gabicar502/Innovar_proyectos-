import { Navigate, Outlet } from "react-router-dom";

const RutaPrivada = () => {
  const usuarioAutenticado = localStorage.getItem("userName"); // O usa contexto, Redux, etc.

  return usuarioAutenticado ? <Outlet /> : <Navigate to="/login" />;
};

export default RutaPrivada;
