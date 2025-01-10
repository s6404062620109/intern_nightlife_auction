const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema(
  {
    seats: { 
        type: Number, 
        required: true
    },
    name: { 
      type: String, 
      required: true
    },
    venueId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "venues", 
        required: true, 
    },
  },
  { timestamps: true }
);

const Table = mongoose.model('Table', TableSchema);

module.exports = Table;
