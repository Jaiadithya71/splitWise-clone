from app.models import Base
from app.database import engine
import asyncio
from sqlalchemy.exc import OperationalError

async def init_db():
    retries = 10
    delay = 3
    for attempt in range(retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("✅ Database initialized")
            break
        except OperationalError:
            print(f"⏳ Waiting for DB... attempt {attempt+1}")
            await asyncio.sleep(delay)
    else:
        raise RuntimeError("❌ Could not connect to the DB after multiple retries")
