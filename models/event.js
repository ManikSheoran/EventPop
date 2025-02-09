const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review");
const User = require("./user");
const { eventSchema } = require('../schemas');

const opts = { toJSON: { virtuals: true }};

const EventSchema = new Schema({
    title: String,
    image: {
        url: String,
        filename: String
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

EventSchema.virtual('properties.popUp').get(function() {
    return `${this.title}`;
});

EventSchema.virtual('properties.popUpLink').get(function() {
    return `${this._id}`;
});

EventSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('Event', EventSchema);
