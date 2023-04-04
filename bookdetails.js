const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'jc2123',
  database: 'group5'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Body Parser Middleware
app.use(bodyParser.json());

// Routes
app.get('/books_and_authors', (req, res) => {
  const query = 'SELECT * FROM group5.books_and_authors WHERE ISBN = "978-0-679-72020-1"';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get('/books/:id', (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM book WHERE book_id = ${id}`;
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

app.get('/publishers', (req, res) => {
  const query = 'SELECT * FROM publisher';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get('/publishers/:id', (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM publisher WHERE publisher_id = ${id}`;
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

app.get('/ratings', (req, res) => {
  const query = 'SELECT * FROM rating';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get('/ratings/:id', (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM rating WHERE rating_id = ${id}`;
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

app.get('/sales', (req, res) => {
  const query = 'SELECT * FROM sale';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get('/sales/:id', (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM sale WHERE sale_id = ${id}`;
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

app.get('/getListOfTopSellers', (req, res) => {
  const query = 'select a.title, count(a.book_id) from book a, sale b where a.book_id = b.book_id group by a.book_id order by count(a.book_id) desc';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get('/getBooksByGenre', (req, res) => {
  const genre = req.query.genre;
  let query = 'SELECT * FROM book ';
  if (genre) {
    query += `WHERE genre = '${genre}'`;
  }
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get('/getBooksByRating', (req, res) => {
  const rating = req.query.rating;
  let query = 'select title, avg(rating) from book a, rating b where a.book_id = b.book_id ';
  if (rating) {
    query += `group by a.title having avg(rating) >= '${rating}' `;
    query += `order by avg(b.rating) desc`;
  }
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.put('/updateDiscountBooksByPublisher', (req, res) => {
  const publisher = req.body.publisher;
  const discountPrice = req.body.discountPrice;
  const query = `
    UPDATE book SET price = price * (${discountPrice}/100) 
    WHERE book_id IN (SELECT book_id FROM publisher WHERE name = '${publisher}')
  `;
  connection.query(query, (err, result) => {
    if (err) throw err;
    console.log('Updated book price successfully!');
    res.send('Updated book price successfully!');
  });
});

  app.get('/getBooksByISBN', (req, res) => {
    const genre = req.query.genre;
    let query = 'SELECT * FROM group5.books_and_authors ';
    if (genre) {
      query += `WHERE ISBN = '${book_id}'`;
    }
    connection.query(query, (err, results) => {
      if (err) throw err;
      res.send(results);
    });
  });
// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
