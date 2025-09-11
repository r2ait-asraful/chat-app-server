const Conversation = require('../models/conversation')


const conversationHandler =async(io, socket)=>{
    // Join all user conversations (rooms)
  socket.on("join_conversations", async () => {
    const conversations = await Conversation.find({
      participants: socket.user.id,
    });
    conversations.forEach((c) => socket.join(c._id.toString()));
  });

  // Create new conversation
  socket.on("create_conversation", async ({ userId }) => {
    let convo = await Conversation.findOne({
      participants: { $all: [socket.user.id, userId] },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [socket.user.id, userId],
      });
    }

    socket.join(convo._id.toString());
    socket.emit("conversation_created", convo);
  });
}

module.exports = conversationHandler;

