const multer = require('multer');
const maxSize = 10 * 1014 * 1024; //10mo

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

const fileFilter = (req, file, callback) => {
    if (file.size > maxSize) {
      callback(new Error('The file size must be less than 10MB.'));
    } else {
      callback(null, true);
    }
  };

module.exports = multer({storage: storage, fileFilter: fileFilter}).single('image');