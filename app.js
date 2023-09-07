const http = require("http");
const express = require("express");
const cors = require("cors");

// const dotenv = require("dotenv").config();
const dotenv = require("dotenv");
dotenv.config();
const morgan = require("morgan"); // morgan 모듈 추가하기

const { DataSource } = require("typeorm");

const app = express();
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

const myDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: "3306",
  username: "root",
  password: "pw",
  database: "minitest",
});

// API
const welcome = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Hello, welcome to KJ's TEST Server!!",
    });
  } catch (err) {
    console.log(err);
  }
};

const getUsers = async (req, res) => {
  try {
    const userData = await myDataSource.query(`
      SELECT id, email, password FROM users`);

    return res.status(200).json({
      users: userData,
    });
  } catch (err) {
    console.log(err);
  }
};

const createUsers = async (req, res) => {
  try {
    const { body } = req;
    const { name, email, password } = body;

    if (name === undefined || email === undefined || password === undefined) {
      const error = new Error("input error");
      error.statusCode = 400;
      throw error;
    }

    if (password < 8) {
      const error = new Error("input password is too short");
      error.statusCode = 400;
      throw error;
    }

    if (!email.includes("@") && !email.includes(".")) {
      const error = new Error("@ or . is not input in email");
      error.statusCode = 400;
      throw error;
    }

    const emailCheck = await myDataSource.query(`
        SELECT name, email, password FROM users WHERE email="${email}"
        `);

    //이메일중복  /  ID중복
    if (emailCheck.length > 0) {
      const error = new Error("already exist email");
      error.statusCode = 400;
      throw error;
    }

    const userData = await myDataSource.query(`
          INSERT INTO users(name, email, password)
          VALUES("${name}", "${email}", "${password}")
          `);

    console.log("create new user data : ", userData);

    return res.status(201).json({
      message: "user create complete!",
    });
  } catch (err) {
    console.log(err);
  }
};

// 실행
app.get("/", welcome); // 메인홈
app.get("/users", getUsers); // 유저데이터 화면
app.post("/users", createUsers); // 회원가입

// const test = myDataSource.initialize()
//     .then(() => {
//         console.log("Data Source has been initialized!")
//     })

const server = http.createServer(app);

const serverPort = 8000;

const start = async () => {
  try {
    server.listen(serverPort, () =>
      console.log(`Server is listening on ${serverPort}`)
    );
  } catch (err) {
    console.error(err);
  }
};

myDataSource.initialize().then(() => {
  console.log("Data Source has been initialized!");
});

start();
