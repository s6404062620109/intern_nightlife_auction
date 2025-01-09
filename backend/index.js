const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./database');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('Wellcome to NodeJS for NIGHTLIFE_AUCTION service.');
});

// authentication enpoints
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// venue enpoints
const venueRoutes = require('./routes/venueRoutes');
app.use('/venue', venueRoutes);

// table enpoints
const tableRoutes = require('./routes/tableRoutes');
app.use('/table', tableRoutes);

// auction enpoints
const auctionRoutes = require('./routes/auctionRoutes');
app.use('/auction', auctionRoutes);

// bid enpoints
const bidRoutes = require('./routes/bidRoutes');
app.use('/bid', bidRoutes);

const imgRoutes = require('./routes/imgRoutes');
app.use('/img', imgRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
