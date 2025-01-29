const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true
    },
    address: { 
        type: String, 
        required: true 
    },
    banner: { 
        type: String, 
        require: true 
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        require: true
    },
    contact: {
      phone: {
        type: String,
        require: true
      },
      email: {
        type: String,
        require: true
      },
      facebook: {
        type: String,
        require: true
      }
    }
  },
  { timestamps: true }
);

const Venue = mongoose.model('Venue', VenueSchema);

module.exports = Venue;
