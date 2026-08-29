const mongoose = require("mongoose");

const Follow = new mongoose.Schema({

    followers:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: 0,
    },

    following:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: 0,
    },

});

module.exports = mongoose.model("follow",Follow);