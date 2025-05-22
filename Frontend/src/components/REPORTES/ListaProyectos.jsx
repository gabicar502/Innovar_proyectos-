import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button
} from '@mui/material';

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
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Proyectos Registrados
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }} direction="column">
        {proyectos.map((proyecto) => (
          <Grid item xs={12} key={proyecto.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.01)' },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2
              }}
              onClick={() => navigate(`/panel/detalle-proyecto/${proyecto.id}`)}
            >
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6">
                  {proyecto.titulo || 'Proyecto sin título'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Área: {proyecto.area}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Institución: {proyecto.institucion}
                </Typography>
              </CardContent>
              <Button
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // evitar redirección al hacer clic en el botón
                  navigate(`/panel/generar-reporte/${proyecto.id}`);
                }}
                sx={{ mr: 2 }}
              >
                Generar Reporte
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ListaProyectos;
