const express = require('express');
const axios = require('axios'); // 
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ==========================================
// SECCIÓN 1: RUTAS DEL SERVIDOR (API)
// ==========================================

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const doesExist = users.filter((user) => user.username === username);
    
    if (doesExist.length === 0) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "Usuario registrado exitosamente. Ya puedes iniciar sesión."});
    } else {
      return res.status(404).json({message: "¡El usuario ya existe!"});
    }
  }
  return res.status(404).json({message: "No se pudo registrar el usuario. Faltan credenciales."});
});

public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn]; 
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({message: "Libro no encontrado"});
  }
});
  
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];
  Object.keys(books).forEach(key => {
    if (books[key].author === author) {
      booksByAuthor.push(books[key]);
    }
  });
  if (booksByAuthor.length > 0) {
    return res.status(200).json({booksbyauthor: booksByAuthor});
  } else {
    return res.status(404).json({message: "No se encontraron libros de este autor"});
  }
});

public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];
  Object.keys(books).forEach(key => {
    if (books[key].title === title) {
      booksByTitle.push(books[key]);
    }
  });
  if (booksByTitle.length > 0) {
    return res.status(200).json({booksbytitle: booksByTitle});
  } else {
    return res.status(404).json({message: "No se encontraron libros con este título"});
  }
});

public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({message: "Libro no encontrado"});
  }
});

module.exports.general = public_users;

// ==========================================
// SECCIÓN 2: SIMULACIÓN CLIENTE AXIOS
// ==========================================
const BASE_URL = "http://localhost:5000";

/**
 * Obtener la lista de libros disponibles.
 * Lógica: Se utiliza async/await para manejar la petición HTTP de forma asíncrona. 
 * El bloque try/catch permite capturar errores de conexión y evitar que el servidor colapse.
 */
const getAllBooksAsync = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        console.log("Lista de libros obtenida con Axios:\n", response.data);
    } catch (error) {
        console.error("Error al obtener libros:", error.message);
    }
};

/**
 * Obtener detalles del libro basado en ISBN.
 * Lógica: Implementación usando Promesas tradicionales (.then / .catch). 
 * Ideal para encadenar respuestas exitosas o manejar el rechazo si el ISBN no existe.
 */
const getBookByIsbnPromise = (isbn) => {
    axios.get(`${BASE_URL}/isbn/${isbn}`)
        .then(response => {
            console.log(`\nDetalles del libro con ISBN ${isbn}:\n`, response.data);
        })
        .catch(error => {
            console.error("Error al obtener libro por ISBN:", error.message);
        });
};

/**
 * Obtener detalles del libro basado en Autor.
 * Lógica: Uso de async/await. La variable author se inyecta en la URL de forma dinámica.
 * Espera la resolución de la promesa antes de imprimir los datos en consola.
 */
const getBookByAuthorAsync = async (author) => {
    try {
        const response = await axios.get(`${BASE_URL}/author/${author}`);
        console.log(`\nLibros del autor ${author}:\n`, response.data);
    } catch (error) {
        console.error("Error al obtener libro por autor:", error.message);
    }
};

/**
 * Obtener detalles del libro basado en Título.
 * Lógica: Uso de async/await para solicitar a la API los libros filtrados por título.
 * Si la petición es exitosa, se muestran los detalles, de lo contrario se imprime el error.
 */
const getBookByTitleAsync = async (title) => {
    try {
        const response = await axios.get(`${BASE_URL}/title/${title}`);
        console.log(`\nLibros con el título ${title}:\n`, response.data);
    } catch (error) {
        console.error("Error al obtener libro por título:", error.message);
    }
};

// Llamadas a las funciones 
getAllBooksAsync();
getBookByIsbnPromise(5);
getBookByAuthorAsync("Jane Austen");
getBookByTitleAsync("Le Père Goriot");