import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc
} from 'firebase/firestore';
import { db, auth, storage } from '../../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Box, Typography, Paper, Tabs, Tab, Button, TextField, Input, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from '@mui/material';
import './DetalleProyecto.css';

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 2 }}>{children}</Box>}</div>;
}

const estadosPermitidos = ['Formulación', 'Evaluación', 'Activo', 'Inactivo', 'Finalizado'];

export default function DetalleProyecto() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState({ historialAvances: [], historialEstados: [] });
  const [tabIndex, setTabIndex] = useState(0);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [descripcionAvance, setDescripcionAvance] = useState('');
  const [archivoAvance, setArchivoAvance] = useState(null);
  const [cargandoAvance, setCargandoAvance] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [modalExito, setModalExito] = useState(true);

  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observacionEstado, setObservacionEstado] = useState('');
  const [cargandoEstado, setCargandoEstado] = useState(false);

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

        const historialEstados = data.historialEstados || [];

        setProyecto({
          ...data,
          nombresEstudiantes: estudiantes,
          nombreDocente,
          historialAvances,
          historialEstados
        });

        setNuevoEstado(data.estado || '');
      } else {
        setModalExito(false);
        setModalMensaje('No existe el proyecto solicitado.');
        setOpenModal(true);
      }
    } catch (error) {
      setModalExito(false);
      setModalMensaje('Error al cargar el proyecto: ' + error.message);
      setOpenModal(true);
    }
  };

  useEffect(() => { obtenerProyecto(); }, [id]);

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
      const fecha = new Date().toISOString().split('T')[0];
      const storageRef = ref(storage, `avances/${id}/${Date.now()}_${archivoAvance.name}`);
      await uploadBytes(storageRef, archivoAvance);
      const url = await getDownloadURL(storageRef);

      const nuevoAvance = {
        descripcion: descripcionAvance,
        autor: nombreUsuario,
        fecha,
        url,
        proyectoId: id,
        creadoEn: new Date()
      };

      await addDoc(collection(db, 'hito'), nuevoAvance);

      setDescripcionAvance('');
      setArchivoAvance(null);
      setModalExito(true);
      setModalMensaje('¡Avance subido exitosamente!');
      await obtenerProyecto();
    } catch (error) {
      setModalExito(false);
      setModalMensaje('Hubo un error al subir el avance: ' + error.message);
    } finally {
      setCargandoAvance(false);
      setOpenModal(true);
    }
  };

  const handleCerrarModal = () => setOpenModal(false);

  const handleCambioEstado = async () => {
    if (!nuevoEstado) {
      setModalExito(false);
      setModalMensaje('Debe seleccionar un estado.');
      setOpenModal(true);
      return;
    }
    if (!observacionEstado.trim()) {
      setModalExito(false);
      setModalMensaje('Debe escribir una observación para el cambio de estado.');
      setOpenModal(true);
      return;
    }
    setCargandoEstado(true);
    try {
      const proyectoRef = doc(db, 'proyectos', id);

      const nuevoHistorial = {
        fecha: new Date().toISOString().split('T')[0],
        estado: nuevoEstado,
        observacion: observacionEstado,
        autor: nombreUsuario
      };

      const docSnap = await getDoc(proyectoRef);
      const historialAnterior = docSnap.exists() && docSnap.data().historialEstados ? docSnap.data().historialEstados : [];

      await updateDoc(proyectoRef, {
        estado: nuevoEstado,
        ultimaObservacionEstado: observacionEstado,
        fechaActualizacionEstado: new Date(),
        historialEstados: [...historialAnterior, nuevoHistorial]
      });

      setModalExito(true);
      setModalMensaje('Estado del proyecto actualizado correctamente.');
      setObservacionEstado('');
      await obtenerProyecto();
    } catch (error) {
      setModalExito(false);
      setModalMensaje('Error al actualizar el estado: ' + error.message);
    } finally {
      setCargandoEstado(false);
      setOpenModal(true);
    }
  };

  if (!proyecto.titulo || rolUsuario === null) {
    return (
      <Box className="detalle-proyecto-container">
        <Typography>Cargando información del proyecto y usuario...</Typography>
      </Box>
    );
  }

  const tabsTodos = [
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
    },
    {
      label: 'Ver estado del proyecto',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>Estado actual del proyecto</Typography>
          <Typography sx={{ mb: 2 }}>Estado: <strong>{proyecto.estado}</strong></Typography>

          {rolUsuario === 'coordinador' && (
            <Box sx={{ mt: 2, maxWidth: 400 }}>
              <TextField
                select
                label="Nuevo estado"
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                fullWidth
                margin="normal"
              >
                {estadosPermitidos.map((estado) => (
                  <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Observación"
                value={observacionEstado}
                onChange={(e) => setObservacionEstado(e.target.value)}
                multiline
                rows={3}
                fullWidth
                margin="normal"
              />

              <Button
                variant="contained"
                onClick={handleCambioEstado}
                disabled={cargandoEstado}
              >
                {cargandoEstado ? 'Actualizando...' : 'Cambiar estado'}
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6">Historial de estados</Typography>
          {proyecto.historialEstados.length === 0 ? (
            <Typography>No hay historial de estados registrado.</Typography>
          ) : (
            proyecto.historialEstados.map((estado, index) => (
              <Box key={index} sx={{ my: 2, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
                <Typography><strong>Fecha:</strong> {estado.fecha}</Typography>
                <Typography><strong>Estado:</strong> {estado.estado}</Typography>
                <Typography><strong>Observación:</strong> {estado.observacion}</Typography>
                <Typography><strong>Autor:</strong> {estado.autor}</Typography>
              </Box>
            ))
          )}
        </Box>
      )
    }
  ];

  if (rolUsuario !== 'docente' && rolUsuario !== 'coordinador') {
    tabsTodos.push({
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

  tabsTodos.push({
    label: 'Historial de avances',
    content: proyecto.historialAvances.length === 0 ? (
      <Typography>No hay avances registrados.</Typography>
    ) : (
      proyecto.historialAvances.map((avance, index) => (
        <Box key={index} sx={{ my: 2, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
          <Typography><strong>Fecha:</strong> {avance.fecha}</Typography>
          <Typography><strong>Autor:</strong> {avance.autor}</Typography>
          <Typography><strong>Descripción:</strong> {avance.descripcion}</Typography>
          <a href={avance.url} target="_blank" rel="noopener noreferrer">Ver archivo</a>
        </Box>
      ))
    )
  });

  return (
    <Box className="detalle-proyecto-container">
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>{proyecto.titulo}</Typography>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          {tabsTodos.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
        {tabsTodos.map((tab, index) => (
          <TabPanel key={index} value={tabIndex} index={index}>
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
          <Button onClick={handleCerrarModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}