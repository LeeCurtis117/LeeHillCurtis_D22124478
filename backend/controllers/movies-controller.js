const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Movie = require("../models/movie");
const User = require("../models/user");

const getMovieById = async (req, res, next) => {
	const movieId = req.params.mid;

	let movie;
	try {
		movie = await Movie.findById(movieId);
	} catch (err) {
		return next(new HttpError("Could not find a movie.", 500));
	}

	if (!movie) {
		const error = new HttpError(
			"Could not find a movie for the provided id.",
			404
		);
		return next(error);
	}
	res.json({ movie: movie.toObject({ getters: true }) });
};

const getMoviesByUserId = async (req, res, next) => {
	const userId = req.params.uid;

	let movies;
	try {
		movies = await Movie.find({ creator: userId });
	} catch (err) {
		return next(new HttpError("Could not find a movie.", 500));
	}

	if (!movies || movies.length === 0) {
		return next(
			new HttpError("Could not find movies for the provided User id.", 404)
		);
	}

	res.json({
		movies: movies.map((movie) => movie.toObject({ getters: true })),
	});
};
const getAllMovies = async (req, res, next) => {


	let movies;
	try {
		movies = await Movie.find({});
	} catch (err) {
		return next(new HttpError("Could not find a movie.", 500));
	}

	if (!movies || movies.length === 0) {
		return next(
			new HttpError("Could not find movies for the provided User id.", 404)
		);
	}

	res.json({
		movies: movies.map((movie) => movie.toObject({ getters: true })),
	});
};

const createMovie = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);

		return next(
			new HttpError("Invalid inputs passed, please check your inputs", 422)
		);
	}
	const { title, description, rating, genre, releaseDate, review, creator } =
		req.body;

	const createdMovie = new Movie({
		image: req.file.path,
		title,
		description,
		rating,
		genre,
		releaseDate,
		review,
		creator,
	});

	let user;
	try {
		user = await User.findById(creator);
	} catch (err) {
		const error = new HttpError("Creating Movie failed, please try again", 500);
		return next(error);
	}

	if (!user) {
		const error = new HttpError("Could not find user for provided id", 404);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await createdMovie.save({ session: sess });
		user.movies.push(createdMovie);
		await user.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			"Creating movie failed, please try again.",
			500
		);
		return next(error);
	}

	res.status(201).json({ movie: createdMovie });
};

const updateMovie = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs passed, please check your inputs", 422)
		);
	}

	const { title, description, rating, review, genre, releaseDate } = req.body;
	const movieId = req.params.mid;

	let movie;
	try {
		movie = await Movie.findById(movieId);
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not update movie.",
			500
		);
		return next(error);
	}

	movie.title = title;
	movie.description = description;
	movie.rating = rating;
	movie.genre = genre;
	movie.releaseDate = releaseDate;
	movie.review = review;

	try {
		await movie.save();
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not update movie.",
			500
		);
		return next(error);
	}

	res.status(200).json({ movie: movie.toObject({ getters: true }) });
};

const deleteMovie = async (req, res, next) => {
	const movieId = req.params.mid;

	let movie;
	try {
		movie = await Movie.findById(movieId).populate("creator");
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not delete movie.",
			500
		);
		return next(error);
	}

	if (!movie) {
		const error = new HttpError("Could not find movie for this id.", 404);
		return next(error);
	}

	const imagePath = movie.image;
	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await movie.remove({ session: sess });
		movie.creator.movies.pull(movie);
		await movie.creator.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError("Could not delete movie.", 500);
		return next(error);
	}

	fs.unlink(imagePath, (err) => {
		console.log(err);
	});
	res.status(200).json({ message: "Deleted movie" });
};

exports.getMovieById = getMovieById;
exports.getMoviesByUserId = getMoviesByUserId;
exports.createMovie = createMovie;
exports.updateMovie = updateMovie;
exports.deleteMovie = deleteMovie;
exports.getAllMovies = getAllMovies;
