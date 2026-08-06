from fastapi import APIRouter, Response, Query
from typing import Optional
import json

router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Reports"]
)

@router.get("/")
def get_reports(
    zone: Optional[str] = Query(None),
    vehicleType: Optional[str] = Query(None),
    incidentType: Optional[str] = Query(None)
):
    return {
        "totalIncidents": 24,
        "activeIncidents": 5,
        "totalMissions": 18,
        "successfulMissions": 14,
        "avgResponseTime": "12.4 min",
        "incidents": [],
        "vehicles": [],
        "hospitals": []
    }

@router.get("/export")
def export_reports(
    format: Optional[str] = Query("csv"),
    zone: Optional[str] = Query(None)
):
    file_name = f"DSRS_VANET_Report_{zone or 'AllZones'}.csv"
    csv_content = "Incident ID,Type,Location,Zone,Severity,Status,Timestamp\n"
    csv_content += '"INC-101","Flood - Zone 3","Anna Nagar, Chennai","Zone 1 (North)","HIGH","ACTIVE","12:31 PM"\n'
    csv_content += '"INC-102","Fire - Industrial Area","Manali, Chennai","Zone 1 (North)","HIGH","ACTIVE","12:28 PM"\n'
    
    if format == 'csv':
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{file_name}"'}
        )
    return {"message": "Export file generated successfully", "fileName": file_name}