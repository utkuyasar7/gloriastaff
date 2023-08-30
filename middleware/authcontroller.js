const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Erişim reddedildi. Token eksik." });
  }

  try {
    const decodedToken = jwt.verify(token.replace("Bearer ", ""), "gizliAnahtar");
    req._id = decodedToken._id; 
    next(); 
  } catch (error) {
    console.error(error); // Hata mesajını görüntüle
    res.status(401).json({ message: "Erişim reddedildi. Geçersiz token." });
  }
}

module.exports = authenticateToken;
