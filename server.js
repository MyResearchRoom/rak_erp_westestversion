const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require('./config/database');
const PORT = process.env.PORT || 9001;
const cookieParser = require('cookie-parser');
const app = express(); 
const routes = require("./routes");

app.use(express.json());
app.use(cookieParser());


const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use(routes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected ✅');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Unable to connect to DB:', err);
  }
})();
