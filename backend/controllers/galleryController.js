const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const Gallery = require("../models/Gallery");
const fs = require("fs");
const path = require("path");

function multerStorage(imageDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, imageDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const guid = uuidv4();
      req.photoId = guid;
      cb(null, `${guid}${ext}`);
    },
  });
}

function rotateImage(orientation, transformer) {
  switch (orientation) {
    case 3:
      transformer = transformer.rotate(180);
      break;
    case 6:
      transformer = transformer.rotate(90);
      break;
    case 8:
      transformer = transformer.rotate(-90);
      break;
    default:
      transformer = transformer.rotate();
      break;
  }
  return transformer;
}

exports.UploadImage = async (req, res) => {
  try {
    const imageDir = path.join(__dirname, "../uploads/images");
    fs.mkdirSync(imageDir, { recursive: true });

    const storage = multerStorage(imageDir);
    const upload = multer({ storage }).single("photo");

    upload(req, res, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Multer error", error: err.message });
      }

      const originalPath = path.join(
        imageDir,
        `${req.photoId}${path.extname(req.file.originalname)}`
      );
      const compressedPath = path.join(
        imageDir,
        `${req.photoId}_compressed${path.extname(req.file.originalname)}`
      );

      let transformer = sharp(req.file.path).resize({ width: 800 });
      transformer = rotateImage(
        parseInt(req.body.orientation, 10),
        transformer
      );

      transformer
        .jpeg({ quality: 80 })
        .withMetadata({ orientation: 1 })
        .toFile(compressedPath, async (err, info) => {
          if (err) {
            return res.status(500).json({
              message: "Image compression failed",
              error: err.message,
            });
          }

          fs.unlinkSync(originalPath);

          const { description } = req.body;
          const photoId = `${req.photoId}_compressed${path.extname(
            req.file.originalname
          )}`;

          const newImage = new Gallery({ photoId, description });
          await newImage.save();

          res
            .status(200)
            .json({ message: "Upload and compression successful", photoId });
        });
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

exports.GetAllImages = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json(images); // Each image has photoId + description
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch images" });
  }
};

exports.DeleteImage = async (req, res) => {
  try {
    const { id } = req.query;
    const image = await Gallery.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const imagePath = path.join(__dirname, "../uploads/images", image.photoId);
    fs.unlinkSync(imagePath);

    await Gallery.findByIdAndDelete(id);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete image" });
  }
};
