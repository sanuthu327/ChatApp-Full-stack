const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message');

// get all other users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// get messages between current user and another user
router.get('/messages/:userId', auth, async (req, res) => {
  try {
    const other = req.params.userId;
    const msgs = await Message.find({
      $or: [
        { from: req.user.id, to: other },
        { from: other, to: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
