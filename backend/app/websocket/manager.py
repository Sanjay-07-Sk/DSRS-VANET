from fastapi import WebSocket

class ConnectionManager:

    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print("Connected Clients:", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        print("Connected Clients:", len(self.active_connections))

    async def broadcast(self, message):

        print("Broadcasting:", message)

        for connection in self.active_connections:

            await connection.send_json(message)


manager = ConnectionManager()