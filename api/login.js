export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { correo, contraseña } = req.body;

  // Aquí importas tu servicio (adaptado a serverless si es necesario)
  const UsuarioService = new (require('../../services/usuarioservice')).default();

  try {
    const usuario = await UsuarioService.iniciarSesion(correo, contraseña);
    if (usuario) {
      const { id_usuario, nombre_usuario, correo } = usuario;
      res.status(200).json({ id_usuario, nombre_usuario, correo });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
