const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const PaymentController = (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        return res.json({ valid: true });
    }
    res.status(400).json({ valid: false });
};

const CreateorderController = async (req, res) => {
    const { amount } = req.body;

    try {
        var instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const order = await instance.orders.create({
            amount: amount,
            currency: "INR",
            receipt: "receipt#1",
            partial_payment: false,
            notes: {
                key1: "value3",
                key2: "value2"
            }
        });


        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create order' });
    }
}




module.exports = { PaymentController , CreateorderController };
