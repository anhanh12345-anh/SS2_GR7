const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load biến môi trường
dotenv.config();

// Kết nối database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route test
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Port
const PORT = process.env.PORT || 8000;

// Chạy server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});