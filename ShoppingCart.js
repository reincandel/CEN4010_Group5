const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Golondrinas_1',
  database: 'books'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});


// Routes
app.get('/books', (req, res) => {
  const query = 'SELECT * FROM books.shopping_cart';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Body Parser Middleware
app.use(bodyParser.json());

//Retrieving the subtotal price of all users shopping cart (Example)
app.get('/shoppingcart', (req, res) => {
  const query = `SELECT DISTINCT user_id, book_subtotal FROM shopping_cart`;
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

//Retrieve the subtotal price of all items in the user’s shopping cart.
app.get('/shoppingcart/subtotal/:id', (req, res) => {
  const id = req.params.id
  const query = ` SELECT user_id, ROUND(SUM(book_subtotal), 2) AS total_book_subtotal FROM shopping_cart WHERE user_id = "${id}" `;
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

//Add a book to the shopping cart
app.post('/shoppingcart', (req, res) => {
  const { user_id, book_id, book_name, book_subtotal } = req.body;
  const userId = parseInt(user_id);
  const bookId = parseInt(book_id);
  const sanitizedBookName = connection.escape(book_name);
  const sanitizedBookSubtotal = parseFloat(book_subtotal);
  const query = `INSERT INTO SHOPPING_CART (user_id, book_id, book_name, book_subtotal) VALUES (?, ?, ?, ?)`;
  const values = [userId, bookId, sanitizedBookName, sanitizedBookSubtotal];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.send(result);
    }
  });
});

//Retrieve the list of book(s) in the user’s shopping cart
app.get('/shoppingcart/:id', (req, res) => {
  const id = req.params.id
  const query = ` SELECT book_name from shopping_cart WHERE user_id = "${id}" `;
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

//Delete a book from the shopping cart instance for that user.
app.delete('/shoppingcart', (req, res) => {
  const { user_id, book_id } = req.body;
  const userId = parseInt(user_id);
  const bookId = parseInt(book_id);
  const query = `DELETE FROM shopping_cart WHERE user_id = ? AND book_id = ? LIMIT 1`;
  const values = [userId, bookId];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      if (result.affectedRows > 0) {
        res.send("Book deleted successfully");
      } else {
        res.send("No matching book found for deletion");
      }
    }
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});