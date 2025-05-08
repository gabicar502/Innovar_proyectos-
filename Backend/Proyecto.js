import { db } from './firebase'; // Asegúrate de importar la configuración de Firebase
import { collection, addDoc } from 'firebase/firestore';

class Proyecto {
  // Método para crear un nuevo proyecto
  static async crearProyecto(proyectoData) {
    try {
      const docRef = await addDoc(collection(db, 'proyectos'), proyectoData);
      console.log("Proyecto creado con ID: ", docRef.id);
      return docRef.id; // Devuelve el ID del proyecto creado
    } catch (e) {
      console.error("Error al agregar el proyecto: ", e);
      throw new Error("Error al crear el proyecto.");
    }
  }
}

export default Proyecto;
