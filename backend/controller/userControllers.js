const asyncHandler = require('express-async-handler');
const User = require("../Model/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req,res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please enter all fields!");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        // 400 is error code
        res.status(400);
        throw new Error("User with this email already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        pic,
    });

    if (user) {
        //201 is okay status code
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } 
    else {
        res.status(400);
        throw new Error("User creation failed!");
    }
});

const authUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });
    }
    else {
        res.status(401);
        throw new Error("Invalid credentials or User does not exist!");
    }
});

const allUsers = asyncHandler(async (req,res) => { 
    // ? {} : {} fancy if else 
    // This are all mongoDb queries 
    const keyword = req.query.search ? {
        $or: [
            {name : {$regex: req.query.search, $options: "i"}},
            {email : {$regex: req.query.search, $options: "i"}},
        ],
    } : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

    res.send(users); 
});

module.exports = { registerUser, authUser, allUsers };