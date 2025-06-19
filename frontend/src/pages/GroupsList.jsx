import React, { useEffect, useState } from "react";
import { getAllGroups, deleteGroup } from "../services/api";
import axios from "axios";

const GroupsList = () => {
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      const res = await getAllGroups();  // Add this to your api.js if not present
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
        // Check if group has any unsettled balances
        const res = await axios.get(`http://localhost:8000/groups/${groupId}/balances`);
        const settlements = res.data.settlements;

        if (settlements.length > 0) {
        alert("Cannot delete group: Some balances are still unsettled.");
        return;
        }

        // Delete the group if all balances are settled
        await deleteGroup(groupId);
        setGroups(prev => prev.filter(g => g.id !== groupId));
        alert("Group deleted successfully.");
    } catch (err) {
        console.error("Failed to delete group", err);
        alert("Failed to delete group");
    }
    };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Groups</h2>
      <ul className="space-y-4">
        {groups.map(group => (
          <li key={group.id} className="border p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-sm text-gray-600">
                  Members: {group.users.map(u => u.name).join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                onClick={() => window.location.href = `/group-summary/${group.id}`}
                className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                View Details
                </button>
                <button
                  onClick={() => window.location.href = `/group/${group.id}`}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Add Expense
                </button>
                <button
                  onClick={() => handleDelete(group.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupsList;
