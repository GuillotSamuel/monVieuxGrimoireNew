const Book = require("../models/book");
const fs = require("fs");
const sharp = require("sharp");

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

  const imagePath = req.file ? req.file.path : null;

  sharp(imagePath)
    .resize({ width: 206, height: 260 })
    .toFormat("webp")
    .toFile(imagePath.replace(/\.[^/.]+$/, ".webp"), (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Failed to convert the image to WebP" });
      }

      bookObject.imageUrl = req.file
        ? `${req.protocol}://${req.get(
            "host"
          )}/images/${req.file.filename.replace(/\.[^/.]+$/, ".webp")}`
        : null;

      if (req.file) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ error: "Failed to delete the existing image" });
          }

          saveBook();
        });
      } else {
        saveBook();
      }
    });

  function saveBook() {
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
    });

    book
      .save()
      .then(() => {
        res.status(201).json({ message: "New book saved" });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  }
};

/* Update one book datas */

exports.modifyBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.userId.toString() !== req.auth.userId) {
      return res.status(403).json({
        message: "User not authorized to modify books created by others",
      });
    }

    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };
    delete bookObject._userId;

    const existingImageFilename = book.imageUrl.split("/images/")[1];
    if (req.file) {
      fs.unlink(`images/${existingImageFilename}`, (err) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ error: "Failed to delete the existing image" });
        }
      });
    }

    const imagePath = req.file ? req.file.path : null;

    await sharp(imagePath)
      .resize({ width: 206, height: 260 })
      .toFormat("webp")
      .toFile(imagePath.replace(/\.[^/.]+$/, ".webp"));

    bookObject.imageUrl = req.file
      ? `${req.protocol}://${req.get(
          "host"
        )}/images/${req.file.filename.replace(/\.[^/.]+$/, ".webp")}`
      : null;

    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id }
    );

    if (req.file) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ error: "Failed to delete the existing image" });
        }

        res.status(200).json({ message: "Book modified!" });
      });
    } else {
      res.status(200).json({ message: "Book modified!" });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
};

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
