const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

//REGISTER
router.post('/register', async (req, res)=> {

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        pwd: hashedPassword,
    })

    try {
        const savedUser = await newUser.save();
        return res.status(201).json(savedUser);
    } catch (error) {
        return res.status(500).json(error);
    }
});

//LOGIN
router.post('/login', async (req, res)=> {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username});
        if(!user) return res.status(400).json({error: 'Wrong credentials, please try again'});
        const success = await bcrypt.compare(password, user.pwd);
        if(!success) return res.status(400).json({error: 'Wrong password'});
        
        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin,
        }, process.env.JWT_SEC, { expiresIn: '3d' });

        const { pwd, ...others } = user._doc;
        return res.status(200).json({...others, accessToken });
    } catch (error) {
        return res.status(500).json(error);
    }
})

module.exports = router;