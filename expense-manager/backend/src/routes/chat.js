const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const { protect } = require("../middleware/auth");
const Transaction = require("../models/Transaction");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "fake_key_for_debug",
});

const queryTransactionData = async (message, userId) => {
  try {
    const msg = message.toLowerCase();
    const now = new Date();
    let startDate, endDate;
    let query = { user: userId, type: 'expense' };

    if (msg.includes('tháng vừa rồi') || msg.includes('tháng trước') || msg.includes('tháng trước đó')) {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (msg.includes('tháng này') || msg.includes('tháng hiện tại')) {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (msg.includes('tuần vừa rồi') || msg.includes('tuần trước')) {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      query.date = { $gte: startDate, $lte: now };
    } else if (msg.includes('hôm qua')) {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (msg.includes('hôm nay') || msg.includes('ngày hôm nay')) {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (msg.includes('tiêu gì nhiều nhất') || msg.includes('danh mục nào nhiều') || msg.includes('chi nhiều nhất')) {
      const transactions = await Transaction.find(query).populate('category');
      
      if (transactions.length === 0) {
        return `Không có dữ liệu chi tiêu cho khoảng thời gian này.`;
      }

      const byCategory = {};
      transactions.forEach(t => {
        const catName = t.category?.name || 'Khác';
        byCategory[catName] = (byCategory[catName] || 0) + t.amount;
      });

      const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
      const top = sorted.slice(0, 5);

      let response = `Danh mục chi tiêu nhiều nhất:\n`;
      top.forEach((item, idx) => {
        response += `${idx + 1}. ${item[0]}: ${item[1].toLocaleString('vi-VN')}₫\n`;
      });

      const total = transactions.reduce((sum, t) => sum + t.amount, 0);
      response += `\nTổng cộng: ${total.toLocaleString('vi-VN')}₫`;
      return response;
    } else if (msg.includes('tổng') || msg.includes('cộng') || msg.includes('bao nhiêu')) {
      const transactions = await Transaction.find(query);
      
      if (transactions.length === 0) {
        return `Không có dữ liệu chi tiêu cho khoảng thời gian này.`;
      }

      const total = transactions.reduce((sum, t) => sum + t.amount, 0);
      const timeRange = startDate ? `(${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')})` : '';
      return `Tổng chi tiêu ${timeRange}: ${total.toLocaleString('vi-VN')}₫`;
    }

    return null; 
  } catch (err) {
    console.error("Query error:", err.message);
    return null;
  }
};

const getBotResponse = (message, isFirstMessage = false) => {
  const msg = message.toLowerCase().trim();
  
  if (isFirstMessage && ['xin chào', 'hello', 'hi', 'chào', 'hey'].some(k => msg.includes(k))) {
    return null; 
  }

  const responses = {
    budget: {
      keywords: ['ngân sách', 'budget', 'chi tiêu', 'chi', 'tiêu'],
      replies: [
        'Để quản lý ngân sách hiệu quả:\n1. Đặt giới hạn chi tiêu hàng tháng\n2. Theo dõi các danh mục chi tiêu\n3. So sánh với các tháng trước\n4. Điều chỉnh nếu vượt quá',
        'Bạn có thể:\n• Tạo ngân sách theo danh mục (ăn uống, di chuyển, giải trí)\n• Đặt cảnh báo khi sắp hết ngân sách\n• Xem báo cáo chi tiêu chi tiết'
      ]
    },
    saving: {
      keywords: ['tiết kiệm', 'tiết kiệ', 'saving', 'save'],
      replies: [
        'Mẹo tiết kiệm:\n1. Đặt mục tiêu tiết kiệm rõ ràng\n2. Tự động chuyển tiền vào tài khoản riêng\n3. Theo dõi tiến độ hàng tháng\n4. Cắt bớt chi tiêu không cần thiết',
        'Để tiết kiệm:\n• Ghi nhớ mục tiêu của bạn\n• Loại bỏ chi tiêu xung quanh\n• Dùng ứng dụng để theo dõi'
      ]
    },
    income: {
      keywords: ['thu nhập', 'income', 'lương', 'kiếm', 'earning'],
      replies: [
        'Quản lý thu nhập:\n• Ghi lại tất cả nguồn thu nhập\n• Phân chia chi tiêu và tiết kiệm\n• Theo dõi dòng tiền hàng tháng\n• Lên kế hoạch tài chính hợp lý',
        'Thu nhập cần được quản lý tốt:\n1. Canh toàn bộ chi tiêu hàng tháng\n2. Để dành cho khẩn cấp\n3. Đầu tư nếu có thể'
      ]
    },
    debt: {
      keywords: ['nợ', 'debt', 'vay', 'cho vay'],
      replies: [
        'Quản lý nợ:\n• Ghi lại tất cả khoản vay/cho vay\n• Theo dõi hạn thanh toán\n• Lên kế hoạch trả nợ\n• Sử dụng mục Quản Lý Nợ trong ứng dụng',
        'Để quản lý nợ tốt:\n1. Biết chính xác nợ bao nhiêu\n2. Lên lịch trả nợ\n3. Ưu tiên trả nợ có lãi cao'
      ]
    },
    reminder: {
      keywords: ['nhắc nhở', 'reminder', 'lịch', 'calendar', 'sự kiện'],
      replies: [
        'Tính năng Nhắc Nhở giúp bạn:\n• Đặt lịch hạn chót thanh toán\n• Nhắc nhở các khoản chi tiêu định kỳ\n• Quản lý công việc tài chính\n• Xem lịch cá nhân',
        'Bạn có thể:\n• Tạo nhắc nhở mới cho mỗi công việc\n• Kéo thả để thay đổi ngày\n• Đánh dấu hoàn thành'
      ]
    },
    features: {
      keywords: ['tính năng', 'features', 'làm gì', 'có thể làm', 'support'],
      replies: [
        'Ứng dụng này hỗ trợ:\n• Quản lý giao dịch chi/thu\n• Lập ngân sách theo danh mục\n• Quản lý nợ và cho vay\n• Nhắc nhở theo lịch\n• Báo cáo chi tiêu chi tiết\n• Chat với trợ lý AI (bạn)',
        'Các tính năng chính:\n✓ Dashboard tổng quan\n✓ Theo dõi chi tiêu\n✓ Quản lý ngân sách\n✓ Lịch nhắc nhở\n✓ Báo cáo tài chính'
      ]
    },
    help: {
      keywords: ['giúp', 'help', 'hỏi', 'hướng dẫn', 'guide', 'cách'],
      replies: [
        'Tôi có thể giúp bạn với:\n• Câu hỏi về quản lý chi tiêu\n• Mẹo tiết kiệm tiền\n• Cách sử dụng các tính năng\n• Lập kế hoạch tài chính\nHỏi tôi bất cứ điều gì!',
        'Hãy hỏi tôi về:\n• Ngân sách & chi tiêu\n• Tiết kiệm & đầu tư\n• Quản lý nợ\n• Lập kế hoạch tài chính'
      ]
    },
    default: {
      replies: [
        'Tôi hiểu bạn muốn biết điều gì đó. Có thể bạn hỏi về ngân sách, chi tiêu, hoặc các tính năng khác của ứng dụng?',
        'Bạn có thể hỏi tôi về quản lý chi tiêu, tiết kiệm, ngân sách, hoặc bất kỳ chủ đề tài chính nào khác! 💰'
      ]
    }
  };

  for (const [category, data] of Object.entries(responses)) {
    if (category === 'default') continue;
    if (data.keywords && data.keywords.some(k => msg.includes(k))) {
      const reply = data.replies[Math.floor(Math.random() * data.replies.length)];
      return reply;
    }
  }

  // Default response
  const defaultReply = responses.default.replies[Math.floor(Math.random() * responses.default.replies.length)];
  return defaultReply;
};

router.post("/", protect, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;
    const isFirstMessage = req.body.isFirstMessage || false;

    if (!message) {
      return res.status(400).json({ error: "Tin nhắn không được để trống" });
    }

    console.log("Chat message:", message, "from user:", userId);

    // Try to query real data first
    const dataResponse = await queryTransactionData(message, userId);
    if (dataResponse) {
      return res.json({
        success: true,
        reply: dataResponse,
      });
    }

    // Try OpenAI if API key exists
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "fake_key_for_debug") {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
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
          max_tokens: 500,
        });

        console.log("OpenAI Response success");

        return res.json({
          success: true,
          reply: completion.choices[0].message.content,
        });
      } catch (openaiErr) {
        console.error("OpenAI error, using fallback:", openaiErr.message);
      }
    }

    // Fallback: use local bot response
    const reply = getBotResponse(message, isFirstMessage);
    if (!reply) {
      return res.json({
        success: true,
        reply: "Tôi không hiểu câu hỏi của bạn. Hãy thử hỏi về chi tiêu, ngân sách, hoặc các danh mục chi tiêu của bạn.",
      });
    }

    res.json({
      success: true,
      reply: reply,
    });

  } catch (err) {
    console.error("Chat Error:", err.message);

    const reply = getBotResponse(req.body.message);
    res.json({
      success: true,
      reply: reply || "Có lỗi xảy ra. Vui lòng thử lại.",
    });
  }
});

module.exports = router;
