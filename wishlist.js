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

// TEST TO GET USER INFORMATION

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





// TEST TO GET USER WISHLIST NAME AND ID

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
          "Wishlist ID": result.wishlist_id,
          "Wishlist Name": result.wishlist_name
        };
      });

      const response = {
        "User ID": user,
        "Wishlist": wishlist
      };

      res.json(response);
    });
  });
});



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

// ADD BOOK TO WISHLIST ID BY WISHLIST ID

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

// ADD BOOK TO WISHLIST ID BY WISHLIST/BOOK NAME

app.post('/wishlist/add-book-name', (req, res) => {
  const wishlistName = req.body.wishlist_name;
  const selectQuery = 'SELECT * FROM wishlist WHERE wishlist_name = ?';
  const selectValues = [wishlistName];

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

    const bookName = req.body.title;

    const checkQuery = 'SELECT * FROM wishlistBooks WHERE wishlist_id = ? AND book_id = ?';
    const checkValues = [wishlistName, bookName];

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
    const insertValues = [wishlistName, bookName];

    connection.query(insertQuery, insertValues, (err, insertResults) => {
      if (err) {
        console.error(err);
        res.send('Error adding book to wishlist');
        return;
      }

      const bookQuery = 'SELECT * FROM books WHERE title = ?';
      const bookValues = [bookName];

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
  const wishlistId = req.body.wishlist_id;
  const bookId = req.body.book_id;

  const selectQuery = `
    SELECT * FROM wishlistBooks WHERE wishlist_id = ? AND book_id = ?
  `;
  const selectValues = [wishlistId, bookId];

  connection.query(selectQuery, selectValues, (err, results) => {
    if (err) {
      console.error(err);
      res.send('Error checking if book is in wishlist');
      return;
    }

    if (results.length === 0) {
      res.send('Book is not in wishlist');
      return;
    }

    const deleteQuery = 'DELETE FROM wishlistBooks WHERE wishlist_id = ? AND book_id = ?';
    const deleteValues = [wishlistId, bookId];

    connection.query(deleteQuery, deleteValues, (err, results) => {
      if (err) {
        console.error(err);
        res.send('Error removing book from wishlist');
        return;
      }

      const getUserQuery = 'SELECT user_id FROM wishlist WHERE wishlist_id = ?';
      const getUserValues = [wishlistId];

      connection.query(getUserQuery, getUserValues, (err, getUserResults) => {
        if (err) {
          console.error(err);
          res.send('Error retrieving user ID from wishlist');
          return;
        }

        const userId = getUserResults[0].user_id;

        const insertQuery = `
          INSERT INTO ShoppingCart (user_id, book_id, book_name, book_price)
          SELECT ?, ?, title, price
          FROM Books
          WHERE book_id = ?
        `;
        const insertValues = [userId, bookId, bookId];

        connection.query(insertQuery, insertValues, (err, results) => {
          if (err) {
            console.error(err);
            res.send('Error adding book to shopping cart');
            return;
          }

          res.send(
            /* TEST IF BOOK WAS REMOVED AND ADDED TO SHOPPING CART
            'Book removed from wishlist and added to shopping cart'
            */
            );
        });
      });
    });
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
        "Book ID": book.book_id,
        "Title": book.title,
        "Author": book.author,
        "Genre": book.genre,
        "ISBN": book.ISBN,
        "Publisher": book.publisher,
        "Price": book.price
      };
    });

    const selectWishlistQuery = 'SELECT wishlist_name FROM wishlist WHERE wishlist_id = ?';
    const selectWishlistValues = [wishlistId];

    connection.query(selectWishlistQuery, selectWishlistValues, (err, results) => {
      if (err) {
        console.error(err);
        res.send('Error retrieving wishlist name');
        return;
      }

      const wishlistName = results[0].wishlist_name;

  
    res.json({
      "Wishlist ID": wishlistId,
      "Wishlist Name": wishlistName,
      "Books": bookArray
    });
    });
  });
});

// TEST SHOPPING CART ADDED BOOK BY USER
app.get('/wishlist/ShoppingCart', (req, res) => {
  const userId = req.body.user_id;
  const query = 'SELECT cart_id, user_id, book_id, book_name, book_price FROM ShoppingCart WHERE user_id = ?';
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

    const cartArray = [];

      results.forEach((result) => {
        const book = {
        "Book ID": result.book_id,
        "Book": result.book_name,
        "Price": result.book_price
        };
      cartArray.push(book);
      });

    res.json({
      "User": userId,
      "Books": cartArray
    });
  });
});


// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});