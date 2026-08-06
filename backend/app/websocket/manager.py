from typing import List
from fastapi import WebSocket, WebSocketDisconnect


class ConnectionManager:
    """
    WebSocket connection manager handling client connections, disconnections,
    and thread-safe broadcasts.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """
        Accept incoming WebSocket connection and register client.
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        print("Connected Clients:", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        """
        Unregister client connection.
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print("Connected Clients:", len(self.active_connections))

    async def broadcast(self, message: dict):
        """
        Broadcast message to all connected clients. Automatically removes stale connections.
        """
        print("Broadcasting:", message)
        disconnected_clients = []

        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                disconnected_clients.append(connection)

        # Cleanup stale connections
        for conn in disconnected_clients:
            self.disconnect(conn)


manager = ConnectionManager()