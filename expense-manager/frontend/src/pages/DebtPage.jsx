import { useEffect, useState } from "react";
import { debtAPI } from "../services/api";
import DebtChart from "../components/charts/DebtChart";


export default function DebtPage() {

  const [debts, setDebts] = useState([]);
  const [type, setType] = useState("borrow");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    personName: "",
    amount: "",
    dueDate: "",
  });


  const fetchDebts = async () => {
  
    try {
      const res = await debtAPI.getAll({ type });
      setDebts(res.data || []);
    } catch (err) {
      console.error(err);
      setDebts([]);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [type]);

  const handleCreate = async () => {
    if (!form.personName || !form.amount) return;

    await debtAPI.create({
      userId: "1",
      personName: form.personName,
      type,
      totalAmount: Number(form.amount),
      dueDate: form.dueDate,
    });

    setForm({ personName: "", amount: "", dueDate: "" });
    fetchDebts();
  };

  const handleRepay = async (id) => {
    const amount = prompt("Nhập số tiền trả:");
    if (!amount) return;

    await debtAPI.repay(id, { amount: Number(amount) });
    fetchDebts();
  };

  const filteredDebts = debts.filter((d) =>
    d.personName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="debt-container">
      <h1 className="debt-title">Quản lý nợ</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={type === "borrow" ? "tab active borrow" : "tab"}
          onClick={() => setType("borrow")}
        >
          Bạn vay
        </button>
        <button
          className={type === "lend" ? "tab active lend" : "tab"}
          onClick={() => setType("lend")}
        >
          Cho vay
        </button>
      </div>

      {/* Search */}
      <input
        className="search"
        placeholder="Tìm theo tên..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Form */}
      <div className="form-card">
        <input
          placeholder="Tên người"
          value={form.personName}
          onChange={(e) =>
            setForm({ ...form, personName: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Số tiền"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) =>
            setForm({ ...form, dueDate: e.target.value })
          }
        />
        <button className="btn-add" onClick={handleCreate}>
          + Thêm
        </button>
      </div>

      {/* Chart */}
      <DebtChart debts={debts} />

      {/* List */}
      {filteredDebts.length === 0 ? (
        <p className="empty">Chưa có khoản nợ nào</p>
      ) : (
        <div className="debt-list">
          {filteredDebts.map((d) => {
            const paid = d.paidAmount || 0;
            const remaining = d.totalAmount - paid;

            const due = d.dueDate ? new Date(d.dueDate) : null;
            const isOverdue = due && due < new Date();
            const isPaid = d.status === "paid";

            return (
              <div className="debt-card" key={d._id}>
                <div>
                  <h3>{d.personName}</h3>
                  <p className="amount">
                    Còn lại: {remaining.toLocaleString()}₫
                  </p>
                  <p
                    className={`status ${
                      isPaid
                        ? "paid"
                        : isOverdue
                        ? "overdue"
                        : "pending"
                    }`}
                  >
                    {isPaid
                      ? "✔ Đã trả"
                      : isOverdue
                      ? "⚠ Quá hạn"
                      : "⏳ Chưa trả"}
                  </p>
                </div>

                {!isPaid && (
                  <button
                    className="btn-repay"
                    onClick={() => handleRepay(d._id)}
                  >
                    Trả
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}