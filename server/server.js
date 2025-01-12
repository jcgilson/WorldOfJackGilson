// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Route for insert (User file)
const GolfRoundsCollection = require('./models/GolfRounds');
const CourseInfoCollection = require('./models/CourseInfo');


// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI (Replace with your MongoDB Atlas URI or local URI)
// process.env.MONGO_CONNECTION_STRING;
const mongoURI = REACT_APP_MONGO_CONNECTION_STRING;
console.log("mongoURI:",mongoURI)

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



// POST route to add a new golfRound
app.post('/add-round', async (req, res) => {
  const newRound = new GolfRoundsCollection(req.body);

  try {
    await newRound.save();
    res.json({ message: 'Round added!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET route to get all golfRounds
app.get('/golfrounds', async (req, res) => {
  try {
    const golfRounds = await GolfRoundsCollection.find();
    res.json(golfRounds);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST route to add a new golfRound
app.post('/add-courseInfo', async (req, res) => {
    const courseInfo = new CourseInfoCollection(req.body);
  
    try {
      await courseInfo.save();
      res.json({ message: 'Course info added!' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

// GET route to get courseInfo
app.get('/courseinfo', async(req, res) => {
  try {
    const courseInfo = await CourseInfoCollection.find();
      res.json(courseInfo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
})

app.put('/updateround', async(req, res) => {
  try {
    const result = await GolfRoundsCollection.findOneAndUpdate(
      { "roundInfo.key": req.body.roundInfo.key },
      { $set: 
        {
          approach: req.body.approach,
          fairways: req.body.fairways,
          greens: req.body.greens,
          nonGhinRounds: req.body.nonGhinRounds,
          putting: req.body.putting,
          roundInfo: req.body.roundInfo,
          scoring: req.body.scoring,
          hole1: req.body.hole1,
          hole2: req.body.hole2,
          hole3: req.body.hole3,
          hole4: req.body.hole4,
          hole5: req.body.hole5,
          hole6: req.body.hole6,
          hole7: req.body.hole7,
          hole8: req.body.hole8,
          hole9: req.body.hole9,
          hole10: req.body.hole10,
          hole11: req.body.hole11,
          hole12: req.body.hole12,
          hole13: req.body.hole13,
          hole14: req.body.hole14,
          hole15: req.body.hole15,
          hole16: req.body.hole16,
          hole17: req.body.hole17,
          hole18: req.body.hole18
        }
      },
      { new: true } // TODO: remove upsert, for now new round is being added bc sequence and key are wrong
    )
    if (result) {
      res.json({ message: 'Scorecard Updated!' });
    } else {
      res.json({ message: 'Existing scorecard not found.' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
})