const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const { default: mongoose } = require('mongoose');
const { protect } = require('../middleware/authMiddleware');

router.post("/:id", protect, async (req, res) => {
  const senderId = req.user.userId;
  const receiverId = req.params.id;

  if (senderId === receiverId) return res.status(400).json({ message: "Cannot send request to yourself" });

  try {
   
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: "Receiver not found" });

    const existing = await Connection.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId } 
      ]
    });

    if (existing) {
      if (existing.status === "REQUESTED") return res.status(400).json({ message: "Request already pending" });
      if (existing.status === "ACCEPTED") return res.status(400).json({ message: "Already connected" });
    }

    const connection = await Connection.create({ senderId, receiverId, status: "REQUESTED" });
    return res.status(201).json(connection);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to send connection request" });
  }
});


router.get("/:id",protect, async (req, res) => {
  const userId = req.user.userId;

  try {
    const connections = await Connection.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).populate("senderId receiverId", "name email profilePic");

    return res.status(200).json(connections);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to get connections" });
  }
});



router.get("/requests/:id",protect,async(req,res)=>{

  const userId = req.params.id;

  try{
const requests = await Connection.find({status:"REQUESTED"
,receiverId:userId
}).populate("senderId","name email")
res.json(requests);
  }
  catch(err){
    return res.status(500).json({ message: "Failed to update connection" });
  }


})

router.put("/:id", protect, async (req, res) => {
    const connectionId = req.params.id;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({ message: "Connection not found" });
        }

      
        if (String(connection.receiverId) !== String(userId)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        connection.status = status;
        await connection.save();

        return res.status(200).json(connection);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update connection" });
    }
});


router.get("/mine/:id",protect, async (req, res) => {
  const userId = req.params.id;

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const connections = await Connection.find({
      status: "ACCEPTED",
      $or: [
        { receiverId: userObjectId },
        { senderId: userObjectId }
      ]
    }).populate("senderId receiverId", "name email profilePic");

    return res.status(200).json(connections);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Can't get connections" });
  }
});



module.exports = router;
