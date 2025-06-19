from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..database import AsyncSessionLocal
from .. import models, schemas

router = APIRouter(prefix="/groups/{group_id}/expenses", tags=["expenses"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/", response_model=schemas.ExpenseRead)
async def add_expense(
    group_id: int,
    expense: schemas.ExpenseCreate,
    db: AsyncSession = Depends(get_db)
):
    # Check group exists
    group = await db.get(models.Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Create Expense
    db_expense = models.Expense(
        group_id=group_id,
        paid_by=expense.paid_by,
        amount=expense.amount,
        description=expense.description,
        split_type=expense.split_type,
    )
    db.add(db_expense)
    await db.flush()  # get db_expense.id

    splits_to_create = []
    if expense.split_type == models.SplitTypeEnum.equal:
        num_splits = len(expense.splits)
        if num_splits == 0:
            raise HTTPException(status_code=400, detail="No splits provided")
        split_amount = round(expense.amount / num_splits, 2)
        for split in expense.splits:
            splits_to_create.append(
                models.Split(
                    expense_id=db_expense.id,
                    user_id=split.user_id,
                    amount=split_amount,
                    percentage=None,
                )
            )
    elif expense.split_type == models.SplitTypeEnum.percentage:
        total_percentage = sum(split.percentage or 0 for split in expense.splits)
        if abs(total_percentage - 100.0) > 0.01:
            raise HTTPException(status_code=400, detail="Percentages must sum to 100")
        for split in expense.splits:
            if split.percentage is None:
                raise HTTPException(status_code=400, detail="Each split must have a percentage")
            split_amount = round(expense.amount * split.percentage / 100, 2)
            splits_to_create.append(
                models.Split(
                    expense_id=db_expense.id,
                    user_id=split.user_id,
                    amount=split_amount,
                    percentage=split.percentage,
                )
            )
    else:
        raise HTTPException(status_code=400, detail="Invalid split_type")

    db.add_all(splits_to_create)
    await db.commit()
    await db.refresh(db_expense)

    # Prepare response
    splits_response = [
        schemas.SplitSchema(
            user_id=s.user_id,
            amount=s.amount,
            percentage=s.percentage
        ) for s in splits_to_create
    ]

    return schemas.ExpenseRead(
        id=db_expense.id,
        group_id=db_expense.group_id,
        description=db_expense.description,
        amount=db_expense.amount,
        paid_by=db_expense.paid_by,
        split_type=db_expense.split_type,
        splits=splits_response
    )