const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync.js');

const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware.js');
const reviews = require('../controllers/reviews.js')

// Route to create a new review
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.create));

// Route to delete a review
router.delete("/:rid", isLoggedIn, isReviewAuthor, catchAsync(reviews.destroy));

module.exports = router;
