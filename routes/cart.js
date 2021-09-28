const router = require('express').Router();
const bcrypt = require('bcrypt');
const Cart = require('../models/Cart');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require('./verifyToken');

//CREATE CART
router.post('/', verifyToken, async (req, res)=> {
    const newCart = new Cart(req.body);
    try {
        const savedCart = await newCart.save();
        return res.status(200).json(savedCart);
    } catch (error) {
        return res.status(500).json(error);
    }
});

//UPDATE CART
router.put('/:id', verifyTokenAndAuthorization, async (req, res)=> {
    try {
        const updatedCart = await Cart.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true});
        return res.status(200).json(updatedCart);
    } catch (error) {
        return res.status(500).json(error);
    }
});

//DELETE CART
router.delete('/:id', verifyTokenAndAuthorization, async (req, res)=> {
    try {
        const cart = await Cart.findById(req.params.id);
        if(!cart) return res.status(500).json({error: 'Cart has already been deleted or product does not exit'});
        await Cart.findByIdAndDelete(req.params.id);
        return res.status(200).json({message: 'Cart deleted...'});
    } catch (error) {
        return res.status(500).json(error);
    }
});

//GET USER CART
router.get('/find/:userId', verifyTokenAndAuthorization, async (req, res)=> {
    try {
        const cart = await Product.findOne({userId: req.params.userId});
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json(error);
    }
})

//GET ALL CART
router.get('/', verifyTokenAndAdmin, async (req, res)=> {
    try {
        const carts = await Cart.find();
        return res.status(200).json(carts);
    } catch (error) {
        return res.status(500).json(error);
    }
});


module.exports = router;