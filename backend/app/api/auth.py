"""
Northgate AI Stock Predictor - Authentication Router
===================================================
Provides user registration, JWT login, instant Demo Trader access,
and token session validation.
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.models.schemas import (
    UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse
)
from app.core.security import verify_password, create_access_token, decode_access_token
from app.db.database import (
    get_user_by_email, get_user_by_id, create_user
)

router = APIRouter(prefix="/auth", tags=["User Authentication & Sessions"])

def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """
    Extracts and validates JWT Bearer token from Authorization header.
    Returns user dict if valid; None if absent or invalid (allowing seamless guest fallback).
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split("Bearer ", 1)[1].strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    try:
        user_id = int(payload["sub"])
        return get_user_by_id(user_id)
    except Exception:
        return None

def require_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Strict dependency requiring authenticated user."""
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication token required or expired.")
    return user

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegisterRequest):
    """
    Register a new personal trading account with private $100,000 virtual balance.
    """
    existing = get_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    try:
        user = create_user(
            email=req.email,
            password=req.password,
            full_name=req.full_name,
            role="trader"
        )
        token = create_access_token(data={"sub": str(user["id"]), "email": user["email"]})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                full_name=user["full_name"],
                role=user["role"],
                created_at=user["created_at"]
            )
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest):
    """
    Authenticate an existing user with email and password.
    """
    user = get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    if not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = create_access_token(data={"sub": str(user["id"]), "email": user["email"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"],
            created_at=user["created_at"]
        )
    )

@router.post("/demo", response_model=TokenResponse)
def login_demo():
    """
    Instant 1-Click login as Demo Institutional Trader ($100k Sandbox).
    Zero friction for presentations, evaluations, and grading.
    """
    demo_user = get_user_by_email("demo@northgate.ai")
    if not demo_user:
        demo_user = create_user(
            email="demo@northgate.ai",
            password="demotrader2026",
            full_name="Demo Institutional Trader",
            role="demo"
        )
    
    token = create_access_token(data={"sub": str(demo_user["id"]), "email": demo_user["email"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=demo_user["id"],
            email=demo_user["email"],
            full_name=demo_user["full_name"],
            role=demo_user["role"],
            created_at=demo_user["created_at"]
        )
    )

@router.get("/me", response_model=UserResponse)
def get_me(user: dict = Depends(require_current_user)):
    """
    Retrieve authenticated user's profile details.
    """
    return UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        created_at=user["created_at"]
    )
