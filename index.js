import express from "express"; // Import express to use it in the app
import ejs from "ejs"; // Import ejs to render HTML templates
import bodyParser from "body-parser"; // Import body-parser to parse incoming request
import pg from "pg"; // Import pg to interact with PostgreSQL database

const app = express(); // Create an instance of express
const port = 3000; // Define the port on which the server will listen

const db = new pg.Client({
  // Create a new PostgreSQL client
  // Connection configuration, change to your own database credentials
  user: "postgres",
  host: "localhost",
  database: "book_notes",
  password: "0509",
  port: 5432,
});
db.connect(); // Connect to the PostgreSQL database

app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser middleware to parse URL-encoded data
app.use(express.static("public")); // Serve static files from the "public" directory so they can be accessed in the browser

// This function takes a number and returns it as a string with leading zero if it's less than 10, used for time formatting
function formatTime(number) {
  return number < 10 ? "0" + number : number;
}

// This returns a greeting based on the current time of day, great way to personalise the user experience
function timeOfDay() {
  const now = new Date();
  const hours = formatTime(now.getHours());

  if (hours >= 5 && hours < 12) return "morning 🌅";
  if (hours >= 12 && hours < 18) return "afternoon ☀️";
  if (hours >= 18 && hours < 23) return "evening 🌤️";
  return "night 🌙";
}

// Returns the current date in YYYY-MM-DD format, useful for displaying the date when a book was read
function currentDay() {
  const year = String(formatTime(new Date().getFullYear()));
  const month = String(formatTime(new Date().getMonth() + 1));
  const day = formatTime(new Date().getDate());

  return `${year}-${month}-${day}`;
}

// home page = read
app.get("/", async (req, res) => {
  const greeting = timeOfDay(); // Get the current time of day for greeting
  const day = currentDay(); // Get the current date

  const result = await db.query("SELECT * FROM books ORDER BY date_read ASC"); // Query the database to get all books ordered by the date read

  // Render the index.ejs template with the list of books and, current date and greeting
  res.render("index.ejs", {
    timeOfDay: greeting,
    listOfBooks: result.rows,
    today: day,
  });
});

// create
app.post("/add", async (req, res) => {
  // This is the data that will be inserted into the database according to the form in the index.ejs file
  const title = req.body.title;
  const rating = req.body.rating;
  const notes = req.body.notes;
  const author = req.body.author;
  const date_read = req.body.date_read;

  try {
    // Try to insert the new entry into the database. All the fields are required but the 'notes', so if any of them is empty, it will throw an error.
    await db.query(
      "INSERT INTO books (title, rating, notes, author, date_read) VALUES ($1, $2, $3, $4, $5)",
      [title, rating, notes, author, date_read]
    );
    res.redirect("/");
  } catch (err) {
    // If there is an error, log it to the console and send a 500 status code with an error message
    console.log(err);
    res.status(500).send("Error adding item");
    return;
  }
});

// update
app.post("/edit", async (req, res) => {
  // This is the data that will be updated in the database according to the form in the index.ejs file. The id is the primary key of the book that will be updated, and the rest are the fields that will be updated
  const id = req.body.updatedBookId;
  const fields = {
    title: req.body.updatedBookTitle,
    author: req.body.updatedBookAuthor,
    rating: req.body.updatedBookRating,
    notes: req.body.updatedBookNotes,
    date_read: req.body.updatedBookdate_read,
  };

  try {
    // This filters only fields that are not null/undefined
    const keysToUpdate = Object.keys(fields).filter(
      (key) => fields[key] !== undefined && fields[key] !== ""
    );

    if (keysToUpdate.length === 0) {
      return res.redirect("/"); // nothing to update
    }

    // Build SET clause dynamically
    const setClause = keysToUpdate
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");
    const values = keysToUpdate.map((key) => fields[key]);

    // Add id at the end for the WHERE clause
    values.push(id);

    const query = `UPDATE books SET ${setClause} WHERE id = $${values.length}`;
    await db.query(query, values);

    res.redirect("/");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error editing item");
  }
});

// delete
app.post("/delete", async (req, res) => {
  // More straightforward, this is the id of the book that will be deleted from the database (primary key)
  const id = req.body.deleteBookId;

  try {
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.send("Error deleting item");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
