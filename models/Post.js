const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    species: String,
    weight: String,
    image: String,
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);