require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ✅ MongoDB Connection (case fixed)
mongoose.connect("mongodb://127.0.0.1:27017/chatDB", {
    // new URL parser and unified topology are now default, so no need for options
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error(err));

// Serve a simple root endpoint
app.get("/", (req, res) => {
    res.send("Chat server is running!");
});

io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    // Send chat history
    const messages = await Message.find().sort({ timestamp: 1 });
    socket.emit("chatHistory", messages);

    // Listen for messages
    socket.on("sendMessage", async (data) => {
        data.timestamp = new Date();
        const newMsg = new Message(data);
        await newMsg.save();
        io.emit("receiveMessage", newMsg);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
