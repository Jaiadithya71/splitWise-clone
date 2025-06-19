from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import Table, MetaData
import enum

group_users = Table(
    "group_users",
    Base.metadata,
    Column("group_id", ForeignKey("groups.id"), primary_key=True),
    Column("user_id", ForeignKey("users.id"), primary_key=True),
)

class GroupUser(Base):
    __table__ = group_users             
    group = relationship("Group", back_populates="group_links")
    user  = relationship("User",  back_populates="group_links")

class SplitTypeEnum(str, enum.Enum):
    equal = "equal"
    percentage = "percentage"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)

    groups = relationship("Group", secondary=group_users, back_populates="users")
    group_links = relationship("GroupUser", back_populates="user", cascade="all, delete-orphan")
    expenses_paid = relationship("Expense", back_populates="paid_by_user")
    splits = relationship("Split", back_populates="user")

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    users = relationship("User", secondary=group_users, back_populates="groups")
    group_links = relationship("GroupUser", back_populates="group", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="group")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    paid_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text)
    split_type = Column(Enum(SplitTypeEnum), nullable=False)

    group = relationship("Group", back_populates="expenses")
    paid_by_user = relationship("User", back_populates="expenses_paid")
    splits = relationship("Split", back_populates="expense")

class Split(Base):
    __tablename__ = "splits"
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True)

    expense = relationship("Expense", back_populates="splits")
    user = relationship("User", back_populates="splits")