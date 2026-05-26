const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Usuário padrão do XAMPP
  password: '', // Senha padrão do XAMPP geralmente é vazia
  database: 'redesocial',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
