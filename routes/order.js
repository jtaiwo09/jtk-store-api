const router = require('express').Router();
const bcrypt = require('bcrypt');
const Order = require('../models/Order');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require('./verifyToken');

//CREATE ORDER
router.post('/', verifyToken, async (req, res)=> {
    const newOrder = new Order(req.body);
    try {
        const savedOrder = await newOrder.save();
        return res.status(200).json(savedOrder);
    } catch (error) {
        return res.status(500).json(error);
    }
});

//UPDATE ORDER
router.put('/:id', verifyTokenAndAdmin, async (req, res)=> {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true});
        return res.status(200).json(updatedOrder);
    } catch (error) {
        return res.status(500).json(error);
    }
});

//DELETE ORDER
router.delete('/:id', verifyTokenAndAdmin, async (req, res)=> {
    try {
        const order = await Order.findById(req.params.id);
        if(!order) return res.status(500).json({error: 'Order has already been deleted or order does not exit'});
        await Order.findByIdAndDelete(req.params.id);
        return res.status(200).json({message: 'Order deleted...'});
    } catch (error) {
        return res.status(500).json(error);
    }
});

// GET USER ORDER
router.get('/find/:userId', verifyTokenAndAuthorization, async (req, res)=> {
    try {
        const orders = await Order.find({userId: req.params.userId});
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json(error);
    }
})

//GET ALL ORDER
router.get('/', verifyTokenAndAdmin, async (req, res)=> {
    try {
        const orders = await Order.find();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json(error);
    }
});

//GET STATS
router.get('/income',verifyTokenAndAdmin, async (req, res)=> {
    const productId = req.query.pid
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(date.setMonth(lastMonth.getMonth() - 1));

    try {
        const income = await Order.aggregate([
            { $match: { createdAt: { $gte: previousMonth }, ...(productId && {
                products: { $elemMatch: {productId }}
            }) } },
            {
                $project: {
                    month: { $month: '$createdAt' },
                    sales: '$amount'
                }
            },
            {
                $group: {
                    _id: '$month',
                    total: { $sum: '$sales' }
                }
            }
        ]);
        res.status(200).json(income)
    } catch (error) {
        return res.status(500).json(error);
    }
});


module.exports = router;