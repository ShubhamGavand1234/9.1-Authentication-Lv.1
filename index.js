import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  password: "admin",
  host: "localhost",
  database: "authentication",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  try {
    const email = req.body.username;
    const password = req.body.password;

    const checkResult = await db.query(
      "select id from users where email = $1 and password = $2;",
      [email, password]
    );

    if (checkResult.rows.length > 0) {
      console.log("user already exist");
      res.redirect("/register");
    } else {
      await db.query("insert into users (email, password) values ($1, $2);", [
        email,
        password,
      ]);

      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("select * from users where email = $1 ", [
      email,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      if (storedPassword === password) {
        res.render("secrets.ejs");
      } else {
        res.send("incorrect Password");
      }
    } else {
      res.send("user not found");
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
