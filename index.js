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

// home page = read
app.get("/", async (req, res) => {
  const greeting = timeOfDay();

  const result = await db.query("SELECT * FROM books ORDER BY date_read ASC");

  res.render("index.ejs", {
    timeOfDay: greeting,
    listOfBooks: result.rows,
  });
});

// create
app.post("/add", async (req, res) => {});

// update
app.post("/edit", async (req, res) => {});

// delete
app.post("/delete", async (req, res) => {});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
