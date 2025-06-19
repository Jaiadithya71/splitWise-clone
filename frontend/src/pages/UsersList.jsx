import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const UsersList = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:8000/users"); // you'll need this route in your API
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Users</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="flex justify-between items-center border p-2 rounded">
            <span>{user.name} (ID: {user.id})</span>
            <Link
              to={`/balances/${user.id}`}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              View Balance
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
