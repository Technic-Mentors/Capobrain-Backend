const mongoose = require("mongoose")
const { Schema } = mongoose

const messageSchema = new Schema({
    message: {
        type: String,
        // required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Signup"
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Support"
    },
    createAt:{
        type: Date,
        default: Date.now()
    }
})
module.exports = mongoose.model("Message", messageSchema)