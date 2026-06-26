const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Verifica si el nombre de usuario ya está registrado
const isValid = (username)=>{ 
  let userswithsamename = users.filter((user) => user.username === username);
  return userswithsamename.length > 0;
}

// Verifica si el usuario y la contraseña coinciden con los registros
const authenticatedUser = (username,password)=>{ 
  let validusers = users.filter((user) => user.username === username && user.password === password);
  return validusers.length > 0;
}

// Iniciar sesión de usuario registrado
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Faltan credenciales de acceso."});
  }

  if (authenticatedUser(username, password)) {
    // Genera el token JWT firmado con una clave secreta (ej. "access")
    let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });

    // Almacena el token y el nombre de usuario en la sesión del servidor
    req.session.authorization = {
      accessToken, username
    }
    
    return res.status(200).json({message: "Usuario inició sesión exitosamente."});
  } else {
    return res.status(208).json({message: "Inicio de sesión inválido. Verifica tu usuario y contraseña."});
  }
});

// Agregar o modificar la reseña de un libro
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Se obtiene como query parameter (?review=...)
  const username = req.session.authorization ? req.session.authorization['username'] : null;

  if (!username) {
    return res.status(403).json({message: "Usuario no autenticado."});
  }

  if (!review) {
    return res.status(400).json({message: "Por favor, proporciona el texto de la reseña."});
  }

  if (books[isbn]) {
    // Usa el nombre de usuario de la sesión como clave dentro del objeto de reseñas
    books[isbn].reviews[username] = review;
    return res.status(200).json({
      message: `La reseña del usuario '${username}' para el libro con ISBN ${isbn} ha sido guardada/actualizada.`
    });
  } else {
    return res.status(404).json({message: "Libro no encontrado."});
  }
});

// Eliminar la reseña de un libro
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization ? req.session.authorization['username'] : null;

  if (!username) {
    return res.status(403).json({message: "Usuario no autenticado."});
  }

  if (books[isbn]) {
    // Verifica si existe una reseña que pertenezca estrictamente al usuario de la sesión
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username]; // Elimina la propiedad del objeto
      return res.status(200).json({
        message: `La reseña del usuario '${username}' para el libro con ISBN ${isbn} fue eliminada.`
      });
    } else {
      return res.status(404).json({message: "No tienes ninguna reseña publicada para este libro."});
    }
  } else {
    return res.status(404).json({message: "Libro no encontrado."});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;