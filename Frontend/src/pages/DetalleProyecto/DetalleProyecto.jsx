import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  doc, getDoc, collection, addDoc, query, where, getDocs
} from 'firebase/firestore';
import { db, auth, storage } from '../../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Box, Typography, Paper, Tabs, Tab, Button, TextField, Input, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import './DetalleProyecto.css';

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 2 }}>{children}</Box>}</div>;
}

export default function DetalleProyecto() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState({ historialAvances: [] });
  const [tabIndex, setTabIndex] = useState(0);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [descripcionAvance, setDescripcionAvance] = useState('');
  const [archivoAvance, setArchivoAvance] = useState(null);
  const [cargandoAvance, setCargandoAvance] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [modalExito, setModalExito] = useState(true);

  // Obtener datos del proyecto y avances
  const obtenerProyecto = async () => {
    try {
      const docRef = doc(db, 'proyectos', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const estudiantes = await Promise.all(
          (data.estudiantesAsignados || []).map(async (uid) => {
            const userSnap = await getDoc(doc(db, 'users', uid));
            return userSnap.exists() ? `${userSnap.data().name} ${userSnap.data().lastName}` : uid;
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

        const hitosQuery = query(collection(db, 'hito'), where('proyectoId', '==', id));
        const hitosSnap = await getDocs(hitosQuery);
        const historialAvances = hitosSnap.empty ? [] : hitosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setProyecto({
          ...data,
          nombresEstudiantes: estudiantes,
          nombreDocente,
          historialAvances
        });
      } else {
        setModalExito(false);
        setModalMensaje('No existe el proyecto solicitado.');
        setOpenModal(true);
      }
    } catch (error) {
      console.error('Error al obtener detalle del proyecto:', error);
      setModalExito(false);
      setModalMensaje('Error al cargar el proyecto: ' + error.message);
      setOpenModal(true);
    }
  };

  useEffect(() => { obtenerProyecto(); }, [id]);

  // Detectar usuario y rol
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userSnap = await getDoc(doc(db, 'users', user.uid));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setRolUsuario(userData.role?.toLowerCase() || 'sin-rol');
            setNombreUsuario(`${userData.name} ${userData.lastName}`);
          } else {
            setRolUsuario('sin-registro');
          }
        } catch (err) {
          console.error('Error al obtener datos del usuario:', err);
          setRolUsuario('error');
        }
      } else {
        setRolUsuario('sin-sesion');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleTabChange = (event, newValue) => setTabIndex(newValue);
  const handleArchivoChange = (e) => setArchivoAvance(e.target.files[0]);

  const handleSubirAvance = async (e) => {
    e.preventDefault();
    if (!descripcionAvance || !archivoAvance) {
      setModalExito(false);
      setModalMensaje('Debe completar la descripción y seleccionar un archivo.');
      setOpenModal(true);
      return;
    }

    setCargandoAvance(true);

    try {
      console.log("Iniciando subida de archivo...");
      const fecha = new Date().toISOString().split('T')[0];
      const storageRef = ref(storage, `avances/${id}/${Date.now()}_${archivoAvance.name}`);

      await uploadBytes(storageRef, archivoAvance);
      console.log("Archivo subido.");

      const url = await getDownloadURL(storageRef);
      console.log("URL obtenida:", url);

      const nuevoAvance = {
        descripcion: descripcionAvance,
        autor: nombreUsuario,
        fecha,
        url,
        proyectoId: id,
        creadoEn: new Date()  // para mejor orden futuro
      };

      console.log("Guardando avance en Firestore...");
      const docRef = await addDoc(collection(db, 'hito'), nuevoAvance);
      console.log("Documento creado con ID:", docRef.id);

      setDescripcionAvance('');
      setArchivoAvance(null);
      setModalExito(true);
      setModalMensaje('¡Avance subido exitosamente!');
      await obtenerProyecto();
    } catch (error) {
      console.error("Error al subir avance:", error);
      setModalExito(false);
      setModalMensaje('Hubo un error al subir el avance: ' + error.message);
    } finally {
      setCargandoAvance(false);
      setOpenModal(true);
    }
  };

  const handleCerrarModal = () => setOpenModal(false);

  if (!proyecto.titulo || rolUsuario === null) {
    return (
      <Box className="detalle-proyecto-container">
        <Typography>Cargando información del proyecto y usuario...</Typography>
      </Box>
    );
  }

  const tabs = [
    {
      label: 'Información del proyecto',
      content: (
        <>
          <Typography><strong>Área:</strong> {proyecto.area}</Typography>
          <Typography><strong>Objetivos:</strong> {proyecto.objetivos}</Typography>
          <Typography><strong>Institución:</strong> {proyecto.institucion}</Typography>
          <Typography><strong>Estado:</strong> {proyecto.estado}</Typography>
        </>
      )
    },
    {
      label: 'Integrantes',
      content: (
        <>
          <Typography><strong>Docente:</strong> {proyecto.nombreDocente}</Typography>
          <Typography><strong>Estudiantes:</strong> {proyecto.nombresEstudiantes.join(', ')}</Typography>
        </>
      )
    }
  ];

  if (rolUsuario !== 'docente') {
    tabs.push({
      label: 'Agregar avance',
      content: (
        <form onSubmit={handleSubirAvance} className="form-avance">
          <TextField
            label="Descripción del avance"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={descripcionAvance}
            onChange={(e) => setDescripcionAvance(e.target.value)}
            margin="normal"
          />
          <Input
            type="file"
            inputProps={{ accept: ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" }}
            onChange={handleArchivoChange}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={cargandoAvance}>
            {cargandoAvance ? 'Subiendo...' : 'Subir avance'}
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
      proyecto.historialAvances
        .sort((a, b) => (a.creadoEn?.seconds || 0) - (b.creadoEn?.seconds || 0))
        .map((avance, idx) => (
          <Box key={avance.id || idx} sx={{ mb: 2 }}>
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

      <Dialog open={openModal} onClose={handleCerrarModal}>
        <DialogTitle>{modalExito ? 'Éxito' : 'Error'}</DialogTitle>
        <DialogContent>
          <Typography>{modalMensaje}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarModal} autoFocus>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
