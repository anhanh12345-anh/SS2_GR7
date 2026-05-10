import { useEffect, useMemo, useState } from "react";
import { debtAPI } from "../services/api";
import DebtChart from "../components/charts/DebtChart";

export default function DebtPage() {
  const [debts, setDebts] = useState([]);
  const [type, setType] = useState("borrow");
  const [statusTab, setStatusTab] = useState("pending");
  const [showHistory, setShowHistory] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    personName: "",
    amount: "",
    borrowDate: "",
    dueDate: "",
  });

  // ================= FETCH =================
  const fetchDebts = async () => {

    try {
      const res = await debtAPI.getAll();
      setDebts(res.data || []);
    } catch (err) {
      console.error(err);
      setDebts([]);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  // ================= CREATE =================
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleCreate = async () => {
  console.log("CLICK CREATE");

  if (!form.personName || !form.amount) {
    console.log("Missing input");
    return;
  }

  try {
    const res = await debtAPI.create({
      personName: form.personName,
      type,
      totalAmount: Number(form.amount),
      borrowDate: form.borrowDate || getTodayDateString(),
      dueDate: form.dueDate || getTodayDateString(),
    });

    console.log("SUCCESS:", res.data);

    setForm({ personName: "", amount: "", borrowDate: "", dueDate: "" });
    fetchDebts();
  } catch (err) {
    console.error("CREATE ERROR:", err.response?.data || err.message);
    alert("Tạo nợ thất bại");
  }
};

  // ================= REPAY =================
  const handleRepay = async (debt) => {
    const amountStr = prompt("Nhập số tiền trả:");
    if (!amountStr) return;

    const amount = Number(amountStr);
    if (amount <= 0) {
      alert("Số tiền phải lớn hơn 0");
      return;
    }

    try {
      const paid = debt.paidAmount || 0;
      const remaining = debt.totalAmount - paid;

      if (amount <= remaining) {
        await debtAPI.repay(debt._id, { amount });
      } else {
        await debtAPI.repay(debt._id, { amount: remaining });

        const excess = amount - remaining;
        await debtAPI.create({
          personName: debt.personName,
          type: "lend",
          totalAmount: excess,
          dueDate: "",
        });
      }

      fetchDebts();
      alert("Trả nợ thành công");
    } catch (err) {
      console.error("REPAY ERROR:", err);
      alert("Trả nợ thất bại");
    }
  };

  // ================= UPCOMING =================
  const upcomingDueDebts = useMemo(() => {
    return debts
      .filter((d) => {
        if (d.type !== "borrow") return false;

        const paid = d.paidAmount || 0;
        const remaining = d.totalAmount - paid;
        if (remaining <= 0) return false;
        if (!d.dueDate) return false;

        const due = new Date(d.dueDate);
        const now = new Date();
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

        return diffDays >= 0 && diffDays <= 3;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [debts]);

  // ================= FILTER =================
  const filteredDebts = debts.filter((d) => {
    const matchesType = d.type === type;
    const matchesSearch = d.personName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const paid = d.paidAmount || 0;
    const remaining = d.totalAmount - paid;
    const isPaid = remaining <= 0;

    const matchesStatus =
      statusTab === "paid" ? isPaid : !isPaid;

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const createdDate = d.createdAt
      ? new Date(d.createdAt)
      : d.dueDate
      ? new Date(d.dueDate)
      : new Date();

    const isWithinMonth = createdDate > oneMonthAgo;
    const isWithinThreeMonths = createdDate > threeMonthsAgo;

    const matchesHistory = showHistory
      ? isWithinThreeMonths
      : isWithinMonth;

    return (
      matchesType &&
      matchesSearch &&
      matchesStatus &&
      matchesHistory
    );
  });

  // ================= UTIL =================
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getDaysLeft = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  // ================= UI =================
  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 28 }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
        Quản lý nợ
      </h1>

      {/* TYPE TABS */}
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

      {/* FORM */}
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
          value={form.borrowDate}
          onChange={(e) =>
            setForm({ ...form, borrowDate: e.target.value })
          }
        />
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) =>
            setForm({ ...form, dueDate: e.target.value })
          }
        />
        <button
            onClick={handleCreate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: "16px",
              fontWeight: 600,
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(99,102,241,0.3)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(99,102,241,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(99,102,241,0.3)";
            }}
          >
            <span style={{ fontSize: 18 }}>＋</span>
            Thêm
          </button>
      </div>

      {/* GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        
        {/* LEFT: CHART + UPCOMING */}
        <div>
          <DebtChart debts={debts} />

          {upcomingDueDebts.length > 0 && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                background: "#fee2e2",
              }}
            >
              <h3 style={{ color: "#dc2626", marginBottom: 10 }}>
                Sắp đến hạn trả
              </h3>

              {upcomingDueDebts.map((d) => {
                const paid = d.paidAmount || 0;
                const remaining = d.totalAmount - paid;
                const daysLeft = getDaysLeft(d.dueDate);

                return (
                  <div
                    key={d._id}
                    style={{
                      padding: 10,
                      marginBottom: 8,
                      background: "#fff",
                      borderRadius: 8,
                    }}
                  >
                    <strong>{d.personName}</strong>
                    <p>
                      {remaining.toLocaleString("vi-VN")}₫
                    </p>
                    <span style={{ color: "red", fontSize: 12 }}>
                      {daysLeft === 0
                        ? "Hôm nay"
                        : `Còn ${daysLeft} ngày`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: LIST */}
        <div>
          <input
                placeholder="Tìm theo tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  outline: "none",
                  fontSize: "14px",
                  marginBottom: "12px",
                  background: "var(--input-bg)",
                  color: "var(--text-color)",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#6366f1";
                  e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "12px 0" }}>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { key: "pending", label: "Chưa trả", color: "#3b82f6" },
                { key: "paid", label: "Đã trả", color: "#22c55e" },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setStatusTab(btn.key)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: "1px solid #e5e7eb",
                    background:
                      statusTab === btn.key ? btn.color : "transparent",
                    color: statusTab === btn.key ? "#fff" : "var(--text-color)",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                border: "1px solid #e5e7eb",
                background: showHistory ? "#8b5cf6" : "transparent",
                color: showHistory ? "#fff" : "var(--text-color)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Lịch sử
            </button>
          </div>

          {filteredDebts.length === 0 ? (
            <p>Không có dữ liệu</p>
          ) : (
            filteredDebts.map((d) => {
  const paid = d.paidAmount || 0;
  const remaining = d.totalAmount - paid;
  const isPaid = remaining <= 0;
  const isOverdue =
    !isPaid &&
    d.dueDate &&
    new Date(d.dueDate) < new Date();

  return (
    <div
      key={d._id}
      style={{
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        background: "var(--card-bg)",
        border: isOverdue
          ? "1px solid #ef4444"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.2s ease",
      }}
    >
      {/* LEFT */}
      <div>
        <h3 style={{ marginBottom: 4, fontWeight: 600 }}>
          {d.personName}
        </h3>

        <p style={{ fontSize: 14, opacity: 0.7 }}>
          {d.type === "borrow" ? "Bạn vay" : "Cho vay"}
        </p>

        <p style={{ fontSize: 14, opacity: 0.75, marginTop: 4 }}>
          Ngày vay: {formatDate(d.borrowDate)}
          {d.dueDate ? ` • Hạn trả: ${formatDate(d.dueDate)}` : ""}
        </p>

        <p style={{ fontWeight: 700, marginTop: 4 }}>
          {isPaid
            ? `Đã vay: ${d.totalAmount.toLocaleString("vi-VN")}₫`
            : `${remaining.toLocaleString("vi-VN")}₫`}
        </p>

        {isPaid && (
          <p style={{ color: "#10b981", fontSize: 13 }}>
            Đã hoàn tất
          </p>
        )}

        {isOverdue && (
          <p style={{ color: "#ef4444", fontSize: 13 }}>
            ⚠ Quá hạn
          </p>
        )}
      </div>

      {/* RIGHT */}
      {!isPaid && (
        <button
          onClick={() => handleRepay(d)}
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 500,
            boxShadow: "0 4px 10px rgba(34,197,94,0.3)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
          }}
        >
          Trả
        </button>
      )}
    </div>
  );
})
          )}
        </div>
      </div>
    </div>
  );
}