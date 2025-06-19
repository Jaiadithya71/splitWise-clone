import React, { useEffect, useState } from "react";
import { createGroup, getUsers } from "../services/api";

const CreateGroup = () => {
  const [name, setName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedUserIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((uid) => uid !== id)
        : [...prevSelected, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGroup({
        name,
        user_ids: selectedUserIds,
      });
      alert("Group created!");
      setName("");
      setSelectedUserIds([]);
    } catch (err) {
      console.error(err);
      alert("Error creating group.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-semibold">Create Group</h2>

      <input
        type="text"
        placeholder="Group Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <div className="space-y-2">
        <p className="font-medium">Select Users:</p>
        {users.map((user) => (
          <label key={user.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              value={user.id}
              checked={selectedUserIds.includes(user.id)}
              onChange={() => handleCheckboxChange(user.id)}
              className="accent-blue-600"
            />
            <span>{user.name} (ID: {user.id})</span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Create Group
      </button>
    </form>
  );
};

export default CreateGroup;
