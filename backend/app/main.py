from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import groups, expenses, balances, users
import asyncio
from app.init_db import init_db 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for full access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(groups.router)
app.include_router(expenses.router)
app.include_router(balances.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Splitwise clone backend running"}

@app.on_event("startup")
async def on_startup():
    await init_db()