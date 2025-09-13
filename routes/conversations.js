const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');
const User = require('../models/user');
const authMiddleware = require('../meddleware/authentication');

// create a conversation between two users (if not exists, create)
router.post('/',authMiddleware, async (req, res) => {
  try {
    const {id} = req.user;
    const { userId } = req.body;  
    const userIds = [userId,id]

    if (!userIds || userIds.length !== 2) return res.status(400).json({ error: 'Provide 2 userIds' });

    // check existing conversation with same participants (order-agnostic)
    let convo = await Conversation.findOne({ participants: { $all: userIds, $size: 2 } });
    if (!convo) {
      convo = new Conversation({ participants: userIds });
      await convo.save();
    }
    convo = await convo.populate('participants', 'name email');
    res.status(201).json(convo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get conversations for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { id } = req.user;

    const convos = await Conversation.find({ participants: id })
      .sort({ updatedAt: -1 })
      .populate("participants", "name email");

    // 🔹 Transform: keep only "friend" info
    const list = convos.map((c) => {
      const user = c.participants.find((p) => p._id.toString() !== id);
      return {
        conversation: c._id,
        friend : user , // only friend info
        updatedAt: c.updatedAt,
        // lastMessage: c.lastMessage || null, // optional if you store
      };
    });

    res.json({
      conversations: convos,  
      list,  
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// const conversationList = convos.map(con => con.participants.find((f)=> String(f._id) !== id))
module.exports = router;
