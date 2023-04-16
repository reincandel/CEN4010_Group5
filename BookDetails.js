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

app.get('/books_and_authors', (req, res) => {   
  const query = 'SELECT * FROM books_and_authors';   
  connection.query(query, (err, results) => {if (err) throw err; res.send(results);});
}); 

app.get('/books_and_authors/author', (req, res) => {
  const author = req.body.Author;

  const bookQuery = 'SELECT * FROM books_and_authors WHERE author = ?';
  const bookValues = [author];

  connection.query(bookQuery, bookValues, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving book information');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('WHAT THE FUCK DID YOU DO??');
      return;
    }

    res.json(results[0]);
  });
});

app.get('/books_and_authors/isbn', (req, res) => {
  const isbn = req.body.ISBN;

  const bookQuery = 'SELECT * FROM books_and_authors WHERE isbn = ?';
  const bookValues = [isbn];

  connection.query(bookQuery, bookValues, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving book information');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('Book not found');
      return;
    }

    res.json(results[0]);
  });
});

app.post('/books_and_authors/', (req, res) => {
  const ISBN = req.body.ISBN;
  const bookName = req.body.name;
  const bookDescription = req.body.description;
  const bookPrice = req.body.price;
  const bookAuthor = req.body.author;
  const bookGenre = req.body.genre;
  const bookPublisher = req.body.publisher;
  const bookPublished = req.body.year_published;
  const bookSold = req.body.copies_sold;

    const insertQuery = 'INSERT INTO books_and_authors (ISBN, name, description, price, author, genre, publisher, year_published, copies_sold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const insertValues = [ISBN, bookName, bookDescription, bookPrice, bookAuthor, bookGenre, bookPublisher, bookPublished, bookSold];



    /*
    connection.query(insertQuery, insertValues, (err, insertResults) => {
      if (err) {
        console.error(err);
        res.send('Error adding book to system');
        return;
      }
      */

      connection.query(insertQuery, insertValues, (err, bookResults) => {
        if (err) {
          console.error(err);
          res.send('Error retrieving book information');
          return;
        }

       res.json({
        });

        return;

        });
});



app.post('/author_creation/', (req, res) => {
  const authorFirstName = req.body.author_first;
  const authorLastName = req.body.author_last;
  const authorBio = req.body.author_bio;
  const authorPublisher = req.body.author_publisher;

    const insertQuery = 'INSERT INTO author_creation (author_first, author_last, author_bio, author_publisher) VALUES (?, ?, ?, ?)';
    const insertValues = [authorFirstName, authorLastName, authorBio, authorPublisher];
      

      connection.query(insertQuery, insertValues, (err, insertResults) => {
        if (err) {
          console.error(err);
          res.send('Error inserting author information');
          return;
        }
      
        res.json({
        });
      
        return;
      
      });
});

// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
