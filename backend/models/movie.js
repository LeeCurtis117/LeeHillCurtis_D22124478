const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const movieSchema = new Schema({
	image: { type: String, required: true },
	title: { type: String, required: true },
	description: { type: String, required: true },
	rating: { type: Number, required: true },
	genre: { type: String, required: true },
	releaseDate: { type: String, required: true },
	review: { type: String, required: true },
	creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Movie", movieSchema);
