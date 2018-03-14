var mongoose = require("mongoose");

var locationSchema = new mongoose.Schema({
    name: String,
    gps: String,
    image: String,
    thumbnail: String,
    description: String,
    catches: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Catch"
        }
        ]
});

module.exports = mongoose.model("Location", locationSchema);