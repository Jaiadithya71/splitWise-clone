from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Union
import enum

class SplitTypeEnum(str, enum.Enum):
    equal = "equal"
    percentage = "percentage"

class UserCreate(BaseModel):
    name: str
    email: str

class UserRead(BaseModel):
    name: str
    email: str

    class Config:
        orm_mode = True

class GroupCreate(BaseModel):
    name: str
    user_ids: List[int]

class GroupRead(BaseModel):
    id: int
    name: str
    user_ids: List[int]

    class Config:
        orm_mode = True

class SplitSchema(BaseModel):
    user_id: int
    amount: Optional[float] = None
    percentage: Optional[float] = None

class ExpenseCreate(BaseModel):
    description: Optional[str] = None
    amount: float
    paid_by: int
    split_type: SplitTypeEnum
    splits: List[SplitSchema]

class ExpenseRead(BaseModel):
    id: int
    group_id: int
    description: Optional[str]
    amount: float
    paid_by: int
    split_type: SplitTypeEnum
    splits: List[SplitSchema]

    class Config:
        orm_mode = True