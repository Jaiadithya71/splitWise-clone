import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const GroupDetails = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);

  /* expense‑form state */
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState("equal");      // equal | percentage
  const [unit, setUnit]       = useState("percentage");     // percentage | amount
  const [memberValues, setMemberValues] = useState({});     // { userId: value }

  /* --- helpers ---------------------------------------------------------- */
  const fetchGroup = async () => {
    const res = await axios.get(`http://localhost:8000/groups/${id}`);
    setGroup(res.data);
  };

  const handleMemberChange = (uid, value) =>
    setMemberValues(prev => ({ ...prev, [uid]: value }));

  const resetForm = () => {
    setDesc(""); setAmount(""); setPaidBy("");
    setMemberValues({}); setUnit("percentage"); setSplitType("equal");
  };

  /* --- submit ----------------------------------------------------------- */
  const addExpense = async e => {
    e.preventDefault();

    /* ===== validation ===== */
    if (splitType === "percentage") {
      const vals = Object.values(memberValues).map(v => parseFloat(v) || 0);

      if (unit === "percentage") {
        const pctTotal = vals.reduce((a, b) => a + b, 0);
        if (pctTotal !== 100) {
          alert(`Percentages must add up to 100 %. Current total: ${pctTotal} %`);
          return;
        }
      } else {
        const amtTotal = vals.reduce((a, b) => a + b, 0);
        if (amtTotal !== parseFloat(amount)) {
          alert(
            `Amounts must add up exactly to ₹${amount}. Current total: ₹${amtTotal}`
          );
          return;
        }
      }
    }

    /* ===== build splits array ===== */
    let splits = [];

    if (splitType === "equal") {
    const perUser = parseFloat(amount) / group.users.length;
    splits = group.users.map(u => ({
        user_id: u.id,
        amount: perUser
    }));
    }

    else if (splitType === "percentage") {
    if (unit === "percentage") {
        splits = Object.entries(memberValues).map(([uid, pct]) => ({
        user_id: parseInt(uid),
        percentage: parseFloat(pct),
        }));
    } else {
        const total = parseFloat(amount);
        splits = Object.entries(memberValues).map(([uid, val]) => ({
        user_id: parseInt(uid),
        percentage: (parseFloat(val) / total) * 100,
        }));
    }
    }

    /* ===== call backend ===== */
    await axios.post(`http://localhost:8000/groups/${id}/expenses`, {
      description: desc,
      amount: parseFloat(amount),
      paid_by: parseInt(paidBy),
      split_type: splitType,
      splits,
    });

    alert("Expense added!");
    resetForm();
    fetchGroup();
  };

  /* --- init ------------------------------------------------------------- */
  useEffect(() => { fetchGroup(); }, []);

  /* --- UI --------------------------------------------------------------- */
  return group ? (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{group.name}</h2>

      <form onSubmit={addExpense} className="space-y-4 bg-gray-50 p-4 rounded shadow">
        {/* description & amount */}
        <input value={desc} onChange={e => setDesc(e.target.value)}
               placeholder="Spend Description" className="border p-2 rounded w-full" required />
        <input value={amount} type="number"
               onChange={e => setAmount(e.target.value)}
               placeholder="Amount Spent" className="border p-2 rounded w-full" required />

        {/* paid‑by dropdown */}
        <select value={paidBy} onChange={e => setPaidBy(e.target.value)}
                className="border p-2 rounded w-full" required>
          <option value="">Paid by Whom?…</option>
          {group.users.map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.id})</option>
          ))}
        </select>

        {/* split‑type */}
        <select value={splitType} onChange={e => setSplitType(e.target.value)}
                className="border p-2 rounded w-full">
          <option value="equal">Equal</option>
          <option value="percentage">Percentage / Custom</option>
        </select>

        {/* unit‑toggle & member fields */}
        {splitType === "percentage" && (
          <>
            {/* unit toggle */}
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-1">
                <input type="radio" name="unit" value="percentage"
                       checked={unit === "percentage"}
                       onChange={() => setUnit("percentage")} />
                <span>%</span>
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="unit" value="amount"
                       checked={unit === "amount"}
                       onChange={() => setUnit("amount")} />
                <span>₹ amount</span>
              </label>
            </div>

            {/* per‑member inputs */}
            <div className="space-y-2">
              {group.users.map(u => (
                <div key={u.id} className="flex gap-2 items-center">
                  <span className="w-32">{u.name}</span>
                  <input type="number" min="0"
                         placeholder={unit === "percentage" ? "%" : "₹"}
                         value={memberValues[u.id] ?? ""}
                         onChange={e => handleMemberChange(u.id, e.target.value)}
                         className="border p-1 w-24 rounded" required />
                  <span>{unit === "percentage" ? "%" : ""}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <button type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add Expense
        </button>
      </form>
    </div>
  ) : (
    <p className="text-center mt-10">Loading…</p>
  );
};

export default GroupDetails;
