const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    // Verificamos si el usuario ya existe en el arreglo
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

// Obtener la lista de libros disponibles
public_users.get('/',function (req, res) {
  // Retorna el objeto completo de libros con un formato JSON legible
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Obtener los detalles del libro basados en el ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn]; // Buscamos directamente la clave en el objeto

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({message: "Libro no encontrado"});
  }
});
  
// Obtener detalles del libro basados en el autor
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];

  // Obtenemos todas las claves (ISBNs) y las iteramos
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

// Obtener todos los libros basados en el título
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

// Obtener las reseñas de un libro
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    // Si el libro existe, retornamos solo la propiedad "reviews"
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({message: "Libro no encontrado"});
  }
});


module.exports.general = public_users;