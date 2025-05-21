import React, { useEffect } from 'react';
import { Container, Box, Typography, Button, Grid, Card, CardContent, CardMedia } from '@mui/material';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Logo from '../../img/Innovar Proyectos - Logo.png';
import './Home.css';
import orquideas_banner from '../../img/IMG_CARRUSEL/banner_ia-carrusel1.png';
import banner_robotica from '../../img/IMG_CARRUSEL/banner_robotica-carrusel2.png';
import banner_preguntale_ciencia from '../../img/IMG_CARRUSEL/banner_preguntale_ciencia-carrusel3.png';
import Primera_Noticia from '../../img/Primera_Noticia.jpg';
import Segunda_Noticia from '../../img/Segunda_Noticia.jpg';
import Tercera_Noticia from '../../img/Tercera_Noticia.jpg';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const sliderSettings = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  cssEase: "ease-in-out"
};

const noticias = [
  {
    titulo: "Gobiernos de Colombia y Japón abren convocatoria del Programa de Ciencia Sakura 2024",
    descripcion: "Estudiantes de grados 10º y 11º vinculados al Programa Ondas podrán participar en esta convocatoria para conocer la ciencia y tecnología japonesa.",
    imagen: Primera_Noticia,
    enlace: "https://minciencias.gov.co/sala_de_prensa/gobiernos-colombia-y-japon-abren-convocatoria-del-programa-ciencia-sakura-2024"
  },
  {
    titulo: "Adolescentes investigadoras de comunidades étnicas participarán en la Misión MIT-Harvard 2023",
    descripcion: "Diez niñas investigadoras del Programa Ondas viajarán a Estados Unidos para una inmersión académica en el MIT y Harvard.",
    imagen: Segunda_Noticia,
    enlace: "https://www.eje21.com.co/2023/03/adolescentes-investigadoras-de-comunidades-etnicas-a-participar-en-la-mision-mit-harvard-2023-investigadoras-ondas/"
  },
  {
    titulo: "Convocatoria para conformar grupos de investigación del Programa Ondas en Nariño",
    descripcion: "Se abre convocatoria para la conformación de grupos de investigación del Programa Ondas de Minciencias en Nariño.",
    imagen: Tercera_Noticia,
    enlace: "https://www.unicesmag.edu.co/convocatoria-para-conformar-grupos-de-investigacion-del-programa-ondas-de-miniciencias-en-narino/"
  }
];

function Home() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="home-container">
      <Box textAlign="center" mt={4} data-aos="fade-down">
        <img 
          src={Logo} 
          alt="Innovar Proyectos Logo" 
          style={{ width: '600px', maxWidth: '90%', height: 'auto', marginBottom: '30px' }} 
        />
        <Box mt={2}>
          <Link to="/login">
            <Button variant="contained" style={{ backgroundColor: 'white', color: 'black', padding: '10px 30px', fontSize: '16px', borderRadius: '20px' }}>
              Iniciar sesión
            </Button>
          </Link>
        </Box>
      </Box>

      <Container maxWidth="md" data-aos="fade-up">
        <Box mt={4}>
          <Slider {...sliderSettings}>
            <div>
              <img src={orquideas_banner} alt="Slide 1" className="carousel-img" />
            </div>
            <div>
              <img src={banner_robotica} alt="Slide 2" className="carousel-img" />
            </div>
            <div>
              <img src={banner_preguntale_ciencia} alt="Slide 3" className="carousel-img" />
            </div>
          </Slider>
        </Box>
      </Container>

      <Container maxWidth="lg">
        <Box mt={6}>
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            style={{ fontWeight: 'bold', color: '#007BFF' }}
            data-aos="fade-right"
          >
            📰 Noticias y Actualizaciones
          </Typography>
          <Grid container spacing={3}>
            {noticias.map((noticia, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} data-aos="zoom-in">
                <Card className="card">
                  <CardMedia
                    component="img"
                    className="card-media"
                    image={noticia.imagen}
                    alt={noticia.titulo}
                  />
                  <CardContent className="card-content">
                    <Typography variant="h6" gutterBottom>
                      {noticia.titulo}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {noticia.descripcion}
                    </Typography>
                    <a href={noticia.enlace} target="_blank" rel="noopener noreferrer">
                      Leer más
                    </a>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </div>
  );
}

export default Home;
