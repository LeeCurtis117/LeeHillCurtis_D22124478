const express = require("express");
const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controller");

const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", usersControllers.getUsers);

router.get("/:uid", usersControllers.getUserById);

router.post(
	"/signup",
	fileUpload.single("image"),
	[
		check("firstName").not().isEmpty(),
		check("lastName").not().isEmpty(),
		check("email").normalizeEmail().isEmail(),
		check("password").isLength({ min: 8 }),
	],
	usersControllers.signup
);

router.post("/login", usersControllers.login);

router.patch(
	"/:uid",
	fileUpload.single("image"),
	[
		check("firstName").not().isEmpty(),
		check("lastName").not().isEmpty(),
		check("email").normalizeEmail().isEmail(),
		check("password").isLength({ min: 8 }),
	],
	usersControllers.updateUser
);

router.delete("/:uid", usersControllers.deleteUser);

module.exports = router;
