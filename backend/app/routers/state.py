from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import get_current_user
from app.schemas.dashboard_schema import DashboardState
from app.services.state_manager import state_manager

router = APIRouter(
	prefix="/api",
	tags=["State"],
	dependencies=[Depends(get_current_user)],
)


@router.get("/state", response_model=DashboardState, status_code=status.HTTP_200_OK)
def get_state() -> DashboardState:
	return state_manager.get_state()


@router.post("/reset", response_model=DashboardState, status_code=status.HTTP_200_OK)
def reset_state() -> DashboardState:
	return state_manager.reset()


@router.post("/demo/incident", response_model=DashboardState, status_code=status.HTTP_200_OK)
def create_demo_incident() -> DashboardState:
	return state_manager.create_incident()


@router.post("/demo/dispatch", response_model=DashboardState, status_code=status.HTTP_200_OK)
def dispatch_demo() -> DashboardState:
	try:
		return state_manager.dispatch()
	except ValueError as exc:
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/network/fail", response_model=DashboardState, status_code=status.HTTP_200_OK)
def network_fail() -> DashboardState:
	try:
		return state_manager.network_fail()
	except ValueError as exc:
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/network/offline", response_model=DashboardState, status_code=status.HTTP_200_OK)
def network_offline() -> DashboardState:
	try:
		return state_manager.network_offline()
	except ValueError as exc:
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/network/restore", response_model=DashboardState, status_code=status.HTTP_200_OK)
def network_restore() -> DashboardState:
	try:
		return state_manager.network_restore()
	except ValueError as exc:
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/sync/advance", response_model=DashboardState, status_code=status.HTTP_200_OK)
def sync_advance() -> DashboardState:
	try:
		return state_manager.sync_advance()
	except ValueError as exc:
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/movement/advance", response_model=DashboardState, status_code=status.HTTP_200_OK)
def movement_advance() -> DashboardState:
	try:
		return state_manager.advance_movement()
	except ValueError as exc:
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc