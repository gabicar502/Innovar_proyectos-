import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, TextField } from '@mui/material';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import './MisProyectosDocente.css';

function MisProyectosDocente() {
  const [proyectos, setProyectos] = useState([]);
  const [correosPorProyecto, setCorreosPorProyecto] = useState({}); // estado por proyecto
  const [actualizando, setActualizando] = useState('');

  const obtenerProyectos = async () => {
    const q = query(
      collection(db, 'proyectos'),
      where('docenteAsignado', '==', auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProyectos(lista);
  };

  const asignarEstudiante = async (proyectoId) => {
    const correo = correosPorProyecto[proyectoId]?.trim();
    if (!correo) return;

    setActualizando(proyectoId);

    try {
      // Buscar estudiante por correo
      const q = query(collection(db, 'users'), where('email', '==', correo));
      const snap = await getDocs(q);

      if (snap.empty) {
        alert('No se encontró ningún estudiante con ese correo.');
        setActualizando('');
        return;
      }

      const estudianteDoc = snap.docs[0];
      const estudianteId = estudianteDoc.id;

      // Obtener proyecto actual
      const proyectoRef = doc(db, 'proyectos', proyectoId);
      const proyecto = proyectos.find(p => p.id === proyectoId);
      const actuales = proyecto.estudiantesAsignados || [];

      if (actuales.includes(estudianteId)) {
        alert('Este estudiante ya está asignado.');
        setActualizando('');
        return;
      }

      const nuevos = [...actuales, estudianteId];
      await updateDoc(proyectoRef, { estudiantesAsignados: nuevos });

      alert('Estudiante asignado con éxito.');
      setCorreosPorProyecto(prev => ({ ...prev, [proyectoId]: '' }));
      obtenerProyectos();
    } catch (error) {
      console.error('Error al asignar estudiante:', error);
      alert('Ocurrió un error al asignar el estudiante.');
    }

    setActualizando('');
  };

  useEffect(() => {
    obtenerProyectos();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Mis Proyectos Asignados</Typography>
      {proyectos.map(p => (
        <Paper key={p.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">{p.titulo}</Typography>
          <Typography>Área: {p.area}</Typography>
          <Typography>Institución: {p.institucion}</Typography>
          <Typography>
            Estudiantes asignados: {p.estudiantesAsignados?.length > 0 ? p.estudiantesAsignados.join(', ') : 'Ninguno'}
          </Typography>

          <Box mt={1} display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Correo del estudiante"
              type="email"
              size="small"
              value={correosPorProyecto[p.id] || ''}
              onChange={(e) =>
                setCorreosPorProyecto(prev => ({
                  ...prev,
                  [p.id]: e.target.value
                }))
              }
              sx={{ width: 300 }}
            />
            <Button
              variant="contained"
              onClick={() => asignarEstudiante(p.id)}
            >
              Asignar Estudiante
            </Button>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export default MisProyectosDocente;
