from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await manager.connect(websocket)

    print("Client Connected")

    try:
        while True:

            data = await websocket.receive_text()

            print("Received:", data)

            await websocket.send_text(f"Received: {data}")

    except WebSocketDisconnect:

        manager.disconnect(websocket)

        print("Client Disconnected")