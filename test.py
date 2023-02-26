import asyncio
import websockets


async def test_connection():
    async with websockets.connect("ws://localhost:8000/") as websocket:
        await websocket.send("test")
        response = await websocket.recv()
        print(response)

asyncio.run(test_connection())
