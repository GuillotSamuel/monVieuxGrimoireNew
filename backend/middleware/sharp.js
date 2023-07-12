const sharp = require('sharp');
const fs = require('fs').promises;

module.exports = async (req, res, next) => {
  if (req.file) {
    try {
        const newFilename = `${req.file.filename}.webp`;
      const newPath = `${req.file.destination}/processed_${newFilename}`;

      await sharp(`${req.file.destination}/${req.file.filename}`)
        .webp({ quality: 60, force: true })
        .toFile(newPath);

      await fs.unlink(`${req.file.destination}/${req.file.filename}`);

      console.log('Image resized by Sharp');
    } catch (error) {
      console.error('Error resizing image:', error);
    }
  }

  next();
};