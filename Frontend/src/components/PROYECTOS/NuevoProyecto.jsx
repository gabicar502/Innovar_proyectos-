import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import './NuevoProyecto.css';

function NuevoProyecto() {
  const [titulo, setTitulo] = useState('');
  const [area, setArea] = useState('');
  const [objetivos, setObjetivos] = useState('');
  const [cronograma, setCronograma] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [integrantes, setIntegrantes] = useState('');
  const [observaciones, setObservaciones] = useState('');

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
    };

    try {
      const docRef = await addDoc(collection(db, 'proyectos'), proyectoData);
      console.log('Proyecto creado con ID: ', docRef.id);
      setTitulo('');
      setArea('');
      setObjetivos('');
      setCronograma('');
      setPresupuesto('');
      setInstitucion('');
      setIntegrantes('');
      setObservaciones('');
      alert('Proyecto creado exitosamente!');
    } catch (e) {
      console.error('Error al crear el proyecto: ', e);
      alert('Hubo un error al crear el proyecto. Intenta de nuevo.');
    }
  };

  return (
    <Box className="NuevoProyecto-container">
      <Paper className="NuevoProyecto-paper">
        <Typography className="NuevoProyecto-title">Nuevo Proyecto</Typography>
        <form className="NuevoProyecto-form" onSubmit={handleSubmit}>
          <TextField
            label="Título"
            fullWidth
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="NuevoProyecto-input"
            required
          />
          <TextField
            label="Área"
            fullWidth
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="NuevoProyecto-input"
            required
          />
          <TextField
            label="Objetivos"
            fullWidth
            value={objetivos}
            onChange={(e) => setObjetivos(e.target.value)}
            className="NuevoProyecto-input"
            required
          />
          <TextField
            label="Cronograma"
            fullWidth
            value={cronograma}
            onChange={(e) => setCronograma(e.target.value)}
            className="NuevoProyecto-input"
            required
          />
          <TextField
            label="Presupuesto"
            type="number"
            fullWidth
            value={presupuesto}
            onChange={(e) => setPresupuesto(e.target.value)}
            className="NuevoProyecto-input"
            required
          />
          <TextField
            label="Institución"
            fullWidth
            value={institucion}
            onChange={(e) => setInstitucion(e.target.value)}
            className="NuevoProyecto-input"
            required
          />
          <TextField
            label="Integrantes"
            fullWidth
            value={integrantes}
            onChange={(e) => setIntegrantes(e.target.value)}
            className="NuevoProyecto-input"
            required
          />
          <TextField
            label="Observaciones"
            fullWidth
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="NuevoProyecto-input"
          />
          <Button type="submit" variant="contained" fullWidth className="NuevoProyecto-button">
            Crear Proyecto
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default NuevoProyecto;
