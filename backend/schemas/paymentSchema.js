const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    price: {
        type: Number,
        require: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        require: true
    },
    payment_method: {
        name: {
            type: String,
            require: true
        },
        code: {
            type: String,
            require: true,
        }
    },
    payment_for: {
        auction: {
            type: Boolean,
            require: false,
            default: false
        },
        auctionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auctions",
            require: false
        }
    },
    qrCode:{
        type: String,
        require: true
    },
    timeout:{
        type: Date,
        require: true
    },
    user_refer: {
        proof:{
            type: String,
            require: false
        },
        time:{
            type: Date,
            require: false
        }
    }
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
