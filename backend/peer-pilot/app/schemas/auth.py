from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.STUDENT

class UserCreate(UserBase):
    password: str = Field(min_length=4)


class UserRead(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


class CurrentUser(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    studentId: Optional[int]
    teamId: int | None = None

    model_config = ConfigDict(from_attributes=True)
