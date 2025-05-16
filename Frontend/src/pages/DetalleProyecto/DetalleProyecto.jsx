import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Box, Typography, Paper, Tabs, Tab, Button, TextField, Input, Divider
} from '@mui/material';
import './DetalleProyecto.css';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function DetalleProyecto() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');

  const obtenerProyecto = async () => {
    try {
      const docRef = doc(db, 'proyectos', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const estudiantes = await Promise.all(
          (data.estudiantesAsignados || []).map(async (uid) => {
            const userSnap = await getDoc(doc(db, 'users', uid));
            if (userSnap.exists()) {
              const userData = userSnap.data();
              return `${userData.name} ${userData.lastName}`;
            }
            return uid;
          })
        );

        let nombreDocente = 'No asignado';
        if (data.docenteAsignado) {
          const docenteSnap = await getDoc(doc(db, 'users', data.docenteAsignado));
          if (docenteSnap.exists()) {
            const docenteData = docenteSnap.data();
            nombreDocente = `${docenteData.name} ${docenteData.lastName}`;
          }
        }

        setProyecto({
          ...data,
          nombresEstudiantes: estudiantes,
          nombreDocente,
          historialAvances: data.historialAvances || []
        });
      }
    } catch (error) {
      console.error('Error al obtener detalle del proyecto:', error);
    }
  };

  useEffect(() => {
    obtenerProyecto();
  }, [id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("✅ Usuario autenticado con UID:", user.uid);
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log("🎯 Datos del usuario:", userData);

            if (userData.role) {
              const rol = userData.role.toLowerCase(); // ← CAMBIO AQUÍ
              setRolUsuario(rol);
              console.log("🔐 Rol detectado:", rol);
            } else {
              console.warn('⚠️ El campo "role" no está definido en Firestore para este usuario.');
              setRolUsuario('sin-rol');
            }

            setNombreUsuario(`${userData.name} ${userData.lastName}`);
          } else {
            console.warn('⚠️ No se encontró el documento del usuario en Firestore.');
            setRolUsuario('sin-registro');
          }
        } catch (error) {
          console.error('❌ Error al obtener rol de usuario:', error);
          setRolUsuario('error');
        }
      } else {
        console.warn("⚠️ No hay usuario autenticado.");
        setRolUsuario('sin-sesion');
      }
    });

    return () => unsubscribe();
  }, []);

  if (!proyecto || rolUsuario === null) {
    return (
      <Box className="detalle-proyecto-container">
        <Typography>Cargando información del proyecto y usuario...</Typography>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  const tabs = [
    {
      label: 'Información del proyecto',
      content: (
        <>
          <Typography className="detalle-proyecto-detalle"><strong>Área:</strong> {proyecto.area}</Typography>
          <Typography className="detalle-proyecto-detalle"><strong>Objetivos:</strong> {proyecto.objetivos}</Typography>
          <Typography className="detalle-proyecto-detalle"><strong>Institución:</strong> {proyecto.institucion}</Typography>
          <Typography className="detalle-proyecto-detalle"><strong>Estado:</strong> {proyecto.estado}</Typography>
        </>
      )
    },
    {
      label: 'Integrantes',
      content: (
        <>
          <Typography className="detalle-proyecto-detalle"><strong>Docente:</strong> {proyecto.nombreDocente}</Typography>
          <Typography className="detalle-proyecto-detalle"><strong>Estudiantes:</strong> {proyecto.nombresEstudiantes.join(', ')}</Typography>
        </>
      )
    },
  ];

  if (rolUsuario !== 'docente') {
    tabs.push({
      label: 'Agregar avance',
      content: (
        <form className="form-avance">
          <TextField
            label="Descripción del avance"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />
          <Input
            type="file"
            inputProps={{ accept: ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" }}
          />
          <Button variant="contained" className="detalle-proyecto-btn" sx={{ mt: 2 }}>
            Subir avance
          </Button>
        </form>
      )
    });
  }

  tabs.push({
    label: 'Historial de avances',
    content: proyecto.historialAvances.length === 0 ? (
      <Typography>No hay avances registrados.</Typography>
    ) : (
      proyecto.historialAvances.map((avance, idx) => (
        <Box key={idx} sx={{ mb: 2 }}>
          <Typography><strong>Fecha:</strong> {avance.fecha}</Typography>
          <Typography><strong>Responsable:</strong> {avance.autor}</Typography>
          <Typography><strong>Descripción:</strong> {avance.descripcion}</Typography>
          <Typography>
            <strong>Archivo:</strong> <a href={avance.url} target="_blank" rel="noreferrer">Ver documento</a>
          </Typography>
          <Divider sx={{ my: 1 }} />
        </Box>
      ))
    )
  });

  return (
    <Box className="detalle-proyecto-container">
      <Paper className="detalle-proyecto-paper">
        <Typography className="detalle-proyecto-titulo">
          {proyecto.titulo}
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          <strong>Rol del usuario conectado:</strong> {rolUsuario}
        </Typography>

        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, i) => (
            <Tab key={i} label={tab.label} />
          ))}
        </Tabs>

        <Divider className="detalle-proyecto-divider" />

        {tabs.map((tab, i) => (
          <TabPanel key={i} value={tabIndex} index={i}>
            {tab.content}
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
}
