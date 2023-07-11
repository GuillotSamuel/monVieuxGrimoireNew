const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");
mongoose.set("strictQuery", false);
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Book = require("./models/book");
const User = require("./models/user");
const CONNECTION = process.env.MONGODB_CONNECTION;

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* MongoDB Atlas Connection */
mongoose
  .connect(CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connection succeeded");
  })
  .catch(() => console.log("MongoDB connection failed"));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

/* Middleware CORS */
app.use(cors());

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
});

/* Routes configurations */
app.use("/", bookRoutes);
app.use("/", authLimiter, userRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
