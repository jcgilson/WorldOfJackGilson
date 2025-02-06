// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
// import { uri } from "./uri.js";

// const env = "golf"
const env = "pool"

// Route for insert (User file)
const GolfRoundsCollection = require('./models/GolfRounds');
const CourseInfoCollection = require('./models/CourseInfo');

const ScheduleCollection = require('./models/Schedule');
const PlayersCollection = require('./models/Players');
const LeaderboardCollection = require('./models/Leaderboard');
const DfsCollection = require('./models/Dfs');
const PoolsCollection = require('./models/Pools');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI (Replace with your MongoDB Atlas URI or local URI)
const mongoURI = process.env.REACT_APP_MONGO_CONNECTION_STRING_POOL; // deployed POOL env
// const mongoURI = process.env.REACT_APP_MONGO_CONNECTION_STRING_GOLF; // deployed GOLF env

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// --GOLF--


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
});


// --POOL--


// PUT route to add schedule
app.put('/add-schedule', async (req, res) => {
  try {
    const result = await ScheduleCollection.findOneAndUpdate(
      { "year": req.body.year },
      { $set: 
        {
          year: req.body.year,
          schedule: req.body.schedule
        }
      },
      { new: true, upsert: true }
    )
    if (result) {
      res.json({ message: 'Schedule saved' });
    } else {
      res.json({ message: 'Schedule not saved' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT route to add players
app.put('/add-players', async (req, res) => {
  try {
    const result = await PlayersCollection.findOneAndUpdate(
      { "tournamentId": req.body.tournamentId, "year": req.body.year },
      { $set: 
        {
          year: req.body.year,
          tournamentId: req.body.tournamentId,
          players: req.body.players
        }
      },
      { new: true, upsert: true }
    )
    if (result) {
      res.json({ message: 'Players saved' });
    } else {
      res.json({ message: 'Players not saved' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT route to add leaderboard
app.put('/add-leaderboard', async (req, res) => {
  try {
    const result = await LeaderboardCollection.findOneAndUpdate(
      { "tournamentId": req.body.tournamentId, "year": req.body.year },
      { $set: 
        {
          roundId: req.body.roundId,
          roundStatus: req.body.roundStatus,
          year: req.body.year,
          tournamentId: req.body.tournamentId,
          leaderboard: req.body.leaderboard,
          timestamp: req.body.timestamp,
          status: req.body.status,
          cutLines: req.body.cutLines,
          lastAppliedSortMethod: req.body.lastAppliedSortMethod,
          displayDownIcon: req.body.displayDownIcon
        }
      },
      { new: true, upsert: true }
    )
    if (result) {
      res.json({ message: 'Leaderboard saved' });
    } else {
      res.json({ message: 'Leaderboard not saved' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT route to add DFS data
app.put('/add-dfs', async (req, res) => {
  try {
    const result = await DfsCollection.findOneAndUpdate(
      { "tournamentId": req.body.tournamentId, "year": req.body.year },
      { $set: 
        {
          year: req.body.year,
          tournamentId: req.body.tournamentId,
          salaries: req.body.salaries
        }
      },
      { new: true, upsert: true }
    )
    if (result) {
      res.json({ message: 'DFS salaries saved' });
    } else {
      res.json({ message: 'DFS salaries not saved' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST route to add pool entry
app.post('/add-poolEntry', async (req, res) => {
  const newPoolEntry = new PoolsCollection(req.body);
  try {
    await newPoolEntry.save();
    res.json({ message: 'Pool entry added!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT route to edit existing pool entry
app.put('/edit-poolEntry', async (req, res) => {
  try {
    const result = await PoolsCollection.findOneAndUpdate(
      { "tournamentId": req.body.tournamentId, "year": req.body.year, "entryData.phone": req.body.entryData.phone, "entryData.email": req.body.entryData.email },
      { $set:
        {
          year: req.body.year,
          tournamentId: req.body.tournamentId,
          entryData: req.body.entryData
        }
      },
      { new: true }
    )
    if (result) {
      res.json({ message: 'Pool entry saved' });
    } else {
      res.json({ message: 'Pool entry not saved' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
})

// GET route to fetch annual schedule
app.get('/get-schedule', async (req, res) => {try {
  const schedule = await ScheduleCollection.findOne({ year: req.query.year });
    if (!schedule) return res.status(404).send(`Schedule not found`);
    return res.json(schedule);
  } catch (error) {
    res.status(500).send("Server error while fetching schedule from Mongo");
  }
});

// GET route to fetch tournament players
app.get('/get-players', async (req, res) => {
  try {
    const players = await PlayersCollection.findOne({ year: req.query.year, tournamentId: req.query.tournamentId });
    if (!players) return res.status(404).send(`Players not found`);
    return res.json(players);
  } catch (error) {
    res.status(500).send("Server error while fetching players from Mongo");
  }
});

// GET route to fetch tournament leaderboard
app.get('/get-leaderboard', async (req, res) => {
  try {
    const leaderboard = await LeaderboardCollection.findOne({ year: req.query.year, tournamentId: req.query.tournamentId });
    if (!leaderboard) return res.status(404).send(`Leaderboard not found`);
    return res.json(leaderboard);
  } catch (error) {
    res.status(500).send("Server error while fetching leaderboard from Mongo");
  }
});

// GET route to fetch tournament player salaries
app.get('/get-dfs', async (req, res) => {
  try {
    const dfs = await DfsCollection.findOne({ year: req.query.year, tournamentId: req.query.tournamentId });
    if (!dfs) return res.status(404).send(`DFS not found`);
    return res.json(dfs);
  } catch (error) {
    res.status(500).send("Server error while fetching DFS from Mongo");
  }
});

// GET route to fetch editing pool entry
app.get('/get-poolEntryBeingEdited', async (req, res) => {
  try {
    let poolEntry = await PoolsCollection.find(req.query);
    delete poolEntry.entryData.email;
    delete poolEntry.entryData.phone;
    if (!poolEntry) return res.status(404).send(`Pool entry not found`);
    return res.json(poolEntry[0]);
  } catch (error) {
    res.status(500).send("Server error while fetching existing pool entry");
  }
});

// GET route to fetch pool entries
app.get('/get-poolEntries', async (req, res) => {
  try {
    const poolEntries = await PoolsCollection.find(req.query);
    if (!poolEntries) return res.status(404).send(`Pool entries not found`);
    let tempPoolEntries = [];
    for (let i = 0; i < poolEntries.length; i++) {
      let tempEntry = poolEntries[i];
      delete tempEntry.phone;
      delete tempEntry.email;
      tempPoolEntries.push(tempEntry);
    }
    return res.json(tempPoolEntries);
  } catch (error) {
    res.status(500).send("Server error while fetching pool entries");
  }
});