import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

function ListaProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerProyectos = async () => {
      const querySnapshot = await getDocs(collection(db, 'proyectos'));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setProyectos(lista);
    };
    obtenerProyectos();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Proyectos Registrados</Typography>
      <Paper sx={{ mt: 2 }}>
        <List>
          {proyectos.map((proyecto) => (
            <ListItem
              key={proyecto.id}
              secondaryAction={
                <Button variant="contained" onClick={() => navigate(`/panel/generar-reporte/${proyecto.id}`)}>
                  Generar Reporte
                </Button>
              }
            >
              <ListItemText
                primary={proyecto.nombre || 'Proyecto sin nombre'}
                secondary={`Área: ${proyecto.area} | Institución: ${proyecto.institucion}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default ListaProyectos;
