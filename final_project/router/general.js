const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


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

/* ==========================================
   SIMULACIÓN CLIENTE AXIOS (Tareas 10 a 13)
   ==========================================
*/

// Obtener la lista de libros disponibles usando Async/Await
const getAllBooksAsync = async () => {
    try {
        const response = await axios.get("http://localhost:5000/");
        console.log("Lista de libros obtenida con Axios:\n", response.data);
    } catch (error) {
        console.error("Error al obtener libros:", error.message);
    }
};

// Obtener detalles del libro basado en ISBN usando Promesas (Callbacks .then/.catch)
const getBookByIsbnPromise = (isbn) => {
    axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => {
            console.log(`\nDetalles del libro con ISBN ${isbn}:\n`, response.data);
        })
        .catch(error => {
            console.error("Error al obtener libro por ISBN:", error.message);
        });
};

// Obtener detalles del libro basado en Autor usando Async/Await
const getBookByAuthorAsync = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        console.log(`\nLibros del autor ${author}:\n`, response.data);
    } catch (error) {
        console.error("Error al obtener libro por autor:", error.message);
    }
};

// Obtener detalles del libro basado en Título usando Async/Await
const getBookByTitleAsync = async (title) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        console.log(`\nLibros con el título ${title}:\n`, response.data);
    } catch (error) {
        console.error("Error al obtener libro por título:", error.message);
    }
};


getAllBooksAsync();
getBookByIsbnPromise(5);
getBookByAuthorAsync("Jane Austen");
getBookByTitleAsync("Le Père Goriot");