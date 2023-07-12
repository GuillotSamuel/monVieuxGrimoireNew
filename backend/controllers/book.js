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

/* KO Get the 3 best rated books */
exports.getBestRatings = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
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

/* Delete one book */
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
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
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

/* KO Post a rating of one book */

exports.postRatingBook = (req, res, next) => {
  const url = req.url;
  const urlId = url.split("/")[1];
  const bookFilter = { _id: urlId };
  const updatedUserId = req.body.userId;
  const updatedGrade = req.body.rating;

  const updatedData = {
    userId: updatedUserId,
    grade: updatedGrade,
  };

  Book.findOne(bookFilter)
    .then((book) => {
      if (book.ratings.some((rating) => rating.userId === updatedUserId)) {
        return res.status(400).json({
          error: "The user has already rated this book",
        });
      }
      return Book.findOneAndUpdate(
        bookFilter,
        { $push: { ratings: updatedData } },
        { new: true }
      );
    })
    .then((updatedBook) => {
      const totalRatings = updatedBook.ratings.length;
      const ratingsSum = updatedBook.ratings.reduce(
        (acc, rating) => acc + rating.grade,
        0
      );
      updatedBook.averageRating = (ratingsSum / totalRatings).toFixed(0);

      return updatedBook.save();
    })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
};
