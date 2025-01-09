const mongoose = require('mongoose');

const BidHistorySchema = new mongoose.Schema(
  {
    offerBid: { 
        type: Number,
        required: true, 
    },
    time: { 
        type: Date,
        required: true, 
    },
    offerId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        require: true
    },
    auctionId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "auctions",
        require: true
    },
  }
);

const BidHistory = mongoose.model('BidHistory', BidHistorySchema);

module.exports = BidHistory;
