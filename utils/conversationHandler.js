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
  let convo = await conversationDetails(socket.user.id, userId);

  if (!convo) {
    // Create convo
    convo = await Conversation.create({
      participants: [socket.user.id, userId],
    });

    // 🔹 Fetch again with populated participants
    convo = await conversationDetails(socket.user.id, userId);
  }

  socket.join(convo._id.toString());

  // Send convo with both participants
  const friend = convo.participants.find(
  (p) => p._id.toString() !== socket.user.id
);

const newConversation = {
  conversation: convo._id,
  friend,  
  updatedAt: convo.updatedAt,
  // lastMessage: convo.lastMessage || null,
};

socket.emit("conversation_created", {
  conversation: convo,
  data: newConversation,
});

});


// Get all conversations for logged-in user
socket.on("get_conversations", async () => {
  try {
    const conversations = await Conversation.find({
      participants: socket.user.id,
    })
      .populate("participants", "name email")
      .sort({ updatedAt: -1 });   

    socket.emit("conversations_list", conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err.message);
    socket.emit("error", { message: "Failed to load conversations" });
  }
});

}


// helper
const conversationDetails = async (sender, user) => {
  return await Conversation.findOne({
    participants: { $all: [sender, user] },
  }).populate("participants", "name email");
};



module.exports = conversationHandler;

