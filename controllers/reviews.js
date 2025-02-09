const Event = require('../models/event.js');
const Review = require("../models/review.js");
const ExpressError = require('../utilities/ExpressError');

module.exports.create = async (req, res) => {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
        throw new ExpressError('Event not found', 404);
    }
    const review = new Review(req.body.review);
    review.author = req.user._id;
    event.reviews.push(review);
    await event.save();
    await review.save();
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/events/${id}`);
};

module.exports.destroy = async (req, res) => {
    const { id, rid } = req.params;
    const event = await Event.findById(id);
    if (!event) {
        throw new ExpressError('Event not found', 404);
    }
    await Event.findByIdAndUpdate(id, { $pull: { reviews: rid } });
    await Review.findByIdAndDelete(rid);
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/events/${id}`);
};
