import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Create a new group
export const createGroup = (data) => api.post("/groups", data);

// Get group details
export const getGroupDetails = (groupId) => api.get(`/groups/${groupId}`);

// Add an expense to a group
export const addExpense = (groupId, data) =>
  api.post(`/groups/${groupId}/expenses`, data);

// Get group balances
export const getGroupBalances = (groupId) =>
  api.get(`/groups/${groupId}/balances`);

// Get user balances
export const getUserBalances = (userId) =>
  api.get(`/users/${userId}/balances`);

// Create a new user
export const createUser = (data) => api.post("/users", data);

export const getUsers = () => api.get("/users");
export const getAllGroups = () => api.get("/groups");
export const deleteGroup = (groupId) => api.delete(`/groups/${groupId}`);
