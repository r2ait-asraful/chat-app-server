const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../meddleware/authentication');
// create user
router.post('/', async (req, res) => {
  try {
    console.log(req.body);
    const { name, email,password } = req.body;
    const user = new User({ name, email,password });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//login user
router.post('/login',async(req,res)=>{   
  try {
    
    const {email,password } = req.body;

    const user = await User.findOne({email});
    
     if(!user){
      return   res.status(404).json({message : "user not found"})
    } 
    
    if(user.password !== password){
        return   res.status(400).json({message : "wrong password"})
    }
     
    
    const token = jwt.sign({id : user._id, email : user.email}, process.env.JWT_SECRET)
    res.status(201).json({user,token});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// search user 
router.get("/search",authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    console.log(query);
    if (!query) {
      return res.json([]);
    }

    // case-insensitive regex search
    const users = await User.find({
      $or: [
        { name: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
      ],
    })
      .select("-password") // exclude password
      .limit(10);

    res.json(users);
  } catch (err) {
    console.error("Search error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// get user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: 'User not found' });
  }
});



module.exports = router;
