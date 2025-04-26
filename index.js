import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { time } from "console";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book_notes",
  password: "0509",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

function formatTime(number) {
  return number < 10 ? "0" + number : number;
}

function timeOfDay() {
  const now = new Date();
  const hours = formatTime(now.getHours());

  if (hours >= 5 && hours < 12) return "morning 🌅";
  if (hours >= 12 && hours < 18) return "afternoon ☀️";
  if (hours >= 18 && hours < 23) return "evening 🌤️";
  return "night 🌙";
}

function currentDay() {
  const year = String(formatTime(new Date().getFullYear()));
  const month = String(formatTime(new Date().getMonth() + 1));
  const day = formatTime(new Date().getDate());

  return `${year}-${month}-${day}`;
}

// home page = read
app.get("/", async (req, res) => {
  const greeting = timeOfDay();
  const day = currentDay();

  const result = await db.query("SELECT * FROM books ORDER BY date_read ASC");

  res.render("index.ejs", {
    timeOfDay: greeting,
    listOfBooks: result.rows,
    today: day,
  });
});

// create
app.post("/add", async (req, res) => {
  const title = req.body.title;
  const rating = req.body.rating;
  const notes = req.body.notes;
  const author = req.body.author;
  const date_read = req.body.date_read;

  try {
    await db.query(
      "INSERT INTO books (title, rating, notes, author, date_read) VALUES ($1, $2, $3, $4, $5)",
      [title, rating, notes, author, date_read]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding item");
    return;
  }
});

// update
app.post("/edit", async (req, res) => {
  const id = req.body.updatedBookId;
  const updatedBookTitle = req.body.updatedBookTitle;

  try {
    await db.query("UPDATE books SET title = $1 WHERE id = $2", [
      updatedBookTitle,
      id,
    ]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error editing item");
  }

  res.redirect("/");
});

// delete
app.post("/delete", async (req, res) => {});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
