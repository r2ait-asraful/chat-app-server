const Message = require("../models/message");



const messageHandler = async(io, socket)=>{
    // Send a message
  socket.on("send_message", async ({ conversationId, text }) => {
    const message = await Message.create({
      conversation: conversationId,
      sender: socket.user.id,
      text,
    });

    // Broadcast to all participants in the room
    io.to(conversationId).emit("new_message", {
      ...message.toObject(),
      sender: { _id: socket.user.id },
    });
  });

  // Join single conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });
}


module.exports = messageHandler;