const express = require('express');
const multer = require('multer');
const { isAuth, isAdmin } = require('../utils.js');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}.jpg`);
  },
});

const upload = multer({ storage });
const uploadRouter = express.Router();

uploadRouter.post('/', isAuth, isAdmin, upload.single('image'), (req, res) => {
  res.status(201).send({ image: `/${req.file.path}` });
});
module.exports = uploadRouter;