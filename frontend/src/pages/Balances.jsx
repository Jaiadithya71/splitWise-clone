import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const Balances = () => {
  const { userId } = useParams();
  const [userBalances, setUserBalances] = useState([]);
  const [userName, setUserName] = useState("");
  const [totals, setTotals] = useState({ owes: 0, owed: 0 });

  const getBalances = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/users/${userId}/balances`);
      const data = res.data.balances;
      setUserBalances(data);

      let owes = 0;
      let owed = 0;

      for (const group of data) {
        for (const s of group.settlements) {
          if (s.from.id === parseInt(userId)) {
            setUserName(s.from.name);
            owes += s.amount;
          }
          if (s.to.id === parseInt(userId)) {
            setUserName(s.to.name);
            owed += s.amount;
          }
        }
      }

      setTotals({ owes, owed });
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  };

  useEffect(() => {
    getBalances();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">
        Balances for {userName || `User ID ${userId}`}
      </h2>

      <div className="mb-6 flex justify-center gap-6 text-lg">
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
          You owe: ₹{totals.owes.toFixed(2)}
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded shadow">
          You're owed: ₹{totals.owed.toFixed(2)}
        </div>
      </div>

      {userBalances.length === 0 ? (
        <p className="text-gray-600 text-center">No balances found.</p>
      ) : (
        userBalances.map((group, i) => (
            <div key={i} className="mb-6 border rounded-lg p-4 bg-gray-50 shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-indigo-700">
                Group:{" "}
                <Link
                    to={`/group-summary/${group.group_id}`}  // ✅ changed from /group/:id to /group-summary/:id
                    className="underline hover:text-indigo-900"
                >
                    {group.group_name || `#${group.group_id}`}
                </Link>
                </h3>

            {group.settlements.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No dues in this group.</p>
            ) : (
              <ul className="space-y-2">
                {group.settlements.map((s, j) => (
                  <li key={j} className="text-gray-800">
                    <span className="font-medium text-red-600">{s.from.name}</span>{" "}
                    owes{" "}
                    <span className="font-medium text-green-600">{s.to.name}</span>{" "}
                    <span className="text-gray-700 font-semibold">₹{s.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Balances;
