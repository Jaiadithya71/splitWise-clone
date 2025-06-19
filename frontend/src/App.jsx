import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreateGroup from "./pages/CreateGroup";
import GroupDetails from "./pages/GroupDetails";
import Balances from "./pages/Balances";
import CreateUser from "./pages/CreateUser";
import GroupsList from "./pages/GroupsList";
import UsersList from "./pages/UsersList";
import GroupSummary from "./pages/GroupSummary";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <header className="bg-white shadow">
          <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Splitwise Clone</h1>
            <nav className="flex flex-wrap gap-4 text-sm font-medium">
              <Link to="/create-user" className="hover:text-indigo-600">Create User</Link>
              <Link to="/" className="hover:text-indigo-600">Create Group</Link>
              <Link to="/groups" className="hover:text-indigo-600">Groups</Link>
              <Link to="/balances" className="hover:text-indigo-600">View Balances</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<CreateGroup />} />
            <Route path="/group/:id" element={<GroupDetails />} />
            <Route path="/balances" element={<UsersList />} />
            <Route path="/balances/:userId" element={<Balances />} />
            <Route path="/create-user" element={<CreateUser />} />
            <Route path="/groups" element={<GroupsList />} />
            <Route path="/group-summary/:id" element={<GroupSummary />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
