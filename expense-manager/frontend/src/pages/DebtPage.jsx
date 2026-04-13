import { useEffect, useState } from "react";
import { debtAPI } from "../services/api";  
import { useAuthStore } from "../store";


export default function DebtPage() {

  const [debts, setDebts] = useState([]);
  const [type, setType] = useState("borrow");

  const [form, setForm] = useState({
    personName: "",
    amount: "",
  });

  const fetchDebts = async () => {
    try {
      const res = await debtAPI.getAll({ type });
      setDebts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [type]);

  const handleCreate = async () => {
    await debtAPI.create({
      userId: "1",
      personName: form.personName,
      type,
      totalAmount: Number(form.amount),
    });

    setForm({ personName: "", amount: "" });
    fetchDebts();
  };

  const handleRepay = async (id) => {
    const amount = prompt("Nhập số tiền trả:");
    if (!amount) return;

    await debtAPI.repay(id, { amount: Number(amount) });
    fetchDebts();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Quản lý nợ</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setType("borrow")}>
          Bạn vay
        </button>
        <button onClick={() => setType("lend")}>
          Cho vay
        </button>
      </div>

      {/* Form */}
      <div className="mb-4 flex gap-2">
        <input
          placeholder="Tên người"
          value={form.personName}
          onChange={(e) =>
            setForm({ ...form, personName: e.target.value })
          }
        />
        <input
          placeholder="Số tiền"
          type="number"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {/* List */}
      {debts.length === 0 ? (
        <p className="text-gray-500">
          Chưa có khoản nợ nào
        </p>
      ) : (
        debts.map((d) => {
          const remaining = d.totalAmount - d.paidAmount;

          return (
            <div
              key={d._id}
              className="border p-3 mb-2 rounded"
            >
              <p>{d.personName}</p>
              <p>Còn lại: {remaining}</p>
              <p>Trạng thái: {d.status}</p>

              {d.status !== "paid" && (
                <button onClick={() => handleRepay(d._id)}>
                  Trả nợ
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}