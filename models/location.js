const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    name: String,
    gps: String,
    thumbnail: String,
    image: String,
    description: String,
    catches: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Catch"
        }
        ]
});

module.exports = mongoose.model("Location", locationSchema);