import asyncio
import websockets
import numpy as np
import pyaudio


async def audio_stream(websocket, path):
    # Initialize the PyAudio object
    p = pyaudio.PyAudio()

    stream = p.open(format=p.get_format_from_width(2),
                    channels=1,
                    rate=16000,
                    output=True,
                    frames_per_buffer=1024)

    while True:
        audio_data = await websocket.recv()

        # Decode the received audio data and convert it to a NumPy array
        decoded_data = np.frombuffer(audio_data, np.int16)

        # Write the audio data to the PyAudio stream
        stream.write(audio_data)

start_server = websockets.serve(audio_stream, "localhost", 8000)

asyncio.get_event_loop().run_until_complete(start_server)

asyncio.get_event_loop().run_forever()
