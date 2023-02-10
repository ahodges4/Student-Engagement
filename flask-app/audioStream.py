import asyncio
import websockets
import numpy as np
import pyaudio
import wave
import functools


class AudioStream:
    global transcriptID
    transcriptID = ""
    global transcript
    transcript = []
    global running
    running = True
    global buffer
    buffer = []

    def __init__(self, transcriptID):
        self.transcriptID = transcriptID
    global transcribe_file

    def transcribe_file(speech_file):
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
            transcript.append(result.alternatives[0].transcript)
        print(transcript)

    async def audio_stream(websocket, path):
        # Initialize the PyAudio object
        # p = pyaudio.PyAudio()

        # stream = p.open(format=p.get_format_from_width(2),
        #                 channels=1,
        #                 rate=16000,
        #                 output=True,
        #                 frames_per_buffer=1024)

        print(running)
        buffer = []
        while running:
            audio_data = await websocket.recv()
            decoded_data = np.frombuffer(audio_data, np.int16)
            # Write the audio data to the PyAudio stream

            buffer.append(decoded_data)

            if len(buffer) == 3:
                audio = np.concatenate(buffer)

                with wave.open("output"+transcriptID+".wav", "wb") as f:
                    f.setnchannels(1)
                    f.setsampwidth(2)
                    f.setframerate(16000)
                    f.writeframes(audio.tobytes())
                print("Saved")
                transcribe_file("output"+transcriptID+".wav")
                buffer = []

    start_server = websockets.serve(audio_stream, "localhost", 8000)

    asyncio.get_event_loop().run_until_complete(start_server)

    asyncio.get_event_loop().run_forever()


# TODO:

# 2. Create Rest API
