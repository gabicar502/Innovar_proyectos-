import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import './MiProyectoEstudiante.css';

function MiProyectoEstudiante() {
  const [proyecto, setProyecto] = useState(null);
  const [nombreDocente, setNombreDocente] = useState('');
  const [nombresEstudiantes, setNombresEstudiantes] = useState([]);

  const obtenerProyecto = async () => {
    try {
      const q = query(
        collection(db, 'proyectos'),
        where('estudiantesAsignados', 'array-contains', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = { id: docSnap.id, ...docSnap.data() };
        setProyecto(data);

        // Obtener nombre del docente
        if (data.docenteAsignado) {
          const docenteRef = doc(db, 'users', data.docenteAsignado);
          const docenteSnap = await getDoc(docenteRef);
          if (docenteSnap.exists()) {
            const docenteData = docenteSnap.data();
            setNombreDocente(`${docenteData.name} ${docenteData.lastName}`);
          }
        }

        // Obtener nombres de estudiantes
        if (Array.isArray(data.estudiantesAsignados)) {
          const promesas = data.estudiantesAsignados.map(async (uid) => {
            const estRef = doc(db, 'users', uid);
            const estSnap = await getDoc(estRef);
            if (estSnap.exists()) {
              const d = estSnap.data();
              return `${d.name} ${d.lastName}`;
            }
            return uid; // fallback si no existe
          });

          const nombres = await Promise.all(promesas);
          setNombresEstudiantes(nombres);
        }

      } else {
        setProyecto(null);
      }
    } catch (error) {
      console.error("Error al obtener proyecto del estudiante:", error);
    }
  };

  useEffect(() => {
    obtenerProyecto();
  }, []);

  if (!proyecto) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No tienes un proyecto asignado todavía.</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>{proyecto.titulo}</Typography>
      <Typography><strong>Área:</strong> {proyecto.area}</Typography>
      <Typography><strong>Objetivos:</strong> {proyecto.objetivos}</Typography>
      <Typography><strong>Institución:</strong> {proyecto.institucion}</Typography>
      <Typography><strong>Docente asignado:</strong> {nombreDocente || 'No asignado'}</Typography>
      <Typography><strong>Integrantes:</strong> {nombresEstudiantes.join(', ') || 'Ninguno'}</Typography>
    </Paper>
  );
}

export default MiProyectoEstudiante;
