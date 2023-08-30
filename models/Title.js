const mongoose = require("mongoose")

const TitleSchema = mongoose.Schema({
    name : String
})

module.exports = mongoose.model("title",TitleSchema)