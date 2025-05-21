import React, { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItem, ListItemIcon, ListItemText,
  Drawer, InputBase, Paper, Divider, Avatar, Button, IconButton,
  Badge, Menu, MenuItem, Grid, Card, CardContent
} from '@mui/material';
import {
  Search as SearchIcon, Assignment as AssignmentIcon,
  AddBox as AddBoxIcon, ListAlt as ListAltIcon, ExitToApp as ExitToAppIcon,
  Menu as MenuIcon, NotificationsNone as NotificationsNoneIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { signOut } from "firebase/auth";
import { useNavigate, Outlet } from "react-router-dom";
import { auth, db } from "../../../config/firebase";
import { collection, onSnapshot, getDocs, query, orderBy } from 'firebase/firestore';
import Logo from "../../img/Innovar Proyectos - Logo.png";
import './PanelPrincipal.css';

function PanelPrincipal() {
  const [open, setOpen] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [anchorNotif, setAnchorNotif] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [leidas, setLeidas] = useState(false);
  const [proyectos, setProyectos] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Usuario';
    const role = localStorage.getItem('userRole') || 'Sin rol';
    setUserName(name);
    setUserRole(role);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'avances'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nuevas = snapshot.docs.map(doc => {
        const data = doc.data();
        return `🆕 ${data.autor || 'Alguien'} registró un avance en "${data.nombreProyecto || 'Proyecto'}"`;
      });
      setNotificaciones(nuevas);
      setLeidas(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const obtener = async () => {
      const q = query(collection(db, 'proyectos'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProyectos(data);
    };
    obtener();
  }, []);

  const filtrados = proyectos.filter(p => {
    return (
      p.nombre?.toLowerCase().includes(queryText.toLowerCase()) ||
      p.autor?.toLowerCase().includes(queryText.toLowerCase()) ||
      p.area?.toLowerCase().includes(queryText.toLowerCase())
    );
  });

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate('/');
  };

  const handleNotifClick = (event) => {
    setAnchorNotif(event.currentTarget);
    setLeidas(true);
  };

  const handleNotifClose = () => setAnchorNotif(null);

  const renderMenuByRole = () => {
    const reporteItem = (
      <ListItem button onClick={() => navigate('/panel/lista-proyectos')}>
        <ListItemIcon><AssignmentIcon /></ListItemIcon>
        <ListItemText primary="Reportes de Proyectos" />
      </ListItem>
    );

    switch (userRole) {
      case 'Estudiante':
        return (
          <>
            <ListItem button onClick={() => navigate('/panel/mi-proyecto')}>
              <ListItemIcon><ListAltIcon /></ListItemIcon>
              <ListItemText primary="Mi Proyecto" />
            </ListItem>
            {reporteItem}
          </>
        );
      case 'Docente':
        return (
          <>
            <ListItem button onClick={() => navigate('/panel/mis-proyectos-docente')}>
              <ListItemIcon><ListAltIcon /></ListItemIcon>
              <ListItemText primary="Mis Proyectos" />
            </ListItem>
            {reporteItem}
          </>
        );
      case 'Coordinador':
        return (
          <>
            <ListItem button onClick={() => navigate('/panel/nuevo-proyecto')}>
              <ListItemIcon><AddBoxIcon /></ListItemIcon>
              <ListItemText primary="Nuevo Proyecto" />
            </ListItem>
            <ListItem button onClick={() => navigate('/panel/usuarios')}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Gestión de Usuarios" />
            </ListItem>
            {reporteItem}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 260, backgroundColor: '#f7f9fb' } }}
      >
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <img src={Logo} alt="Logo" style={{ width: '200px' }} />
          <Avatar
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`}
            sx={{ width: 60, height: 60, mx: 'auto', mt: 1 }}
          />
          <Typography variant="body1" sx={{ mt: 1 }}>{userName}</Typography>
          <Typography variant="caption" color="textSecondary">{userRole}</Typography>
          <Box><Button variant="text" size="small">VER PERFIL</Button></Box>
        </Box>
        <Divider />
        <List>
          {renderMenuByRole()}
          <Divider sx={{ my: 1 }} />
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f0f2f5', p: 3 }}>
        <Paper sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, px: 2 }}>
          <IconButton onClick={() => setOpen(true)}><MenuIcon /></IconButton>
          <SearchIcon />
          <InputBase
            placeholder="Buscar en el sistema..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            sx={{ ml: 2, flex: 1 }}
          />
          <IconButton onClick={handleNotifClick} sx={{ ml: 2 }}>
            <Badge badgeContent={leidas ? 0 : notificaciones.length} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Paper>

        <Menu
          anchorEl={anchorNotif}
          open={Boolean(anchorNotif)}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {notificaciones.length === 0 ? (
            <MenuItem disabled>No hay notificaciones</MenuItem>
          ) : (
            notificaciones.map((msg, i) => (
              <MenuItem key={i} onClick={handleNotifClose}>{msg}</MenuItem>
            ))
          )}
        </Menu>

        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
          Bienvenido, {userName}
        </Typography>

        {queryText && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {filtrados.length > 0 ? (
              filtrados.map(proj => (
                <Grid item xs={12} sm={6} md={4} key={proj.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="body1"><strong>Autor:</strong> {proj.autor || 'Sin autor'}</Typography>
                      <Typography variant="body2">Área: {proj.area || 'Sin área'}</Typography>
                      <Typography variant="body2">Estado: {proj.estado || 'Sin estado'}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography variant="body1" sx={{ ml: 2 }}>No se encontraron proyectos.</Typography>
            )}
          </Grid>
        )}

        <Outlet />
      </Box>
    </Box>
  );
}

export default PanelPrincipal;
