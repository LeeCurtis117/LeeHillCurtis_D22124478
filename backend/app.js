const fs = require("fs");
const path = require("path");

const express = require("express");

//MongoDB
const mongoose = require("mongoose");

// Import the routes
const moviesRoutes = require("./routes/movies-routes");
const usersRoutes = require("./routes/users-routes");
// Error handling middleware
const HttpError = require("./models/http-error");

mongoose
	.connect(
		"mongodb+srv://LeeHillCurtis117:6EQBwiLgXNXDyn0D@cluster0.upill2a.mongodb.net/movies?retryWrites=true&w=majority"
	)
	.then(() => {
	
	})
	.catch((err) => {
		console.log(err);
	});

const app = express();

// first parse the body of the request
app.use(express.json());

//image upload middleware
app.use("/uploads/images", express.static(path.join("uploads", "images")));

//Cors
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

	next();
});

// Add the middleware for movies routes
app.use("/api/movies", moviesRoutes);

// Add the middleware for users routes
app.use("/api/users", usersRoutes);

// didnt get response from the server
app.use((req, res, next) => {
	const error = new HttpError("Could not find this route.", 404);
	throw error;
});

// Error handling middleware
app.use((error, req, res, next) => {
	if (req.file) {
		fs.unlink(req.file.path, (err) => {
			console.log(err);
		});
	}
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || "Unknown error!" });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB



app.listen(PORT,()=>{
	console.log(`server is listening on PORT ${PORT}`);
})
