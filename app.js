



// Wishlist Feature

app.get('/wishlist/:id', (req, res) => {
  const userId = req.params.id;
  
  // Query to retrieve user information
  const userQuery = 'SELECT user_id, name FROM user WHERE user_id = ?';
  const userValues = [userId];

  connection.query(userQuery, userValues, (userErr, userResults) => {
    if (userErr) {
      console.error(userErr);
      res.send('Error retrieving user information');
      return;
    }

    // Check if user was found
    if (userResults.length === 0) {
      res.send('User not found');
      return;
    }

    const user = {
      "user_id": userResults[0].user_id,
      "name": userResults[0].name
    };

    // Query to retrieve wishlist information
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

      // Combine user and wishlist information into a single object
      const response = {
        "user": user,
        "wishlist": wishlist
      };

      res.json(response);
    });
  });
});

// wishlist feature

app.post('/wishlist/:id/create', (req, res) => {
  const userId = req.params.id;
  const wishlistName = req.body.wishlistName;

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
        "message": "Wishlist has been created",
        "wishlist_id": wishlistId,
        "wishlist_name": wishlistName,
        "user_id": userId,
      });
    });
  });
});



app.post('/wishlist/:id/add-book', (req, res) => {
  const userId = req.params.id;
  const wishlistId = req.body.wishlistId;
  const bookId = req.body.bookId;

  const selectQuery = 'SELECT * FROM wishlist WHERE wishlist_id = ? AND user_id = ?';
  const selectValues = [wishlistId, userId];

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

    const insertQuery = `INSERT INTO wishlist_book (wishlist_id, book_id) VALUES (?, ?)`;
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

        const bookInfo = {
          "book_id": bookResults[0].book_id,
          "title": bookResults[0].title,
          "author": bookResults[0].author,
          "genre": bookResults[0].genre,
          "publisher": bookResults[0].publisher,
          "price": bookResults[0].price,
        };

        res.json({
          "message": "Book has been added to wishlist",
          "wishlist_id": wishlistId,
          "book_info": bookInfo
        });
      });
    });
  });
});

app.delete('/wishlist/:id/remove-book', (req, res) => {
  const userId = req.params.id;
  const wishlistId = req.body.wishlistId;
  const bookId = req.body.bookId;

  const selectQuery = 'SELECT * FROM wishlist WHERE wishlist_id = ? AND user_id = ?';
  const selectValues = [wishlistId, userId];

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

    const deleteQuery = `DELETE FROM wishlist_book WHERE wishlist_id = ? AND book_id = ?`;
    const deleteValues = [wishlistId, bookId];

    connection.query(deleteQuery, deleteValues, (err, deleteResults) => {
      if (err) {
        console.error(err);
        res.send('Error removing book from wishlist');
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

        const bookInfo = {
          "book_id": bookResults[0].book_id,
          "title": bookResults[0].title,
          "author": bookResults[0].author,
          "genre": bookResults[0].genre,
          "publisher": bookResults[0].publisher,
          "price": bookResults[0].price,
        };

        const insertQuery = `INSERT INTO shopping_cart (user_id, book_id) VALUES (?, ?)`;
        const insertValues = [userId, bookId];

        connection.query(insertQuery, insertValues, (err, insertResults) => {
          if (err) {
            console.error(err);
            res.send('Error adding book to shopping cart');
            return;
          }

          res.json({
            "message": "Book has been removed from wishlist and added to shopping cart",
            "wishlist_id": wishlistId,
            "book_info": bookInfo
          });
        });
      });
    });
  });
});

app.get('/wishlist/:id/list-books', (req, res) => {
  const userId = req.params.id;
  const wishlistId = req.query.wishlistId;

  const selectQuery = `
    SELECT b.book_id, b.book_title, b.author, b.price
    FROM book b
    JOIN wishlist_book wb ON b.book_id = wb.book_id
    WHERE wb.wishlist_id = ? AND wb.user_id = ?
  `;
  const selectValues = [wishlistId, userId];

  connection.query(selectQuery, selectValues, (err, results) => {
    if (err) {
      console.error(err);
      res.send('Error retrieving books from wishlist');
      return;
    }

    res.json(results);
  });
});
  
  // cart feature



// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
