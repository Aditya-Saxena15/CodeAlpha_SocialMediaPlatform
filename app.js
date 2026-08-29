const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const User = require("./Models/User");
const Post = require("./Models/Post");
const Follow = require("./Models/Follow");
const Comment = require("./Models/Comment");
const Like = require("./Models/Like");

mongoose.connect("mongodb://127.0.0.1:27017/SocialMediaDB")
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log(err);
    });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false
}));

function IsLoggedIn(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/post", IsLoggedIn, async (req, res) => {
    try {
        const follows = await Follow.find({
            followers: req.session.userId
        });
        const followingIds = follows.map(
            follow => follow.following
        );
        followingIds.push(req.session.userId);

        const posts = await Post.find({
            user: {$in: followingIds}
        })
            .populate("user")
            .sort({ createdAt: -1 });

        const comments = await Comment.find({})
            .populate("user")
            .sort({ createdAt: 1 });

         const likes = await Like.find({});

        res.render("index.ejs", {
            posts: posts,
            comments: comments,
            likes: likes,
            sessionUserId: req.session.userId 
        });

    } catch (err) {

        console.log(err);
        res.send("Error loading posts");

    }
});

app.post("/post", IsLoggedIn, async (req, res) => {
    try {
        let newPost = new Post({
            content: req.body.content,
            user: req.session.userId,
        });

        await newPost.save();
        res.redirect("/post");
    }
    catch (err) {
        console.log(err);
        res.send("Error creating post");
    }
});

app.post("/post/:id/like", IsLoggedIn, async (req, res) => {
    try {

        const postId = req.params.id;
        const userId = req.session.userId;

        const existingLike = await Like.findOne({
            user: userId,
            post: postId
        });

        if (existingLike) {

            await Like.findByIdAndDelete(existingLike._id);

        } else {

            const newLike = new Like({
                user: userId,
                post: postId
            });

            await newLike.save();

        }

        res.redirect("/post");

    } catch (err) {

        console.log(err);
        res.send("Error liking post");

    }
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.post("/register", async (req, res) => {
    try {

        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword
        });

        await newUser.save();

        res.redirect("/login");

    } catch (err) {
        console.log(err);
        res.send("Registration failed");
    }
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.send("Invalid email or password");
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.send("Invalid email or password");
        }

        req.session.userId = user._id;

        res.redirect("/post");

    } catch (err) {
        console.log(err);
        res.send("Login failed");
    }
});

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            console.log(err);
            return res.send("Logout failed");
        }

        res.redirect("/login");
    });

});

app.get("/users", IsLoggedIn, async (req, res) => {

    try {

        const users = await User.find({
            _id: { $ne: req.session.userId }
        });

        const follows = await Follow.find({
            followers: req.session.userId
        });

        const followingIds = follows.map(follow => follow.following);

        res.render("users.ejs", {
            users,
            followingIds
        });

    } catch (err) {

        console.log(err);
        res.send("Error loading users");

    }

});

app.post("/follow/:id", IsLoggedIn, async(req,res) => {
    try{
        const followerId = req.session.userId;
        const followingId = req.params.id;

        const existfollow = await Follow.findOne({
            followers: followerId,
            following: followingId,
        });

        if(existfollow){
            return res.send("Already exist this follow");
        }
        const newFollow = new Follow({
            followers: followerId,
            following: followingId,
        });
        await newFollow.save();

        res.redirect("/users");
    }catch(err){
        console.log(err);
        res.send("Error following user");
    }
});

app.get("/profile",IsLoggedIn,async(req,res) => {
    try{
        const user = await User.findById(req.session.userId);

        const posts = await Post.find({
            user: req.session.userId,
        }).sort({ createdAt: -1});

        const followers = await Follow.countDocuments({
            following: req.session.userId,
        });

        const following = await Follow.countDocuments({
            followers: req.session.userId,
        });

        res.render("profile.ejs", {
            user,
            posts,
            followers,
            following
        });
    }
    catch(err){
        console.log(err);
        res.send("Error loading profile");
    }
});

app.get("/profile/edit", IsLoggedIn, async (req, res) => {
    try {

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.send("User not found");
        }

        res.render("editProfile.ejs", {
            user
        });

    } catch (err) {

        console.log(err);
        res.send("Error loading edit profile");

    }
});

app.post("/profile/edit", IsLoggedIn, async (req, res) => {
    try {

        const { username, email, password } = req.body;

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.send("User not found");
        }

        // Update username
        user.username = username;

        // Update email
        user.email = email;

        // Update password only if entered
        if (password && password.trim() !== "") {

            const hashedPassword = await bcrypt.hash(password, 10);

            user.password = hashedPassword;
        }

        await user.save();

        res.redirect("/profile");

    } catch (err) {

        console.log(err);
        res.send("Error updating profile");

    }
});

app.post("/post/:id/comment", IsLoggedIn, async (req, res) => {
    try {

        const postId = req.params.id;

        const newComment = new Comment({
            content: req.body.content,
            user: req.session.userId,
            post: postId
        });

        await newComment.save();

        res.redirect("/post");

    } catch (err) {

        console.log(err);
        res.send("Error creating comment");

    }
});

app.get("/post/:id/edit", IsLoggedIn, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.send("Post not found");
        }

        // Only post owner can edit
        if (post.user.toString() !== req.session.userId.toString()) {
            return res.send("You can only edit your own post");
        }

        res.render("editPost.ejs", {
            post
        });

    } catch (err) {

        console.log(err);
        res.send("Error loading edit page");

    }
});

app.post("/post/:id/delete", IsLoggedIn, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.send("Post not found");
        }

        // Only post owner can delete
        if (post.user.toString() !== req.session.userId.toString()) {
            return res.send("You can only delete your own post");
        }

        // Delete the post
        await Post.findByIdAndDelete(req.params.id);

        // Delete related comments
        await Comment.deleteMany({
            post: req.params.id
        });

        // Delete related likes
        await Like.deleteMany({
            post: req.params.id
        });

        res.redirect("/post");

    } catch (err) {

        console.log(err);
        res.send("Error deleting post");

    }
});


app.listen(8000, () => {
    console.log("server is listening to port :8000");
});
