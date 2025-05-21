import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import { useNavigate } from 'react-router-dom';
import './MiProyectoEstudiante.css';

function MiProyectoEstudiante() {
  const [proyectos, setProyectos] = useState([]);
  const navigate = useNavigate();

  const obtenerProyectos = async () => {
    try {
      if (!auth.currentUser) return;

      const q = query(
        collection(db, 'proyectos'),
        where('estudiantesAsignados', 'array-contains', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const lista = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = { id: docSnap.id, ...docSnap.data() };

            // Obtener nombre del docente
            let nombreDocente = 'No asignado';
            if (data.docenteAsignado) {
              const docenteRef = doc(db, 'users', data.docenteAsignado);
              const docenteSnap = await getDoc(docenteRef);
              if (docenteSnap.exists()) {
                const docenteData = docenteSnap.data();
                nombreDocente = `${docenteData.name} ${docenteData.lastName}`;
              }
            }

            // Obtener nombres de estudiantes
            let nombresEstudiantes = [];
            if (Array.isArray(data.estudiantesAsignados)) {
              const nombres = await Promise.all(
                data.estudiantesAsignados.map(async (uid) => {
                  const estRef = doc(db, 'users', uid);
                  const estSnap = await getDoc(estRef);
                  if (estSnap.exists()) {
                    const d = estSnap.data();
                    return `${d.name} ${d.lastName}`;
                  }
                  return uid;
                })
              );
              nombresEstudiantes = nombres;
            }

            return {
              ...data,
              nombreDocente,
              nombresEstudiantes
            };
          })
        );

        setProyectos(lista);
      } else {
        setProyectos([]);
      }
    } catch (error) {
      console.error('Error al obtener proyectos del estudiante:', error);
    }
  };

  useEffect(() => {
    obtenerProyectos();
  }, []);

  const handleClick = (id) => {
    navigate(`/panel/detalle-proyecto/${id}`);
  };

  if (proyectos.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No tienes proyectos asignados todavía.</Typography>
      </Box>
    );
  }

  return (
    <Box className="mi-proyecto-container">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {proyectos.map((proyecto) => (
          <Paper
            key={proyecto.id}
            className="mi-proyecto-paper"
            onClick={() => handleClick(proyecto.id)}
            sx={{ cursor: 'pointer' }}
          >
            <Typography className="mi-proyecto-titulo">{proyecto.titulo}</Typography>
            <Typography className="mi-proyecto-detalle"><strong>Área:</strong> {proyecto.area}</Typography>
            <Typography className="mi-proyecto-detalle"><strong>Objetivos:</strong> {proyecto.objetivos}</Typography>
            <Typography className="mi-proyecto-detalle"><strong>Institución:</strong> {proyecto.institucion}</Typography>
            <Typography className="mi-proyecto-detalle"><strong>Docente asignado:</strong> {proyecto.nombreDocente}</Typography>
            <Typography className="mi-proyecto-detalle"><strong>Integrantes:</strong> {proyecto.nombresEstudiantes.join(', ') || 'Ninguno'}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default MiProyectoEstudiante;
