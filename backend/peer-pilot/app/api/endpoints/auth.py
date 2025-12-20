from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import (
    get_password_hash,
    get_user_by_email,
    verify_password,
    create_access_token,
)
from app.models.student import Student
from app.models.user import User
from app.schemas.auth import LoginRequest, Token, CurrentUser, UserCreate, UserRead
from app.core.security import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = User(
        email=user_in.email,
        name=user_in.name,
        role=user_in.role,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.flush()  # чтобы получить user.id, не коммитя транзакцию

    # 3. Если это студент — обязателен линк на сущность Student
    if user.role == "student":
        # пробуем найти уже существующего студента с таким email
        student = (
            db.query(Student)
            .filter(Student.email == user.email)
            .first()
        )

        # если нет — создаём нового
        if not student:
            student = Student(
                name=user.name,
                email=user.email,
                team_id=None,   # пока не в команде
                is_rep=False,   # по умолчанию не реп
            )
            db.add(student)
            db.flush()  # получаем student.id

        # линкуем пользователя к студенту
        user.student_id = student.id

    # 4. Фиксируем всё в базе
    db.commit()
    db.refresh(user)

    return user

@router.post("/login", response_model=Token)
def login_json(data: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token)


@router.post("/token", response_model=Token)
def login_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        {"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=CurrentUser)
def read_me(current_user=Depends(get_current_user)):
    return CurrentUser(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        studentId=current_user.student_id,
        teamId=current_user.team_id,
    )
