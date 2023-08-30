const mongoose = require("mongoose")
const UserSchema = mongoose.Schema({
    UserFullName : String,
    Password : Number,
    Title : {
        type : mongoose.Schema.Types.ObjectId,
        ref :"title",
        required:true
    },
    isAdmin : {
        type : Boolean,
        required:true}

    
})

module.exports = mongoose.model("User",UserSchema)