const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
  res.send('Backend is running!');
});


// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// Create Order API
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  try {

    var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
    console.log('order inititaed');
    const order = await instance.orders.create({
      "amount": amount,
      "currency": "INR",
      "receipt": "receipt#1",
      "partial_payment": false,
      "notes": {
        "key1": "value3",
        "key2": "value2"
      }
    })
    console.log(order);


    // const order = await razorpay.orders.create({
    //   amount,
    //   currency: 'INR',
    //   receipt: 'receipt_' + Date.now(),
    //   payment_capture: 1,
    // });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify Payment Signature
app.post('/verify-payment', (req, res) => {
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
