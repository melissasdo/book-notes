import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "0509",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// home page = read
app.get("/", async (req, res) => {});

// create
app.post("/add", async (req, res) => {});

// update
app.post("/edit", async (req, res) => {});

// delete
app.post("/delete", async (req, res) => {});
