# 💸 Splitwise Clone – Neurix Full-Stack SDE Intern Project

A full-stack expense-splitting web application inspired by Splitwise. Built using FastAPI, ReactJS, TailwindCSS, Docker, and PostgreSQL.

---

 🚀 Features

- 👥 Create and manage groups with users
- ➕ Add expenses (Equal or Percentage/Amount split)
- 📊 View per-user and per-group balances
- 📈 Real-time calculation of "who owes whom"
- ❌ Prevent group deletion if balances aren't settled
- 🐳 Dockerized with PostgreSQL, FastAPI, and React

---

 🗂️ Folder Structure

splitwise-clone/
├── backend/ # FastAPI backend

│ ├── app/ # Routers, models, database, etc.

│ ├── Dockerfile
│ └── requirements.txt
│
├── frontend/ # React frontend
│ ├── src/
│ ├── Dockerfile
│ ├── package.json
│ └── tailwind.config.js
│
├── docker-compose.yml # Docker services (backend, frontend, DB)
└── README.md # Project overview

---

Getting Started:
1. Prerequisites
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

# 2. Run Locally
Clone the repository and run:

git clone https://github.com/your-username/splitwise-clone.git
cd splitwise-clone
docker-compose up --build

Then open:
Frontend: http://localhost:3000
Backend API: http://localhost:8000/docs

API Endpoints
Group APIs
POST /groups - Create a new group
GET /groups - Get all groups
GET /groups/{group_id} - Group details
POST /groups/{group_id}/expenses - Add expense to group
GET /groups/{group_id}/balances - Balances within group
DELETE /groups/{group_id} - Delete group (only if settled)

User APIs
POST /users - Create user
GET /users/{user_id}/balances - View user's balances across groups.

Functional Assumptions
No authentication system included
Users and groups are managed freely
Expenses split either equally or by custom %/₹ amount
Groups can be deleted only when all balances are cleared

Tech Stack:
| Layer            | Technology                  |
| ---------------- | --------------------------- |
| Frontend         | React, TailwindCSS          |
| Backend          | FastAPI, SQLAlchemy (async) |
| Database         | PostgreSQL                  |
| Containerization | Docker, Docker Compose      |

Deployment
All services are Dockerized.
To run everything: docker-compose up --build

Acknowledgements
Developed as part of the Neurix Full-Stack SDE Internship Assignment.

Jaiadithya A
email : jaiadithya2020@gmail.com
GitHub: github.com/your-username
