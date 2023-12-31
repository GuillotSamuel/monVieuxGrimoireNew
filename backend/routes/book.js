const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const booksCtrl = require("../controllers/book");

router.get("/api/books/", booksCtrl.getAllBooks); // Get all books
router.get("/api/books/bestrating", booksCtrl.getBestRatings); // Get the 3 best rated books
router.get("/api/books/:id", booksCtrl.getOneBook); // Get one book based on its id
router.post("/api/books/", auth, multer, booksCtrl.postBook); // Post a new book
router.put("/api/books/:id", auth, multer, booksCtrl.modifyBook); // Update one book datas
router.delete("/api/books/:id", auth, booksCtrl.deleteBook); // Delete one book
router.post("/api/books/:id/rating", auth, booksCtrl.postRatingBook); // Post a rating of one book

module.exports = router;
