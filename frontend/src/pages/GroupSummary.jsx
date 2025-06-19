import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const GroupSummary = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);

  const fetchGroup = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/groups/${id}`);
      setGroup(res.data);
    } catch (err) {
      console.error("Failed to fetch group details:", err);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  return group ? (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700">
        {group.name}
      </h2>

      {/* Members */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Members</h3>
        <ul className="list-disc pl-5 text-gray-700">
          {group.users.map((u) => (
            <li key={u.id}>
              {u.name} <span className="text-sm text-gray-500">({u.email})</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Totals */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Total Expenses</h3>
        <p className="text-2xl font-bold text-gray-800">
          ₹{group.total_expenses.toFixed(2)}
        </p>
      </section>

      {/* Per‑user summary table */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Per‑User Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">User</th>
                <th className="border px-3 py-2">Paid</th>
                <th className="border px-3 py-2">Share</th>
                <th className="border px-3 py-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {group.summary.map((u) => (
                <tr key={u.id} className="text-center">
                  <td className="border px-3 py-2 text-left">{u.name}</td>
                  <td className="border px-3 py-2">₹{u.paid.toFixed(2)}</td>
                  <td className="border px-3 py-2">₹{u.share.toFixed(2)}</td>
                  <td
                    className={`border px-3 py-2 font-semibold ${
                      u.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₹{u.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Nav buttons */}
      <div className="flex gap-4">
        <Link
          to={`/group/${group.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Expense
        </Link>
        <Link
          to="/groups"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Groups
        </Link>
      </div>
    </div>
  ) : (
    <p className="text-center mt-10 text-gray-600">Loading group details...</p>
  );
};

export default GroupSummary;
