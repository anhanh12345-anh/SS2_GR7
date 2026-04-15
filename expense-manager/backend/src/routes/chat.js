const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai"); // Sử dụng cách này là chuẩn nhất cho các version mới

// Khởi tạo OpenAI
// Biến môi trường OPENAI_API_KEY phải được nạp từ server.js bằng require('dotenv').config()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "fake_key_for_debug",
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    // Kiểm tra nếu người dùng không gửi tin nhắn
    if (!message) {
      return res.status(400).json({ error: "Tin nhắn không được để trống" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Bạn là trợ lý tài chính cá nhân. Trả lời ngắn gọn, dễ hiểu.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (err) {
    // In ra lỗi chi tiết ở console để bạn dễ debug
    console.error("OpenAI Error:", err.message);

    res.status(500).json({
      success: false,
      message: "AI lỗi rồi 😢",
      // Đừng trả về err chi tiết cho client để bảo mật
    });
  }
});

module.exports = router;