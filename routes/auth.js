const express = require("express");
// const serverless = require('serverless-http');
const User = require("../Schema/User");
const Admin = require("../Schema/Admin");
const Signup = require("../Schema/Signup")
const Post = require("../Schema/Post");
const Category = require("../Schema/Category");
const Support = require("../Schema/Support")
const multer = require("multer");
const bcrypt = require("bcrypt");
const Message = require("../Schema/Message")
const cron = require('node-cron');
// const app = express();
const router = express.Router();
const { body, validationResult } = require("express-validator");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

let hardcodedUser = {
  email: "capobrain@gmail.com",
  password: "1234",
};
const createAdmin = async () => {
  const hashPassword = await bcrypt.hash(hardcodedUser.password, 10)
  const checkEmail = await Signup.findOne({ email: hardcodedUser.email })
  if (checkEmail) {
    return;
  }
  await Signup.create({
    email: hardcodedUser.email,
    password: hashPassword
  })
}
createAdmin()
// Route 1: signup user using: api/auth/signUpUser
router.post(
  "/signUpUser", async (req, res) => {
    try {
      const { name, email, schoolName, number, password } = req.body;
      const checkEmail = await Signup.findOne({ email })
      if (checkEmail) {
        return res.json({ message: "user already exists", user: checkEmail })
      }
      let hashPassword;
      if (password) {
        hashPassword = await bcrypt.hash(password, 10)
      }
      const user = await Signup.create({
        name,
        email,
        number,
        schoolName,
        password: hashPassword
      });
      res.json(user);
    } catch (error) {
      res.status(500).send("Internal error occured");
      console.log(error);
    }
  }
);
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the entered credentials match a user in the database
    const user = await Signup.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Compare the entered password with the hashed password in the database
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});
// get signUp Demo Users
router.get("/getDemoUsers", async (req, res) => {
  try {
    const allusers = await Signup.find({});
    res.json(allusers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

// Route 1: create user using: api/auth/createuser
router.post(
  "/createuser", async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, schoolname, phoneno, message } = req.body;

      const user = await User.create({
        name,
        email,
        schoolname,
        phoneno,
        message,
      });

      res.json({ user });
    } catch (error) {
      res.status(500).send("Internal error occured");
      console.log(error);
    }
  }
);

router.get("/getallusers", async (req, res) => {
  try {
    const allusers = await User.find({});
    res.json(allusers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.get("/getusers/:id", async (req, res) => {
  try {
    const getUserId = await User.findById(req.params.id)
    res.json(getUserId)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
})

router.delete("/deluser/:id", async (req, res) => {
  try {
    const getUserId = await User.findByIdAndDelete(req.params.id)
    if (!getUserId) {
      return res.status(404).json({ message: "user not found" })
    }
    res.status(200).json({ message: "successfully deleted" })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
})

router.get("/edituser/:id", async (req, res) => {
  try {
    const { name, email, schoolname, phoneno, message } = req.body;

    const newUser = {}
    if (name) {
      newUser.name = name
    }
    if (email) {
      newUser.email = email
    }
    if (schoolname) {
      newUser.schoolname = schoolname
    }
    if (phoneno) {
      newUser.phoneno = phoneno
    }
    if (message) {
      newUser.message = message
    }

    let getUserId = await User.findById(req.params.id)
    if (!getUserId) {
      return res.status(404).json({ message: "user not found" })
    }

    getUserId = await User.findByIdAndUpdate(req.params.id, { $set: newUser }, { new: true })
    res.json(getUserId)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
})
// post api start
router.post(
  "/createpost",
  [
    body("title", "Enter title"),
    body("title", "Enter category"),
    body("content", "Enter your content here"),
  ],
  upload.single("image"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, content, category, slug } = req.body;

      const post = await Post.create({
        title,
        content,
        category,
        slug,
      });

      res.json({ post });
    } catch (error) {
      res.status(500).send("Internal error occured");
      console.log(error);
    }
  }
);
// post api end
router.get("/postsCount", async (req, res) => {
  try {
    const postCount = await Post.countDocuments({})
    res.json(postCount)
  } catch (error) {
    console.log(error.message);
    res.status(500).send("internal server error");
  }
})
// get post start
router.get("/getallposts", async (req, res) => {
  try {
    const allposts = await Post.find({});
    res.json(allposts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("internal server error");
  }
});
// get post end

// get post id start
router.get("/getpost/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});
// get post id end

// Change Password
router.put("/changepassword", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    // Check if the entered credentials match the user in the database
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Old password incorrect" });
    }

    // Hash the new password and update it in the database
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("Internal server error");
  }
});

// Change Password
router.get("/getposts/:id", async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.delete("/delposts/:id", async (req, res) => {
  try {
    const posts = await Post.findByIdAndDelete(req.params.id);
    if (!posts) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.put("/editposts/:id", async (req, res) => {
  try {
    const { title, category, content, slug } = req.body;
    const newPosts = {};
    if (title) {
      newPosts.title = title;
    }
    if (category) {
      newPosts.category = category;
    }
    if (content) {
      newPosts.content = content;
    }
    if (slug) {
      newPosts.slug = slug;
    }

    let posts = Post.findById(req.params.id);
    if (!posts) {
      res.status(404).send({ message: "Posts not find" });
    }
    posts = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: newPosts },
      { new: true }
    );
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

// Category
router.post(
  "/category",
  [body("category", "Enter category")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { category } = req.body;
    const Allategory = await Category.create({
      category,
    });
    res.json(Allategory);
  }
);

router.get("/getcategory", async (req, res) => {
  try {
    const Getcategory = await Category.find({});
    res.json(Getcategory);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("internal Server Error");
  }
});

router.get("/getcategory/:id", async (req, res) => {
  try {
    const Getcategory = await Category.findById(req.params.id);
    if (!Getcategory) {
      return res.status(404).json({ message: "Dont find Category" });
    }
    res.json(Getcategory);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.delete("/delcategory/:id", async (req, res) => {
  try {
    const Getcategory = await Category.findByIdAndDelete(req.params.id);
    if (!Getcategory) {
      return res.status(404).json({ message: "Dont find Category" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.put("/editcategory/:id", async (req, res) => {
  try {
    const { category } = req.body;
    const newCat = {};
    if (category) {
      newCat.category = category;
    }

    let cat = await Category.findById(req.params.id);
    if (!cat) {
      res.status(404).json("Category not found");
    }

    cat = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: newCat },
      { new: true }
    );
    res.json(cat);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.get("/categoryCount", async (req, res) => {
  try {
    const categoryCount = await Category.countDocuments({})
    res.json(categoryCount)
  } catch (error) {
    console.log(error.message);
    res.status(500).send("internal server error");
  }
})

const randomId = () => {
  const randomTicket = Math.floor(Math.random() * 10000)
  return `TICKET-${randomTicket}`
}

router.post("/support", async (req, res) => {
  try {
    const { title, message, subject, severity, userId } = req.body
    const ticketId = randomId()
    const ticket = await Support.create({
      title,
      message,
      subject,
      severity,
      ticketId,
      userId,
      status: "Open"
    })
    res.json({ message: "ticketGenerated", ticket })
  } catch (error) {
    console.log(error)
    res.status(500).send("internal server error occured")
  }
})
router.get("/tickets", async (req, res) => {
  try {
    const tickets = await Support.find().populate("userId", "email name")
    res.json(tickets)
  } catch (error) {
    console.log(error)
    res.status(500).send("internal server error occured")
  }
})
router.get("/getTicket/:id", async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id).populate("userId", "email name")
    if (!ticket) {
      return res.status(400).json({ message: "not found any ticket against this id" })
    }
    res.json(ticket)
  } catch (error) {
    console.log(error)
    res.status(500).send("internal server error occured")
  }
})
router.put("/updateTicket/:id", async (req, res) => {
  try {
    const { status } = req.body
    const ticket = await Support.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!ticket) {
      return res.status(400).json({ message: "not found any ticket against this id" })
    }
    res.json(ticket)
  } catch (error) {
    console.log(error)
    res.status(500).send("internal server error occured")
  }
})
router.delete("/delTicket/:id", async (req, res) => {
  try {
    const ticket = await Support.findByIdAndDelete(req.params.id)
    if (!ticket) {
      return res.status(400).json({ message: "not found any ticket against this id" })
    }
    res.json(ticket)
  } catch (error) {
    console.log(error)
    res.status(500).send("internal server error occured")
  }
})

// message apis
router.post("/createMessage", async (req, res) => {
  try {
    const { message, userId, ticketId, messageStatus } = req.body
    const createMessage = await Message.create({
      message,
      userId,
      ticketId,
      messageStatus,
    })
    res.json(createMessage)
  } catch (error) {
    console.log(error)
    return res.status(500).send("internal server error")
  }
})
router.get("/messages", async (req, res) => {
  try {
    const message = await Message.find().populate("userId", "email name").populate("ticketId", "ticketId subject")
    res.json(message)
  } catch (error) {
    console.log(error)
    return res.status(500).send("internal server error")
  }
})
// Function to update ticket status to "Close" if the last message is older than 5 hours
const updateTicketStatus = async () => {
  try {
    console.log(new Date().toLocaleString(), new Date().getTimezoneOffset());

    const now = new Date()
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 1000)

    const tickets = await Support.find({ status: "Open" })
    for (const ticket of tickets) {
      const lastMessage = await Message.findOne({ ticketId: ticket._id }).sort({ createAt: -1 })
      if (lastMessage && lastMessage.createAt < fiveHoursAgo) {
        await Support.updateOne({ _id: ticket._id }, { status: "Close" })
      }
    }
  } catch (error) {
    console.log("Error updating ticket status:", error)
  }
}

// Schedule the function to run every hour
cron.schedule("*/1 * * * *", updateTicketStatus)

module.exports = router;
