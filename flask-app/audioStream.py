import asyncio
import websockets
import numpy as np
import pyaudio
import wave
import functools


class AudioStream:
    def __init__(self, transcriptID):
        self.transcriptID = transcriptID
        self.buffer = []
        self.running = True
        self.transcript = []

    def transcribe_file(self, speech_file):
        """Transcribe the given audio file."""
        from google.cloud import speech
        import io

        client = speech.SpeechClient.from_service_account_json(
            "C:/Users/Monke/speechrecognition-key.json")

        with io.open(speech_file, "rb") as audio_file:
            content = audio_file.read()

        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="en-GB",
            enable_automatic_punctuation=True,
        )

        response = client.recognize(config=config, audio=audio)

        # Each result is for a consecutive portion of the audio. Iterate through
        # them to get the transcripts for the entire audio file.
        for result in response.results:
            # The first alternative is the most likely one for this portion.
            print("Transcript: {}".format(result.alternatives[0].transcript))
            self.transcript.append(result.alternatives[0].transcript)
        print(self.transcript)

    async def audio_stream(self, websocket, path):
        while self.running:
            print("Awaiting Data")
            audio_data = await websocket.recv()
            decoded_data = np.frombuffer(audio_data, np.int16)

            self.buffer.append(decoded_data)

            if len(self.buffer) == 3:
                audio = np.concatenate(self.buffer)

                with wave.open("output"+str(self.transcriptID)+".wav", "wb") as f:
                    f.setnchannels(1)
                    f.setsampwidth(2)
                    f.setframerate(16000)
                    f.writeframes(audio.tobytes())
                print("Saved")
                self.transcribe_file("output"+str(self.transcriptID)+".wav")
                self.buffer = []

    def start(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        start_server = websockets.serve(self.audio_stream, "localhost", 8000)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()
