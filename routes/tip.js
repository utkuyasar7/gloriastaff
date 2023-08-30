const express = require("express");
const router = express.Router();
const Currency = require("../models/Currency");
const moment = require("moment-timezone");
const Tip = require("../models/Tip");
const Month = require("../models/Month");
const mongoose = require("mongoose");
const auth0 = require("../middleware/authcontroller");

router.get("/currency", auth0, async (req, res) => {
    try {
        const allcurrency = await Currency.find();
        res.status(200).json(allcurrency);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/createcurrency", auth0, async (req, res) => {
    try {
        const { name } = req.body;

        const newCurrency = new Currency({
            name,
        });

        const savedCurrency = await newCurrency.save();

        res.status(201).json(savedCurrency);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post("/", auth0, async (req, res) => {
  try {
      const { Amount, Currency } = req.body;
      const User = req._id;

      const today = moment().startOf("day");
      let newMonth;

      if (today.date() >= 16) {
          newMonth = await Month.findOne({ monthIdentifier: moment(today).format("YYYY-MM") });
          if (!newMonth) {
              newMonth = await Month.create({
                  monthIdentifier: moment(today).format("YYYY-MM"),
                  startDate: moment(today).date(16).startOf("day"),
                  endDate: moment(today).add(1, "months").date(15).endOf("day"),
              });
          }
      } else {
          newMonth = await Month.findOne({ monthIdentifier: moment(today).subtract(1, "months").format("YYYY-MM") });
          if (!newMonth) {
              newMonth = await Month.create({
                  monthIdentifier: moment(today).subtract(1, "months").format("YYYY-MM"),
                  startDate: moment(today).subtract(1, "months").date(16).startOf("day"),
                  endDate: moment(today).date(15).endOf("day"),
              });
          }
      }

      const newTip = new Tip({
          Amount,
          Currency,
          User,
          Date: today,
          NewMonthTable: newMonth._id,
      });

      const savedTip = await newTip.save();

      const populatedTip = await Tip.findById(savedTip._id)
          .populate("Currency", "name")
          .populate("User", "UserFullName");

      res.status(201).json(populatedTip);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});


router.get("/getcurrentmonth", auth0, async(req,res)=>{
  const today = moment().startOf("day");

  try {
    let currentMonthData;

    if (today.date() >= 16) {
      const currentMonth = moment(today).format("YYYY-MM");
      currentMonthData = await Month.findOne({ monthIdentifier: currentMonth });
    } else {
      const previousMonth = moment(today).subtract(1, "months").format("YYYY-MM");
      currentMonthData = await Month.findOne({ monthIdentifier: previousMonth });
    }

    if (currentMonthData) {
      res.status(200).json(currentMonthData);
    } else {
      res.status(404).json({ message: "Geçerli ay bulunamadı" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.get("/aylik/:monthId", auth0, async (req, res) => {
    try {
        const monthId = req.params.monthId;

        const monthData = await Month.findById(monthId);

        if (monthData) {
            const tips = await Tip.find({
                Date: {
                    $gte: monthData.startDate,
                    $lte: monthData.endDate,
                },
            })
            .populate("Currency", "name")
            .populate("User", "UserFullName");

            res.status(200).json(tips);
        } else {
            res.status(404).json({ message: "Ay verileri bulunamadı." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
});

router.get("/kurtoplami/:currencyId", auth0, async (req, res) => {
    try {
        const currencyId = req.params.currencyId;

        const kurtoplami = await Tip.find({ Currency: currencyId });

        const toplamkur = kurtoplami.reduce(
            (total, tip) => total + tip.Amount,
            0
        );

        res.json({ toplamkur });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası.", error });
    }
});
router.get("/gecmisaylar", auth0, async (req, res) => {
  try {
    const today = moment().startOf("day");
    const pastMonths = [];

    for (let i = 0; i <= 12; i++) {
      const monthDate = moment(today).subtract(i, "months");
      const monthIdentifier = monthDate.format("YYYY-MM");

      const monthData = await Month.findOne({ monthIdentifier });
      if (monthData) {
        pastMonths.push(monthData);
      }
    }

    res.status(200).json(pastMonths.reverse()); // Geçmiş ayları tarihsel sırayla göstermek için reverse() kullanıyoruz
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});
router.get("/ayliktoplamlar/:monthId", auth0, async (req, res) => {
  try {
    const monthId = req.params.monthId;

    if (!mongoose.Types.ObjectId.isValid(monthId)) {
      return res.status(400).json({ message: "Geçersiz monthId parametresi." });
    }

    console.log("Month ID:", monthId); // Test: Month ID'yi consola yazdır

    const monthData = await Month.findById(monthId);
    if (!monthData) {
      return res.status(404).json({ message: "Ay verileri bulunamadı." });
    }

    console.log("Month Data:", monthData); // Test: Month verilerini consola yazdır

    const tips = await Tip.find({
      Date: {
        $gte: monthData.startDate,
        $lte: monthData.endDate,
      },
    })
    .populate("Currency", "name")
    .populate("User", "UserFullName");

    console.log("Tips:", tips); // Test: Tips verilerini consola yazdır

    const userTotals = {};

    const conversionRateToTL = (amount, currencyName) => {
      const exchangeRates = {
        usd: 26.71,
        Euro: 29.18,
        // Diğer döviz kurları da eklenebilir
      };

      if (exchangeRates.hasOwnProperty(currencyName)) {
        const rate = exchangeRates[currencyName];
        return amount * rate;
      } else {
        console.error("Döviz kuru bulunamadı");
        return 0;
      }
    };

    tips.forEach((tip) => {
      const convertedAmount = conversionRateToTL(tip.Amount, tip.Currency.name);

      console.log("Converted Amount:", convertedAmount); // Test: Converted Amount'ı consola yazdır

      if (userTotals.hasOwnProperty(tip.User.UserFullName)) {
        userTotals[tip.User.UserFullName] += convertedAmount;
      } else {
        userTotals[tip.User.UserFullName] = convertedAmount;
      }
    });

    console.log("User Totals:", userTotals); // Test: User Totals'ı consola yazdır

    const userTotalEntries = Object.entries(userTotals)
      .map(([user, total]) => ({ user, total }))
      .sort((a, b) => b.total - a.total);

    console.log("User Total Entries:", userTotalEntries); // Test: User Total Entries'ı consola yazdır

    res.status(200).json({ userTotals: userTotalEntries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.get("/ayliktoplam/:monthId", auth0, async (req, res) => {
  try {
    const monthId = req.params.monthId;

    if (!mongoose.Types.ObjectId.isValid(monthId)) {
      return res.status(400).json({ message: "Geçersiz monthId parametresi." });
    }

    const monthData = await Month.findById(monthId);
    if (!monthData) {
      return res.status(404).json({ message: "Ay verileri bulunamadı." });
    }

    const tips = await Tip.find({
      Date: {
        $gte: monthData.startDate,
        $lte: monthData.endDate,
      },
    }) .populate("Currency", "name")
    .populate("User", "UserFullName");;

    const conversionRateToTL = (amount, currencyName) => {
      const exchangeRates = {
        usd: 26.71,
        Euro: 29.18,
        // Diğer döviz kurları da eklenebilir
      };

      if (exchangeRates.hasOwnProperty(currencyName)) {
        const rate = exchangeRates[currencyName];
        return amount * rate;
      } else {
        console.error("Döviz kuru bulunamadı");
        return 0;
      }
    };

    const totalTipAmount = tips.reduce((total, tip) => {
      const convertedAmount = conversionRateToTL(tip.Amount, tip.Currency.name);
      return total + convertedAmount;
    }, 0);

    res.status(200).json({ totalTipAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});


module.exports = router;
