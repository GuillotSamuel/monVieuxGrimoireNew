const express = require("express");
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const booksCtrl = require("../controllers/book");

router.get("/api/books/", booksCtrl.getAllBooks); // Get all books
router.get("/api/books/:id", booksCtrl.getOneBook); // Get one book based on its id
router.get("/api/books/bestrating", booksCtrl.bestRating); // Get the 3 best rated books
/*router.post("/api/books/", auth, multer, sharpMiddleware, booksCtrl.createBook); */ // Post a new book
/*router.put("/api/books/:id", auth, multer, sharpMiddleware, booksCtrl.modifyBook); // Update one book datas
router.delete("/api/books/:id", auth, booksCtrl.deleteBook); // Delete one book
router.post("/api/books/:id/rating", auth, booksCtrl.ratingBook); // Post a rating of one book */

module.exports = router;
