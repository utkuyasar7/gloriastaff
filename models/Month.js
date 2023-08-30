const mongoose = require("mongoose");

// Ay modeli için sema tanımı
const monthSchema = new mongoose.Schema(
    {
        // İsteğe bağlı, ayı tanımlayıcı bir alan ekleyebilirsiniz
        monthIdentifier: {
            type: String,
            required: true,
            unique: true,
        },
        // Ayın başlangıç ve bitiş tarihleri
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        // İsteğe bağlı, ilişkilendirilmiş verilerin ID'lerini içerebilirsiniz
        tips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tip" }],
        // Diğer istediğiniz alanları buraya ekleyebilirsiniz
    },
    { timestamps: true } // Oluşturulma ve güncelleme tarihleri için otomatik alanlar
);

// Ay modelini oluşturun
const Month = mongoose.model("Month", monthSchema);

module.exports = Month;
