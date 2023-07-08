const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//@desc register user
//@route POST api/users/register
//@access Public

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);

    throw new Error("All fields are mandatory");
  }

  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered");
  }
  // Hash Password
  const hasedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hasedPassword,
  });
  console.log(user);

  if (user) {
    res
      .status(201)
      .json({ _id: user.id, email: user.email, username: user.username });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
});

//@desc login user
//@route POST api/users/login
//@access Public

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("email or password missing");
  }
  const user = await User.findOne({ email });
  //compare password with hased password.

  if (user && (await bcrypt.compare(password, user.password))) {
    // generate access token
    const accessToken = jwt.sign(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("Incorrect email or password.");
  }
});

//@desc get current user
//@route GET api/users/current
//@access Private

const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, currentUser };
