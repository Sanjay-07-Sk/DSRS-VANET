from fastapi import APIRouter, status, Depends
from app.services.dashboard_service import (
    dashboard,
    statistics,
    live
)
from app.middleware.auth import get_current_user

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_user)]
)


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="Get Full Dashboard Data",
    description="Returns complete lists of ambulances, hospitals, emergencies, and missions."
)
def home():
    """
    Get full system dashboard snapshot.
    """
    return dashboard()


@router.get(
    "/statistics",
    status_code=status.HTTP_200_OK,
    summary="Get Dashboard Statistics",
    description="Returns aggregated metrics including available ambulances, pending emergencies, and active missions."
)
def stats():
    """
    Get system metric summary.
    """
    return statistics()


@router.get(
    "/live",
    status_code=status.HTTP_200_OK,
    summary="Get Live Tracking Data",
    description="Returns active locations of ambulances and emergencies for live tracking."
)
def live_dashboard():
    """
    Get live tracking data.
    """
    return live()