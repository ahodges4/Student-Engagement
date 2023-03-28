import React, { useState,useEffect } from "react";
import useWebSocket from "react-use-websocket";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { useParams } from "react-router-dom";

// Create and export a functional component called "ReturnField"
export default function ReturnField(){
  
    // Variables
    const { audioStreamID } = useParams();

    const urlParams = new URLSearchParams(window.location.search);
    const portNumber = urlParams.get('port');


    // State variables
    const [socketUrl, setSocketUrl] = useState(`ws://localhost:${portNumber}`);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [recorder, setRecorder] = useState(null);


    // Custom hook from the 'react-use-websocket' library
    const { sendMessage } = useWebSocket(socketUrl);

    useEffect(() => {
        return () => {
            if (recorder) {
                recorder.stopRecording();
            }
        };
    }, [recorder]);


    useEffect(() => {
        const handleBeforeUnload = (event) => {
          event.preventDefault();
          event.returnValue = '';
          stopAudioStream();
        };
    
        const stopAudioStream = () => {
          fetch('http://127.0.0.1:5000/stopAudioStream/' + audioStreamID, {
            method: 'POST',
          });
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);
    
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
          stopAudioStream();
        };
      }, [audioStreamID]);

    // Function that starts recording the user's audio
    const handleStartRecording = async () => {
        setIsRecording(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            // Initialize RecordRTC instance with the user's microphone stream
            const recorder = RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm',
                desiredSampRate: 48000,
                recorderType: StereoAudioRecorder,
                numberOfAudioChannels: 1,
                // get intervals based blobs
                // value in milliseconds
                timeSlice: 5000,
                // As soon as the stream is available, send the blob to the server and get back the transcript
                ondataavailable: function(blob) {
                    sendMessage(blob); // Send the blob to the server
                    console.log(blob);
                    
                    // Fetch the transcript from the server and set the textarea value
                    fetch(`http://127.0.0.1:5000/transcripts/${audioStreamID}`)
                    .then((response) => response.json())
                    .then((data) => {
                        console.log(data);
                        setTranscript(data.transcript);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
                },
        });

        setRecorder(recorder);
        recorder.startRecording(); // Start recording the user's audio
      } catch (error) {
        console.error(error);
      }
    };

    // Function that stops recording the user's audio
    const handleStopRecording = () => {
      recorder.stopRecording(); // Stop recording the user's audio
      setIsRecording(false);
    };

    return (
      <div className="container">
        <div className="ReturnField--transcript">{transcript}</div>
        {isRecording ? (
          <button className="ReturnField--Stopbutton" onClick={handleStopRecording}>
            Stop Recording Speech
          </button>
        ) : (
          <button className="ReturnField--button" onClick={handleStartRecording}>
            Start Recording Speech
          </button>
        )}
        {audioStreamID}
      </div>
    );
}