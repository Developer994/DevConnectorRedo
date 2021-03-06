const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult} = require("express-validator")

// User model
const User = require('../../models/User');

// @route  GET api/users
// @desc   Register User
// @access Public
router.post('/', [
    check('name', 'Name is required')
    .not()
    .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6})
], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {
    // See if user exists
    let user = await User.findOne({ email }); // ({email: email}) = ({email})

    if(user) {
        // This line is for if user does exists
        return res.status(400).json({errors: [{msg: 'User already exists'}]});
    }

    //Get users gravatar
    const avatar = gravatar.url(email, {
        s: '200', // size
        r: 'pg',  // rating
        d: 'mm' // default image
    })

    // Used to create a new user if user does not exist
    user = new User({
        name,
        email,
        avatar,
        password
    })
    
    // Encrypt password using bcrypt
    // The await is used for the promise and is used instead of .then
    const salt = await bcrypt.genSalt(10); // Salt is used for hashing

    user.password = await bcrypt.hash(password, salt);

    // This saves the user to the database
    await user.save()

    // Return the jsonwebtoken so user can get logged in right away
    const payload = {
        user: {
            id: user.id
        }
    }

    jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 360000}, (err, token) =>{
        if(err) throw err;
        res.json({token})
    })

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }

    

    }
    );

module.exports = router;

