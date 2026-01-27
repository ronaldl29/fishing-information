const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: String,
    gps: String,
    thumbnail: String,
    image: String,
    description: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
});

module.exports = mongoose.model('Location', locationSchema);