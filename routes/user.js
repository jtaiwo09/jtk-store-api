const User = require('../models/User');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken');

router.put('/:id', verifyTokenAndAuthorization, async (req, res)=> {
    // const { username, email, password } = req.body
    if(req.body.password){
        req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            username: req.body.username,
            pwd: req.body.password,
            email: req.body.email,
            isAdmin: req.body.isAdmin
        }, { new: true});
        return res.status(200).json(updatedUser)
    } catch (error) {
        return res.status(500).json(error);
    }
});
//DELETE USER
router.delete('/:id', verifyTokenAndAuthorization, async (req, res)=> {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return res.status(500).json({error: 'User account has already been deleted or user does not exit'})
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({message: 'User account deleted'});
    } catch (error) {
        return res.status(500).json(error)
    }
});

//GET USER
router.get('/find/:id', verifyTokenAndAdmin, async (req, res)=> {
    try {
        const user = await User.findById(req.params.id);
        const { pwd, ...others } = user._doc;
        return res.status(200).json(others);
    } catch (error) {
        return res.status(500).json(error);
    }
})

//GET ALL USER
router.get('/', verifyTokenAndAdmin, async (req, res)=> {
    try {
        const query = req.query.new;
        const users = query ? await User.find().sort({_id: -1}).limit(5) : await User.find();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json(error);
    }
})

//GET USER STATS
router.get('/stats', verifyTokenAndAdmin, async (req, res)=> {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1))
    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } }, 
            { $project: { month: { $month: "$createdAt" } } },
            { $group: { _id: '$month', total: { $sum: 1 } } }
        ])
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json(error);
    }
})

module.exports = router;