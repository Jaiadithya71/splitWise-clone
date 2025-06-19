from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from collections import defaultdict

from ..database import AsyncSessionLocal
from .. import models

router = APIRouter(tags=["balances"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/groups/{group_id}/balances")
async def group_balances(group_id: int, db: AsyncSession = Depends(get_db)):
    group = await db.get(models.Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Get all expenses for the group
    expenses = (await db.execute(
        select(models.Expense).where(models.Expense.group_id == group_id)
    )).scalars().all()

    # Map: user_id -> net balance
    balances = defaultdict(float)

    for expense in expenses:
        # Paid by user
        paid_by = expense.paid_by
        amount = expense.amount

        # Get splits for this expense
        splits = (await db.execute(
            select(models.Split).where(models.Split.expense_id == expense.id)
        )).scalars().all()

        for split in splits:
            # Each user owes their split
            balances[split.user_id] -= split.amount or 0
        # The payer is owed the total amount
        balances[paid_by] += amount

    # Prepare readable balances: who owes whom
    users = (await db.execute(
        select(models.User).where(models.User.id.in_(balances.keys()))
    )).scalars().all()
    user_map = {u.id: u.name for u in users}

    # List of settlements (simplified, not optimal for minimal transactions)
    settlements = []
    creditors = []
    debtors = []
    for uid, bal in balances.items():
        if bal > 0:
            creditors.append([uid, bal])
        elif bal < 0:
            debtors.append([uid, -bal])

    i, j = 0, 0
    while i < len(debtors) and j < len(creditors):
        debtor_id, debt = debtors[i]
        creditor_id, credit = creditors[j]
        settled = min(debt, credit)
        settlements.append({
            "from": {"id": debtor_id, "name": user_map.get(debtor_id)},
            "to": {"id": creditor_id, "name": user_map.get(creditor_id)},
            "amount": round(settled, 2)
        })
        debtors[i][1] -= settled
        creditors[j][1] -= settled
        if debtors[i][1] == 0:
            i += 1
        if creditors[j][1] == 0:
            j += 1

    return {"settlements": settlements}

@router.get("/users/{user_id}/balances")
async def user_balances(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find all groups the user is in
    group_users = (await db.execute(
        select(models.GroupUser).where(models.GroupUser.user_id == user_id)
    )).scalars().all()
    group_ids = [gu.group_id for gu in group_users]

    user_balances = []

    for group_id in group_ids:
        # Get group name
        group = await db.get(models.Group, group_id)
        # Get group balances
        balances = await group_balances(group_id, db)
        # Filter settlements involving this user
        user_settlements = [
            s for s in balances["settlements"]
            if s["from"]["id"] == user_id or s["to"]["id"] == user_id
        ]
        user_balances.append({
            "group_id": group_id,
            "group_name": group.name if group else None,
            "settlements": user_settlements
        })

    return {"balances": user_balances}