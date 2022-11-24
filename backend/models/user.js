const mongoose = require("mongoose");
//third party mongoose validation
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true, minlength: 8 },
	image: { type: String, required: true },
	movies: [{ type: mongoose.Types.ObjectId, required: true, ref: "Movie" }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
