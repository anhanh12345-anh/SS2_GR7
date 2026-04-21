import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DebtChart({ debts = [] }) {
  if (!debts || debts.length === 0) return null;

  const totalBorrow = debts
    .filter((d) => d.type === "borrow")
    .reduce(
      (sum, d) => sum + (d.totalAmount - (d.paidAmount || 0)),
      0
    );

  const totalLend = debts
    .filter((d) => d.type === "lend")
    .reduce(
      (sum, d) => sum + (d.totalAmount - (d.paidAmount || 0)),
      0
    );

  if (totalBorrow === 0 && totalLend === 0) {
    return (
      <div className="text-center text-gray-400 mb-6">
        Chưa có dữ liệu biểu đồ
      </div>
    );
  }

  const data = [
    { name: "Bạn vay", value: totalBorrow },
    { name: "Cho vay", value: totalLend },
  ];

  const COLORS = ["#3b82f6", "#22c55e"];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
      <h2 className="font-semibold mb-2">Tổng quan</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" outerRadius={100}>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value.toLocaleString('vi-VN') + '₫', '']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}