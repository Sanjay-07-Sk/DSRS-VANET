from fastapi import APIRouter

from app.services.dashboard_service import (
    dashboard,
    statistics,
    live
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def home():

    return dashboard()


@router.get("/statistics")
def stats():

    return statistics()


@router.get("/live")
def live_dashboard():

    return live()