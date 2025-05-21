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
import { useNavigate } from 'react-router-dom';
import './MisProyectosDocente.css';

function MisProyectosDocente() {
  const [proyectos, setProyectos] = useState([]);
  const [correosPorProyecto, setCorreosPorProyecto] = useState({});
  const [actualizando, setActualizando] = useState('');
  const [estudiantesPorProyecto, setEstudiantesPorProyecto] = useState({});

  const navigate = useNavigate();

  const obtenerProyectos = async () => {
    try {
      const q = query(
        collection(db, 'proyectos'),
        where('docenteAsignado', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProyectos(lista);

      const nuevosEstudiantes = {};
      for (const proyecto of lista) {
        if (proyecto.estudiantesAsignados?.length > 0) {
          const estudiantesNombres = await Promise.all(
            proyecto.estudiantesAsignados.map(async (uid) => {
              const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', uid)));
              if (!userDoc.empty) {
                const userData = userDoc.docs[0].data();
                return `${userData.name} ${userData.lastName}`;
              }
              return uid;
            })
          );
          nuevosEstudiantes[proyecto.id] = estudiantesNombres;
        } else {
          nuevosEstudiantes[proyecto.id] = [];
        }
      }
      setEstudiantesPorProyecto(nuevosEstudiantes);
    } catch (error) {
      console.error('Error obteniendo proyectos:', error);
    }
  };

  const asignarEstudiante = async (proyectoId) => {
    const correo = correosPorProyecto[proyectoId]?.trim();
    if (!correo) return;

    setActualizando(proyectoId);

    try {
      const q = query(collection(db, 'users'), where('email', '==', correo));
      const snap = await getDocs(q);

      if (snap.empty) {
        alert('No se encontró ningún estudiante con ese correo.');
        setActualizando('');
        return;
      }

      const estudianteDoc = snap.docs[0];
      const estudianteId = estudianteDoc.id;

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
      await obtenerProyectos();
    } catch (error) {
      console.error('Error al asignar estudiante:', error);
      alert('Ocurrió un error al asignar el estudiante.');
    }

    setActualizando('');
  };

  useEffect(() => {
    obtenerProyectos();
  }, []);

  const irDetalleProyecto = (id) => {
     navigate(`/panel/detalle-proyecto/${id}`);
    console.log('Navegando a detalle del proyecto:', id);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Mis Proyectos Asignados</Typography>
      {proyectos.map(p => (
        <Paper
          key={p.id}
          sx={{ p: 2, mb: 2, cursor: 'pointer' }}
          onClick={() => irDetalleProyecto(p.id)}
          elevation={3}
        >
          <Typography variant="h6">{p.titulo}</Typography>
          <Typography>Área: {p.area}</Typography>
          <Typography>Institución: {p.institucion}</Typography>
          <Typography>
            Estudiantes asignados: {
              estudiantesPorProyecto[p.id]?.length > 0
                ? estudiantesPorProyecto[p.id].join(', ')
                : 'Ninguno'
            }
          </Typography>

          <Box
            mt={1}
            display="flex"
            gap={2}
            flexWrap="wrap"
            onClick={(e) => e.stopPropagation()}
          >
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
              disabled={actualizando === p.id}
            >
              {actualizando === p.id ? 'Asignando...' : 'Asignar Estudiante'}
            </Button>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export default MisProyectosDocente;
