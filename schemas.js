const Joi = require("joi");
const sanitizeHtml = require("sanitize-html");

// Define the custom Joi extension to escape HTML
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value });
                return clean;
            }
        }
    }
});

// Create a new Joi instance with the custom extension
const ExtendedJoi = Joi.extend(extension);

// Define the event schema
module.exports.eventSchema = ExtendedJoi.object({
    event: ExtendedJoi.object({
        title: ExtendedJoi.string().required().escapeHTML(),
        price: ExtendedJoi.number().required().min(0),
        location: ExtendedJoi.string().required().escapeHTML(),
        description: ExtendedJoi.string().required().escapeHTML(),
    }).required()
});

// Define the review schema
module.exports.reviewSchema = ExtendedJoi.object({
    review: ExtendedJoi.object({
        body: ExtendedJoi.string().required().escapeHTML(),
        rating: ExtendedJoi.number().required().min(1).max(5),
    }).required()
});
