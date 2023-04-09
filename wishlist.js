const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.json());

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'GhostFace',
  database: 'Group5'
});

connection.connect((err) => {
  if (err) throw err;

  console.log('Connected to MySQL database');
});

// Routes
 app.get('/books', (req, res) => {
  const query = 'SELECT * FROM books';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

/* TEST TO GET USER INFORMATION

app.get('/user', (req, res) => {
  const userId = req.query.id;
  const query = 'SELECT name, email, address FROM user WHERE user_id = ?';
  const values = [userId];

  // Execute SQL query to retrieve user's information
  connection.query(query, values, (error, results) => {
    if (error)  {
      console.error(error);
    res.send('Error retrieving user information');
      return;
    }
    
    // Check if user was found
    if (results.length === 0) {
      res.send('User not found');
      return;
    }

    const user = {
      "user_id": userId,
      "name": results[0].name,
      "email": results[0].email,
      "address": results[0].address
    };

    res.json(user);
  });
});

*/



/* TEST TO GET USER WISHLIST NAME AND ID

app.get('/wishlist/users', (req, res) => {
  const userId = req.body.user_id;
  
  const userQuery = 'SELECT user_id, name FROM user WHERE user_id = ?';
  const userValues = [userId];

  connection.query(userQuery, userValues, (userErr, userResults) => {
    if (userErr) {
      console.error(userErr);
      res.send('Error retrieving user information');
      return;
    }

    if (userResults.length === 0) {
      res.send('User not found');
      return;
    }

    const user = {
      "user_id": userResults[0].user_id,
      "name": userResults[0].name
    };

    const wishlist = 'SELECT wishlist_id, wishlist_name FROM wishlist WHERE user_id = ?';
    const wishlistValues = [userId];

    connection.query(wishlist, wishlistValues, (err, wishlistResults) => {
      if (err) {
        console.error(err);
        res.send('Error retrieving wishlist information');
        return;
      }

      const wishlist = wishlistResults.map(result => {
        return {
          "wishlist_id": result.wishlist_id,
          "wishlist_name": result.wishlist_name
        };
      });

      const response = {
        "user": user,
        "wishlist": wishlist
      };

      res.json(response);
    });
  });
});

*/

// CREATE WISHLIST

app.post('/wishlist/list', (req, res) => {
  const userId = req.body.user_id;
  const wishlistName = req.body.wishlist_name;
  const selectQuery = 'SELECT * FROM wishlist WHERE wishlist_name = ? AND user_id = ?';
  const selectValues = [wishlistName, userId];

  connection.query(selectQuery, selectValues, (err, results) => {
    if (err) {
      console.error(err);
      res.send('Error retrieving wishlist information');
      return;
    }

    if (results.length > 0) {
      res.send('Wishlist name already exists');
      return;
    }

    
    const insertQuery = `INSERT INTO wishlist (wishlist_name, user_id) VALUES (?, ?)`;
    const insertValues = [wishlistName, userId];

    connection.query(insertQuery, insertValues, (err, insertResults) => {
      if (err) {
        console.error(err);
        res.send('Error creating wishlist');
        return;
       }

      const wishlistId = insertResults.insertId;
      
      res.json({
        /* TEST TO SEE IF WISHLIST WAS CREATED
        "message": "Wishlist has been created",
        "wishlist_id": wishlistId,
        "wishlist_name": wishlistName,
        "user_id": userId,
        */
      });
     });
  }); 
}); 

// ADD BOOK TO WISHLIST ID

app.post('/wishlist/add-book', (req, res) => {
  const wishlistId = req.body.wishlist_id;
  const selectQuery = 'SELECT * FROM wishlist WHERE wishlist_id = ?';
  const selectValues = [wishlistId];

  connection.query(selectQuery, selectValues, (err, results) => {
    if (err) {
      console.error(err);
      res.send('Error retrieving wishlist information');
      return;
    }

    if (results.length === 0) {
      res.send('Wishlist not found');
      return;
    }

    const bookId = req.body.book_id;

    const checkQuery = 'SELECT * FROM wishlistBooks WHERE wishlist_id = ? AND book_id = ?';
    const checkValues = [wishlistId, bookId];

    connection.query(checkQuery, checkValues, (err, checkResults) => {
      if (err) {
        console.error(err);
        res.send('Error checking if book exists in wishlist');
        return;
      }

      if (checkResults.length > 0) {
        res.send('Book already in wishlist');
        return;
      }

    const insertQuery = `INSERT INTO wishlistBooks (wishlist_id, book_id) VALUES (?, ?)`;
    const insertValues = [wishlistId, bookId];

    connection.query(insertQuery, insertValues, (err, insertResults) => {
      if (err) {
        console.error(err);
        res.send('Error adding book to wishlist');
        return;
      }

      const bookQuery = 'SELECT * FROM books WHERE book_id = ?';
      const bookValues = [bookId];

      connection.query(bookQuery, bookValues, (err, bookResults) => {
        if (err) {
          console.error(err);
          res.send('Error retrieving book information');
          return;
        }

       res.json({
          /* TEST TO CHECK IF BOOK WAS ADDED O WISHLIST
          "message": "Book has been added to wishlist",
          "wishlist_id": wishlistId,
          "book_info": bookInfo
          */
        });

        return;

        });
      });
    });
  });
});

// DELETE BOOK FROM WISHLIST AND ADD TO CART

app.delete('/wishlist/remove-book/', (req, res) => {
  //const userId = req.body.user_id;
  const wishlistId = req.body.wishlist_id;
  const bookId = req.body.book_id;

  const deleteQuery = 'DELETE FROM wishlistBooks WHERE wishlist_id = ? AND book_id = ?';
  const deleteValues = [wishlistId, bookId];

  connection.query(deleteQuery, deleteValues, (err, results) => {
    if (err) {
      console.error(err);
      res.send('Error removing book from wishlist');
      return;
    }

    res.send
    /* TEST TO SEE IF BOOK WAS REMOVED AND ADDED TO SHOPPING CART
    ('Book removed from wishlist and added to shopping cart'); 
    */
  });
});


// GET LIST OF BOOKS IN WISHLIST BY WISHLIST ID

app.get('/wishlist/books', (req, res) => {
  
  const wishlistId = req.body.wishlist_id;

  const selectQuery = `
    SELECT books.book_id, title, author, genre, ISBN, publisher, price
    FROM books 
    JOIN wishlistBooks ON books.book_id = wishlistBooks.book_id
    WHERE wishlist_id = ? 
   
  `;
  const selectValues = [wishlistId];

  connection.query(selectQuery, selectValues, (err, results) => {
    if (err) {
      console.error(err);
      res.send('Error retrieving books from wishlist');
      return;
    }

    const bookArray = results.map(book => {
      return {
        "book_id": book.book_id,
        "title": book.title,
        "author": book.author,
        "genre": book.genre,
        "ISBN": book.ISBN,
        "publisher": book.publisher,
        "price": book.price
      };
    });
  
    res.json({
      "wishlist_id": wishlistId,
      "books": bookArray
    });
  });
});


// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});