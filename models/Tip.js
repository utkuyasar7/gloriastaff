const mongoose = require("mongoose");
const moment = require("moment-timezone");

const TipSchema = mongoose.Schema({
    Amount: Number,
    Currency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "currency",
        required: true
    },
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    Date: {
        type: Date,
        default: () => moment.tz("Europe/Istanbul").toDate()
    },
    NewMonthTable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Month" // Eğer Month modeline ref değeri "Month" olarak tanımlandıysa
    }
});

module.exports = mongoose.model("Tip", TipSchema);
