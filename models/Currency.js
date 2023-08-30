const mongoose = require("mongoose")

const CurrencySchema = mongoose.Schema({
    name : String
})

module.exports = mongoose.model("currency",CurrencySchema)