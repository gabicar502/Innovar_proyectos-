import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, MenuItem, Stack, Tooltip
} from '@mui/material';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase';
import { useNavigate } from 'react-router-dom';
import './NuevoProyecto.css'; // Importa el CSS

function NuevoProyecto() {
  const [titulo, setTitulo] = useState('');
  const [area, setArea] = useState('');
  const [objetivos, setObjetivos] = useState('');
  const [cronograma, setCronograma] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [integrantes, setIntegrantes] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [docenteAsignado, setDocenteAsignado] = useState('');
  const [docentes, setDocentes] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDocentes = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'Docente'));
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocentes(lista);
    };
    obtenerDocentes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const proyectoData = {
      titulo,
      area,
      objetivos,
      cronograma,
      presupuesto,
      institucion,
      integrantes: integrantes.split(',').map((item) => item.trim()),
      observaciones,
      docenteAsignado,
      creadoPor: auth.currentUser.uid,
      estudiantesAsignados: [],
      fechaCreacion: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, 'proyectos'), proyectoData);
      alert('¡Proyecto creado exitosamente!');
      navigate('/panel');
    } catch (e) {
      alert('Hubo un error al crear el proyecto. Intenta de nuevo.');
    }
  };

  const handleCancel = () => {
    navigate('/panel');
  };

  return (
    <Box className="NuevoProyecto-container">
      <Paper className="NuevoProyecto-paper">
        <Typography className="NuevoProyecto-title">
          Nuevo Proyecto
        </Typography>
        <form onSubmit={handleSubmit} className="NuevoProyecto-form">
          <Tooltip title="Título del proyecto" arrow>
            <TextField
              className="NuevoProyecto-input"
              label="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              fullWidth
              required
            />
          </Tooltip>
          <Tooltip title="Área temática del proyecto" arrow>
            <TextField
              className="NuevoProyecto-input"
              label="Área"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              fullWidth
              required
            />
          </Tooltip>
          <Tooltip title="Objetivos principales" arrow>
            <TextField
              className="NuevoProyecto-input"
              label="Objetivos"
              value={objetivos}
              onChange={(e) => setObjetivos(e.target.value)}
              fullWidth
              required
            />
          </Tooltip>
          <Tooltip title="Cronograma o fechas importantes" arrow>
            <TextField
              className="NuevoProyecto-input"
              label="Cronograma"
              value={cronograma}
              onChange={(e) => setCronograma(e.target.value)}
              fullWidth
              required
            />
          </Tooltip>
          <Tooltip title="Presupuesto estimado" arrow>
            <TextField
              className="NuevoProyecto-input"
              label="Presupuesto"
              type="number"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
              fullWidth
              required
            />
          </Tooltip>
          <Tooltip title="Nombre de la institución participante" arrow>
            <TextField
              className="NuevoProyecto-input"
              label="Institución"
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
              fullWidth
              required
            />
          </Tooltip>
          <Tooltip title="Docente responsable del proyecto" arrow>
            <TextField
              className="NuevoProyecto-input"
              select
              label="Asignar Docente"
              value={docenteAsignado}
              onChange={(e) => setDocenteAsignado(e.target.value)}
              fullWidth
              required
            >
              {docentes.map((docente) => (
                <MenuItem key={docente.id} value={docente.id}>
                  {docente.name} {docente.lastName} - {docente.email}
                </MenuItem>
              ))}
            </TextField>
          </Tooltip>
          <Tooltip title="Lista de integrantes separados por coma" arrow>
            <TextField
              className="NuevoProyecto-input"
              label="Integrantes (separados por coma)"
              value={integrantes}
              onChange={(e) => setIntegrantes(e.target.value)}
              fullWidth
              required
            />
          </Tooltip>
          <Tooltip title="Observaciones adicionales" arrow>
            <TextField
              className="NuevoProyecto-input"
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Tooltip>

          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button variant="outlined" color="secondary" onClick={handleCancel} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" className="NuevoProyecto-button" fullWidth>
              Crear Proyecto
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

export default NuevoProyecto;
