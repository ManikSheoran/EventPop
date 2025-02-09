const Event = require('../models/event.js');
const cloudinary = require('cloudinary').v2;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxTOKEN = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxTOKEN });

module.exports.index = async (req, res) => {
    const events = await Event.find({});
    res.render("events/index", { events, title: 'All Events' });
};

module.exports.createForm = (req, res) => {
    res.render("events/new", { title: 'New Event' });
};

module.exports.create = async (req, res, next) => {
    const geocodes = await geocoder.forwardGeocode({
        query: req.body.event.location,
        limit: 1
    }).send();
    const newEvent = new Event(req.body.event);
    newEvent.geometry = geocodes.body.features[0].geometry;
    newEvent.image = {
        url: req.file.path,
        filename: req.file.filename
    };
    newEvent.author = req.user._id;
    await newEvent.save();
    req.flash('success', 'Successfully created a new event!');
    res.redirect(`/events/${newEvent._id}`);
};

module.exports.editForm = async (req, res) => {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
        req.flash('error', 'Event not found');
        return res.redirect('/events');
    }
    res.render("events/edit", { event, title: `Edit ${event.title}` });
};

module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
        req.flash('error', 'Event not found');
        return res.redirect('/events');
    }

    const updatedEventData = { ...req.body.event };

    // If location is updated, get the new geocodes
    if (req.body.event.location !== event.location) {
        const geocodes = await geocoder.forwardGeocode({
            query: req.body.event.location,
            limit: 1
        }).send();
        updatedEventData.geometry = geocodes.body.features[0].geometry;
    }

    // Update the event details
    const updatedEvent = await Event.findByIdAndUpdate(id, updatedEventData, { new: true });

    // If a new image is uploaded, replace the existing one
    if (req.file) {
        // Delete the existing image from Cloudinary if it exists
        if (event.image && event.image.filename) {
            await cloudinary.uploader.destroy(event.image.filename);
        }

        // Update the event with the new image
        updatedEvent.image = {
            url: req.file.path,
            filename: req.file.filename
        };

        await updatedEvent.save();
    }

    req.flash('success', 'Successfully updated the event!');
    res.redirect(`/events/${id}`);
};

module.exports.destroy = async (req, res) => {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
        req.flash('error', 'Event not found');
        return res.redirect('/events');
    }

    if (event.image && event.image.filename) {
        await cloudinary.uploader.destroy(event.image.filename);
    }

    await Event.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the event!');
    res.redirect('/events');
};

module.exports.one = async (req, res) => {
    const { id } = req.params;
    const event = await Event.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    });
    if (!event) {
        req.flash('error', 'Event not found');
        return res.redirect('/events');
    }
    res.render("events/show", { event, title: event.title });
};
