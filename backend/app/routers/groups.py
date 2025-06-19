from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from sqlalchemy.orm import joinedload
from app.models import Group
from sqlalchemy import select
from collections import defaultdict
from sqlalchemy import delete
from sqlalchemy.orm import selectinload

from ..database import AsyncSessionLocal
from .. import models, schemas

router = APIRouter(prefix="/groups", tags=["groups"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("")
async def get_all_groups(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Group).options(joinedload(Group.users))
    )
    groups = result.unique().scalars().all()
    return [
        {
            "id": group.id,
            "name": group.name,
            "users": [{"id": u.id, "name": u.name, "email": u.email} for u in group.users]
        }
        for group in groups
    ]

@router.post("", response_model=schemas.GroupRead)
async def create_group(group: schemas.GroupCreate, db: AsyncSession = Depends(get_db)):
    db_group = models.Group(name=group.name)
    db.add(db_group)
    await db.flush()  # get db_group.id

    # Add users to group
    for user_id in group.user_ids:
        await db.execute(
            models.group_users.insert().values(group_id=db_group.id, user_id=user_id)
        )
    await db.commit()

    # Fetch user_ids for response
    await db.refresh(db_group)
    stmt = select(models.group_users.c.user_id).where(models.group_users.c.group_id == db_group.id)
    result = await db.execute(stmt)
    user_ids = [row.user_id for row in result.fetchall()]
    return schemas.GroupRead(id=db_group.id, name=db_group.name, user_ids=user_ids)

@router.get("/{group_id}", response_model=dict)
async def get_group(group_id: int, db: AsyncSession = Depends(get_db)):
    group = await db.get(models.Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Get users in group
    stmt = select(models.group_users.c.user_id).where(models.group_users.c.group_id == group_id)
    result = await db.execute(stmt)
    user_ids = [row.user_id for row in result.fetchall()]
    users = (await db.execute(select(models.User).where(models.User.id.in_(user_ids)))).scalars().all()
    user_list = [{"id": u.id, "name": u.name, "email": u.email} for u in users]

    # Get total expenses for group
    expenses = (await db.execute(select(models.Expense).where(models.Expense.group_id == group_id))).scalars().all()
    total_expenses = sum(e.amount for e in expenses)

    # --- per‑user paid & share ------------------------------------------
    user_paid: dict[int, float] = defaultdict(float)
    user_share: dict[int, float] = defaultdict(float)

    for exp in expenses:
        user_paid[exp.paid_by] += exp.amount

        # fetch splits for this expense
        splits = (await db.execute(
            select(models.Split).where(models.Split.expense_id == exp.id)
        )).scalars().all()

        if splits:  # percentage / custom
            for s in splits:
                share_amt = s.amount or (exp.amount * (s.percentage or 0) / 100)
                user_share[s.user_id] += share_amt
        else:       # equal split fallback
            equal = exp.amount / len(users)
            for u in users:
                user_share[u.id] += equal

    summary = []
    for u in users:
        paid = round(user_paid[u.id], 2)
        share = round(user_share[u.id], 2)
        balance = round(paid - share, 2)
        summary.append({
            "id": u.id,
            "name": u.name,
            "paid": paid,
            "share": share,
            "balance": balance,
        })

    return {
        "id": group.id,
        "name": group.name,
        "users": [{"id": u.id, "name": u.name, "email": u.email} for u in users],
        "total_expenses": round(total_expenses, 2),
        "summary": summary,
    }

@router.delete("/{group_id}")
async def delete_group(group_id: int, db: AsyncSession = Depends(get_db)):
    # Eagerly load users to avoid lazy loading issue
    result = await db.execute(
        select(models.Group).options(selectinload(models.Group.users)).where(models.Group.id == group_id)
    )
    group = result.scalars().first()

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Delete all related expenses and splits
    expenses = (await db.execute(
        select(models.Expense).where(models.Expense.group_id == group_id)
    )).scalars().all()

    for expense in expenses:
        await db.execute(
            delete(models.Split).where(models.Split.expense_id == expense.id)
        )
        await db.delete(expense)

    # Now it's safe to clear users because users are preloaded
    group.users.clear()

    await db.delete(group)
    await db.commit()

    return {"detail": "Group deleted"}
