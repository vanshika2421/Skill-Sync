const mongoose = require("mongoose");
const { type } = require("os");

const messageSchema = mongoose.Schema({
    to: { type: String,required: true },
    from: { type: String, required: true },
    content: [{ 
        type:String
    }],  // Array of message objects with content and timestamp
    lastUpdated: { type: Date, default: Date.now } // Timestamp of the last update
})

module.exports=mongoose.model('messages',messageSchema);