import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  Snackbar, Alert
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { db, auth } from '../../../config/firebase';
import {
  collection, getDocs, setDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './Usuarios.css';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    role: '',
    password: ''
  });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const obtenerUsuarios = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const datos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsuarios(datos);
  };

  const guardarUsuario = async () => {
    try {
      if (editId) {
        const docRef = doc(db, 'users', editId);
        await updateDoc(docRef, form);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const newUser = userCredential.user;

        await setDoc(doc(db, 'users', newUser.uid), {
          name: form.name,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          createdAt: new Date()
        });
      }

      setSnackbar({
        open: true,
        message: editId ? 'Usuario actualizado correctamente' : 'Usuario creado exitosamente',
        severity: 'success'
      });

      setOpen(false);
      setForm({ name: '', lastName: '', email: '', role: '', password: '' });
      setEditId(null);
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      setSnackbar({
        open: true,
        message: 'Error al guardar el usuario',
        severity: 'error'
      });
    }
  };

  const editarUsuario = (usuario) => {
    setForm({
      name: usuario.name || '',
      lastName: usuario.lastName || '',
      email: usuario.email || '',
      role: usuario.role || '',
      password: ''
    });
    setEditId(usuario.id);
    setOpen(true);
  };

  const eliminarUsuario = async (id) => {
    await deleteDoc(doc(db, 'users', id));
    obtenerUsuarios();
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Gestión de Usuarios</Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>Nuevo Usuario</Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Correo</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name} {u.lastName}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <IconButton onClick={() => editarUsuario(u)}><Edit /></IconButton>
                <IconButton onClick={() => eliminarUsuario(u.id)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editId ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Apellido"
            fullWidth
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Correo electrónico"
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Rol (Estudiante, Docente)"
            fullWidth
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            sx={{ mb: 2 }}
          />
          {!editId && (
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={guardarUsuario}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Usuarios;