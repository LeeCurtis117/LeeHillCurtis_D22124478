const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

//get all users
const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find({}, "-password");
	} catch (err) {
		const error = new HttpError("Fetching users failed, please try again", 500);
		return next(error);
	}
	res
		.status(200)
		.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

//get user by id
const getUserById = async (req, res, next) => {
	const userId = req.params.uid;
	let user;
	try {
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError("Fetching user failed, please try again", 500);
		return next(error);
	}
	if (!user) {
		const error = new HttpError("Could not find user for the provided id", 404);
		return next(error);
	}
	res.json({ user: user.toObject({ getters: true }) });
};

//signup
const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs passed, please check your data.", 422)
		);
	}
	const { firstName, lastName, email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError("Sign up failed, please try again", 500);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError(
			"User exists already, please login instead",
			422
		);
		return next(error);
	}

	const createdUser = new User({
		firstName,
		lastName,
		email,
		password,
		image: req.file.path,
		movies: [],
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError("Signing up failed, please try again", 500);
		return next(error);
	}

	res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

//login
const login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError("Logging in failed, please try again", 500);
		return next(error);
	}

	if (!existingUser || existingUser.password !== password) {
		const error = new HttpError("Invalid credentials, login failed", 401);
		return next(error);
	}

	res.status(201).json({
		message: "Logged in!",
		user: existingUser.toObject({ getters: true }),
	});
};

const updateUser = async (req, res, next) => {
	const userId = req.params.uid;
	const { firstName, lastName, email, password, currentPassword } = req.body;

	let user;
	try {
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not update user",
			500
		);
		return next(error);
	}

	if (firstName){
		user.firstName = firstName;
	}
	if (lastName){
		user.lastName = lastName
	}
	if (email?.length>1){
		user.email = email
	}
	if (password){
		if (user.password !== currentPassword){
			return res.status(400).json({
				message:"Password does not match"
			})
		}else{
			user.password = password;
		}

	}


	try {
		await user.save();
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not update user",
			500
		);
		return next(error);
	}

	res.status(200).json({ user: user.toObject({ getters: true }) });
};

const deleteUser = async (req, res, next) => {
	const userId = req.params.uid;

	let user;
	try {
		user = await User.findById(userId).populate("movies");
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not delete user",
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError("Could not find user for this id", 404);
		return next(error);
	}

	try {
		await user.remove();
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not delete user",
			500
		);
		return next(error);
	}

	res.status(200).json({ message: "Deleted User" });
};

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
