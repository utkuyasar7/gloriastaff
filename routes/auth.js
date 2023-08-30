const express = require("express");
const router = express.Router();
const User = require("../models/User"); 
const Title = require("../models/Title")
const jwt = require("jsonwebtoken")
const Tip =require("../models/Tip")
const auth0 = require("../middleware/authcontroller")


router.post("/register", async (req, res) => {
  try {
    const { UserFullName, Password, Title, isAdmin } = req.body; // isAdmin'i burada da alın
    const newUser = new User({
      UserFullName,
      Password,
      Title,
      isAdmin,
    });
    const savedUser = await newUser.save();
    const populatedUser = await User.findById(savedUser._id).populate("Title");
    res.status(201).json(populatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get("/checkadmin", auth0, async (req, res) => {
  try {
    const userId = req._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const isAdmin = user.isAdmin; // isAdmin değerini alın

    res.status(200).json({ isAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/createtitle", auth0,async (req, res) => {
    try {
      const { name } = req.body;
  
     
      const newTitle = new Title({
        name,
      });
  
     
      const savedTitle = await newTitle.save();
  
      res.status(201).json(savedTitle);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  router.get("/titles", auth0, async (req, res) => {
    try {
      const titles = await Title.find();
      res.status(200).json(titles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ Password: req.body.password }).populate(
        "Title"
      );
  
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
  
      const token = jwt.sign({ _id: user._id }, "gizliAnahtar");
  
      res
        .status(200)
        .header("Authorization", `Bearer ${token}`)
        .json({ token, user }); // user bilgisini de dönüyoruz
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

router.get("/users",auth0, async (req, res) => {
    try {
      const allUsers = await User.find().populate("Title"); // Title alanını doldur
      res.status(200).json(allUsers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  router.get("/kullanici/:userId", async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const tips = await Tip.find({ User: userId })
        .populate("Currency", "name")
        .populate("User", "UserFullName");
  
      res.status(200).json(tips);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası." });
    }
  });
  router.get("/userinfo", auth0, async (req, res) => {
    try {
      // Auth0'dan gelen bilgileri kullanarak kullanıcının bilgilerini alabilirsiniz
      const userId = req._id;
  
      // Kullanıcının bilgilerini veritabanından alabilirsiniz (örneğin, User koleksiyonundan)
      const user = await User.findById(userId).populate("Title");
  
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
  
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;

