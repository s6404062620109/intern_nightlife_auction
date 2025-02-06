const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema(
  {
    tableId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "tables", 
        required: true, 
    },
    accesstime: {
        type: Date,
        require: true
    },
    checkpoint: { 
        start: {
            type: Date,
            require: true
        },
        end: {
            type: Date,
            require: true
        },
    },
    startCoins: {
        type: Number,
        require: true
    },
    winner: {
        name: {
            type: String,
            require: false,
            default: null
        },
        bidValue: {
            type: Number,
            require: false,
            default: null
        },
        time: {
            type: Date,
            require: false,
            default: null
        }
    }
  },
  { timestamps: true }
);

const Auction = mongoose.model('Auction', AuctionSchema);

module.exports = Auction;
