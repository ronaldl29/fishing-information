const mongoose = require('mongoose');

const catchSchema = mongoose.Schema({
    species: String,
    weight: String,
    image: String,
    catchlocation: String,
    catchlocationid: String,
    description: String,
    timePosted: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    }
},
   {timestamps: true}
);

module.exports = mongoose.model('Catch', catchSchema);