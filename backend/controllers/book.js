const Book = require("../models/book");

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
exports.bestRating = (req, res , next) => {
  Book.find()
    .sort({ averageRating : 'desc'})
    .then((books) => res.status(200).json(books.splice(0, 3)))
    .catch((error) => res.status(400).json({error}))
}

/* Post a new book */
exports.createBook = (req, res, next) => {
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

  book.save()
      .then(() => {
          res.status(201).json({ message: "Objet enregistré !" });
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

/* Update one book datas */

/* Delete one book */
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({
                message: "Objet supprimé !",
              });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

/* Post a rating of one book */
