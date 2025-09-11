const express = require('express');
const router = express.Router();

const Meassage = require('../models/message');
const authMiddleware = require('../meddleware/authentication');
const User = require('../models/user');
const Conversation = require('../models/conversation');

// get messages for a conversation
router.get('/conversation/:conversationId', authMiddleware, async (req, res) => {
  try {
    const {id} = req.user;
    const conversationId = req.params.conversationId;
    const conversationData = await Conversation.findById(conversationId).populate('participants','name email');
    const friend = conversationData?.participants.find(p => String(p._id) !== id);
    console.log(friend);
    // const messages = await Meassage.find({ conversation: req.params.conversationId })
    //   .sort({ createdAt: 1 })
    //   .populate('sender', 'name email');

    
    return;
    res.json(messages);
   
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create message (not required if using sockets, but useful fallback)
router.post('/', async (req, res) => {
  try {
    const { conversation, sender, text } = req.body;
    const message = new Message({ conversation, sender, text });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
