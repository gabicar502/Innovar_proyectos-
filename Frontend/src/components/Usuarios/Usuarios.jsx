import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { db, auth } from '../../../config/firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore';
import './Usuarios.css';


function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nombre: '', correo: '', rol: '' });
  const [editId, setEditId] = useState(null);

  const obtenerUsuarios = async () => {
    const querySnapshot = await getDocs(collection(db, 'usuarios'));
    const datos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsuarios(datos);
  };

  const guardarUsuario = async () => {
    if (editId) {
      const docRef = doc(db, 'usuarios', editId);
      await updateDoc(docRef, form);
    } else {
      await addDoc(collection(db, 'usuarios'), form);
    }
    setOpen(false);
    setForm({ nombre: '', correo: '', rol: '' });
    setEditId(null);
    obtenerUsuarios();
  };

  const editarUsuario = (usuario) => {
    setForm({ nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol });
    setEditId(usuario.id);
    setOpen(true);
  };

  const eliminarUsuario = async (id) => {
    await deleteDoc(doc(db, 'usuarios', id));
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
              <TableCell>{u.nombre}</TableCell>
              <TableCell>{u.correo}</TableCell>
              <TableCell>{u.rol}</TableCell>
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
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Correo"
            fullWidth
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Rol (Estudiante, Docente, Coordinador)"
            fullWidth
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={guardarUsuario}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Usuarios;
