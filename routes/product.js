const router = require('express').Router();
const bcrypt = require('bcrypt');
const Product = require('../models/Product');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken');

//CREATE PRODUCT
router.post('/', verifyTokenAndAdmin, async (req, res)=> {
    const newProduct = new Product(req.body);
    try {
        const savedProduct = await newProduct.save();
        return res.status(200).json(savedProduct);
    } catch (error) {
        return res.status(500).json(error);
    }
});

//UPDATE PRODUCT
router.put('/:id', verifyTokenAndAdmin, async (req, res)=> {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true});
        return res.status(200).json(updatedProduct);
    } catch (error) {
        return res.status(500).json(error);
    }
});
//DELETE PRODUCT
router.delete('/:id', verifyTokenAndAdmin, async (req, res)=> {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) return res.status(500).json({error: 'Product has already been deleted or product does not exit'});
        await Product.findByIdAndDelete(req.params.id);
        return res.status(200).json({message: 'Product deleted...'});
    } catch (error) {
        return res.status(500).json(error);
    }
});

//GET PRODUCT
router.get('/find/:id', async (req, res)=> {
    try {
        const product = await Product.findById(req.params.id);
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json(error);
    }
})

//GET ALL PRODUCT
router.get('/', async (req, res)=> {

    const qNew = req.query.new;
    const qCategory = req.query.category;

    try {
        let products;
        if(qNew){
            products = await Product.find().sort({createdAt: -1}).limit(1)
        } else if(qCategory) {
            products = await Product.find({
                categories: {
                    $in: [qCategory]
                }
            });
        } else {
            products = await Product.find();
        }
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json(error);
    }
});


module.exports = router;