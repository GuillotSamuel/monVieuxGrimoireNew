const Book = require("../models/book");
const fs = require("fs");

/* Get all books */
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

/* Get one Book */
exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
    });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

/* Get the 3 best rated books */
exports.getBestRatings = async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ averageRating: -1 })
      .limit(3)
      .then((books) => res.status(200).json(books))
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

/* Post a new book */
exports.postBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: req.file
      ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
      : null,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "New book saved" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

/* KO Update one book datas */

/* exports.modifyBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (book.userId !== req.auth.userId) {
      return res
        .status(403)
        .json({
          message: "User not authorized to modify books created by others",
        });
    }
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
}; */

/* Delete one book */
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const filename = book.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, (error) => {
      if (error) {
        return res.status(500).json({ error });
      }

      Book.deleteOne({ _id: req.params.id })
        .then(() => {
          res.status(200).json({
            message: "Book deleted",
          });
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

/* Post a rating of one book */

exports.postRatingBook = async (req, res, next) => {
  try {
    if (req.body.rating >= 0 && req.body.rating <= 5) {
      const newRating = {
        userId: req.body.userId,
        grade: req.body.rating,
      };

      const book = await Book.findOne({ _id: req.params.id });

      if (book.ratings.includes(req.body.userId)) {
        return res.status(400).json({
          message: "The user has already rated this book.",
        });
      }

      book.ratings.push(newRating);
      const gradeArray = book.ratings.map((grade) => grade.grade);
      const sum = gradeArray.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
      const averageRating = sum / gradeArray.length;
      book.averageRating = Math.round(averageRating);

      await book.save();

      return res.status(201).json(book);
    } else {
      return res
        .status(400)
        .json({ message: "Invalid rating. Rating must be between 0 and 5." });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
};
