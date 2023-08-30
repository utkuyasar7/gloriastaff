const express = require("express"),
      app = express(),
      db = require("./db")
const auth = require("./routes/auth"),
      tip = require("./routes/tip")
const cors = require('cors');


// CORS ayarlarını özelleştirme
const corsOptions = {
  origin: '*',
  methods: 'GET,POST',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); 

db()
app.use(express.json());
app.use("/auth",auth)
app.use("/tip",tip)



const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server ${PORT} numaralı portta çalışıyor.`);
});
