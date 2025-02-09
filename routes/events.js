const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync.js');
const { validateEvent, isAuthor, isLoggedIn } = require('../middleware.js');
const events = require('../controllers/events.js');
const multer = require('multer');
const { storage } = require('../cloudinary/index.js')
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(events.index))
    .post(isLoggedIn, upload.single('image'), validateEvent, catchAsync(events.create))

router.get("/new", isLoggedIn, events.createForm);

router.route('/:id')
    .put(isLoggedIn, isAuthor, upload.single('image'), validateEvent, catchAsync(events.edit))
    .get(catchAsync(events.one))
    .delete(isLoggedIn, isAuthor, catchAsync(events.destroy));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(events.editForm));

module.exports = router;
