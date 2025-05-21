import React, { useState } from "react";
import {
  Container, TextField, Button, Typography, Box, MenuItem, Snackbar, Alert
} from "@mui/material";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase.js";
import { useNavigate } from "react-router-dom";
import './Register.css';

export default function Register() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const navigate = useNavigate();

  const roles = ["Estudiante", "Docente"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar el nombre completo en el perfil de Auth
      await updateProfile(user, {
        displayName: `${name} ${lastName}`
      });

      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        lastName,
        email,
        role,
        createdAt: new Date()
      });

      setSnackbar({ open: true, message: "Usuario creado con éxito", severity: "success" });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error("Error al registrar:", err);
      setSnackbar({ open: true, message: "Error al registrar el usuario", severity: "error" });
    }
  };

  return (
    <div className="register-container">
      <Container maxWidth="sm">
        <Box className="register-box">
          <Typography variant="h4" gutterBottom className="register-title">
            Crea tu cuenta
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              className="register-input"
              label="Nombre"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              className="register-input"
              label="Apellido"
              fullWidth
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <TextField
              className="register-input"
              label="Correo electrónico"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              className="register-input"
              label="Contraseña"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              className="register-input"
              label="Rol"
              select
              fullWidth
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {roles.map((rol) => (
                <MenuItem key={rol} value={rol}>{rol}</MenuItem>
              ))}
            </TextField>
            <Button type="submit" variant="contained" color="primary" fullWidth className="register-button">
              REGISTRAR
            </Button>
            <Button onClick={() => navigate('/login')} variant="outlined" color="primary" fullWidth className="register-button">
              CANCELAR
            </Button>
          </form>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
