import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Grid, Card, CardContent } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

function BuscarProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const obtenerProyectos = async () => {
      const querySnapshot = await getDocs(collection(db, 'proyectos'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProyectos(data);
    };
    obtenerProyectos();
  }, []);

  const filtrados = proyectos.filter(proj =>
    proj.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    proj.autor?.toLowerCase().includes(busqueda.toLowerCase()) ||
    proj.area?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Box>
      <TextField
        label="Buscar por nombre, autor o área"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      <Grid container spacing={2}>
        {filtrados.map(proj => (
          <Grid item xs={12} md={6} lg={4} key={proj.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{proj.nombre}</Typography>
                <Typography variant="body2">Autor: {proj.autor}</Typography>
                <Typography variant="body2">Área: {proj.area}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default BuscarProyectos;
