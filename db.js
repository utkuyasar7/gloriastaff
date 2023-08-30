const mongoose = require('mongoose');



async function connectToDatabase() {
  try {
    await mongoose.connect(`mongodb+srv://utkuyasar2003:1234@cluster0.46jqw4w.mongodb.net/`, {
      
    });
    console.log('Bağlantı başarılı!');
  } catch (error) {
    console.error('Bağlantı hatası:', error.message);
   
  }
}

module.exports = connectToDatabase;