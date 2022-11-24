const express = require("express");

const { check } = require("express-validator");

const moviesControllers = require("../controllers/movies-controller");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/:mid", moviesControllers.getMovieById);

router.get("/user/:uid", moviesControllers.getMoviesByUserId);
router.get("/", moviesControllers.getAllMovies);

router.post(
	"/",
	fileUpload.single("image"),
	[
		check("title").not().isEmpty(),
		check("description").isLength({ min: 5 }),
		check("rating").isLength({ min: 1, max: 5 }),
		check("review").isLength({ min: 5 }),
		check("genre").not().isEmpty(),
		check("releaseDate").not().isEmpty(),
	],
	moviesControllers.createMovie
);

router.patch(
	"/:mid",
	fileUpload.single("image"),
	[
		check("title").not().isEmpty(),
		check("description").isLength({ min: 5 }),
		check("rating").isLength({ min: 1, max: 5 }),
		check("review").isLength({ min: 5 }),
		check("genre").not().isEmpty(),
		check("releaseDate").not().isEmpty(),
	],
	moviesControllers.updateMovie
);

router.delete("/:mid", moviesControllers.deleteMovie);

module.exports = router;
