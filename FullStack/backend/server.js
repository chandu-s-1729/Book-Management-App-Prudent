const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");

const isDateValid = require("date-fns/isValid");
var parseISO = require("date-fns/parseISO");

const app = express();
app.use(express.json());
app.use(cors());

const path = require("path");
const dbPath = path.join(__dirname, "./booksdata.db");

let db = null;

const initializeDBAndServer = async (request, response) => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

module.exports = app;

// API 1 - GET List of all Books Details from books table
app.get("/books/", async (request, response) => {
  const allBooksQuery = `
        SELECT 
            *
        FROM 
            books;
    `;

  const allBooksDetails = await db.all(allBooksQuery);
  response.send(allBooksDetails);
});

// API 2 - POST Add a new book.
app.post("/books/", async (request, response) => {
  // const { username } = request;
  const { title, authorId, genreId, pages, publishedDate } = request.body;
  // const userIdQuery = `SELECT user_id AS userId FROM user WHERE username = '${username}';`;
  // const { userId } = await db.get(userIdQuery);

  const date = new Date(publishedDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const postBookQuery = `
        INSERT INTO
            books (title, author_id, genre_id, pages, published_date)
        VALUES
        (
            '${title}',
             ${authorId},
             ${genreId},
             ${pages},
            '${year}-${month}-${day}'
        );
    `;

  await db.run(postBookQuery);
  response.send("Successfully Added a Book in books table");
});

//API 3 - PUT Update an existing book.
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  let updatingColumn = "";
  let invalidProperty = undefined;

  const bookDetails = request.body;

  //   switch (true) {
  //     case bookDetails.title !== undefined:
  //       updatingColumn = "Title";
  //       break;
  // case bookDetails.authorId !== undefined:
  //     if (isAuthorIdValid(request.body) === true){
  //         updatingColumn = "AuthorId";
  //     } else {
  //         invalidProperty = "Book AuthorId";
  //     }
  //     break;
  // case bookDetails.genreId !== undefined:
  //     if (isGenreIdValid(request.body) === true) {
  //         updatingColumn = "GenreId";
  //     } else {
  //         invalidProperty = "Book GenreId";
  //     }
  //     break;
  //     case bookDetails.pages !== undefined:
  //       updatingColumn = "Pages";
  //       break;
  //     case bookDetails.publishedDate !== undefined:
  //       if (isDateValid(parseISO(todoDetails.publishedDate)) === true) {
  //         updatingColumn = "Published Date";
  //       } else {
  //         invalidProperty = "Book Due Date";
  //       }
  //       break;
  //   }

  const previousBookQuery = `
        SELECT
            *
        FROM 
            books
        WHERE 
            book_id = ${bookId};`;

  const previousBook = await db.get(previousBookQuery);

  const {
    title = previousBook.title,
    authorId = previousBook.author_id,
    genreId = previousBook.genre_id,
    pages = previousBook.pages,
    publishedDate = previousBook.published_date,
  } = request.body;

  const updateBookQuery = `
        UPDATE 
            books 
        SET
            title = '${title}',
            author_id = '${authorId}',
            genre_id = '${genreId}',
            pages = '${pages}',
            published_id = '${publishedDate}'
        WHERE 
            id = ${bookId};`;

  if (invalidProperty === undefined) {
    await db.run(updateBookQuery);
    response.send(`${updatingColumn} Updated`);
  } else {
    response.status(400);
    response.send(`Invalid ${invalidProperty}`);
  }
});

// API - 4 DELETE Delete a book
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  const deleteBookQuery = `
        DELETE FROM 
            books 
        WHERE
            book_id = ${bookId};`;

  await db.run(deleteBookQuery);
  response.send("A Book Deleted");
});
