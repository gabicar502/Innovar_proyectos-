import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import {
  Button, CircularProgress, Typography, Snackbar, Alert
} from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function GenerarReporte() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [mostrarSnack, setMostrarSnack] = useState(false);
  const [docenteNombre, setDocenteNombre] = useState('');

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        const docRef = doc(db, 'proyectos', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProyecto(data);

          // Obtener nombre del docente
          if (data.docenteAsignado) {
            const docenteRef = doc(db, 'users', data.docenteAsignado);
            const docenteSnap = await getDoc(docenteRef);
            if (docenteSnap.exists()) {
              const docenteData = docenteSnap.data();
              setDocenteNombre(`${docenteData.nombres || ''} ${docenteData.apellidos || ''}`);
            } else {
              setDocenteNombre('Docente no encontrado');
            }
          }
        } else {
          setMensaje('Proyecto no encontrado');
          setMostrarSnack(true);
        }
      } catch (error) {
        console.error('Error al obtener el proyecto:', error);
        setMensaje('Error al obtener el proyecto');
        setMostrarSnack(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProyecto();
  }, [id]);

  const generarPDF = () => {
    if (!proyecto) {
      setMensaje('El proyecto no está listo');
      setMostrarSnack(true);
      return;
    }

    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text('REPORTE DEL PROYECTO', 14, 20);

    const fechaFormateada = proyecto.fechaCreacion?.toDate
      ? proyecto.fechaCreacion.toDate().toLocaleDateString()
      : 'N/A';

    const integrantes = Array.isArray(proyecto.integrantes)
      ? proyecto.integrantes.join(', ')
      : proyecto.integrantes || 'N/A';

    const objetivos = Array.isArray(proyecto.objetivos)
      ? proyecto.objetivos.join('\n')
      : proyecto.objetivos || 'N/A';

    docPDF.setFontSize(12);
    docPDF.text(`Título: ${proyecto.titulo || 'Sin título'}`, 14, 30);
    docPDF.text(`Área: ${proyecto.area || 'N/A'}`, 14, 40);
    docPDF.text(`Institución: ${proyecto.institucion || 'N/A'}`, 14, 50);
    docPDF.text(`Fecha de Creación: ${fechaFormateada}`, 14, 60);
    docPDF.text(`Docente Asignado: ${docenteNombre || 'N/A'}`, 14, 70);
    docPDF.text(`Integrantes: ${integrantes}`, 14, 80);

    autoTable(docPDF, {
      startY: 90,
      head: [['Presupuesto', 'Objetivos', 'Observaciones']],
      body: [[
        proyecto.presupuesto || 'N/A',
        objetivos,
        proyecto.observaciones || 'N/A'
      ]]
    });

    docPDF.save(`reporte_${id}.pdf`);
    setMensaje('✅ Reporte generado exitosamente');
    setMostrarSnack(true);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Reporte de Proyecto
      </Typography>

      {loading ? (
        <CircularProgress sx={{ mt: 4 }} />
      ) : proyecto ? (
        <Button variant="contained" onClick={generarPDF}>
          GENERAR REPORTE PDF
        </Button>
      ) : (
        <Typography color="error" sx={{ mt: 2 }}>
          Proyecto no encontrado.
        </Typography>
      )}

      <Snackbar
        open={mostrarSnack}
        autoHideDuration={3000}
        onClose={() => setMostrarSnack(false)}
      >
        <Alert severity={mensaje.includes('exitosamente') ? 'success' : 'error'}>
          {mensaje}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default GenerarReporte;
