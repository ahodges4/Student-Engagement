import React, { useState } from "react";
import useWebSocket from "react-use-websocket";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { useParams } from "react-router-dom";


import { Link } from "react-router-dom"


// Create and export a functional component called "ReturnField"
export default function ReturnField(){
    //State variables
    const [socketUrl, setSocketUrl] = useState("ws://localhost:8000/");
    const [isRecording, setIsRecording] = useState(false);

    //Custom hook from the 'react-use-websocket' library
    const {sendMessage, socketMessage} = useWebSocket(socketUrl);

    // Variables
    let recordAudio;
    const {audioStreamID} = useParams();

    //DOM elements
    const textarea = document.querySelector(".ReturnField--transcript");

    // Function that starts recording the user's audio
    const handleStartRecording = () => {
        
        // Get user's microphone access
        navigator.getUserMedia({
            audio: true
        }, function(stream) {
            // Initialize RecordRTC instance with the user's microphone stream
            recordAudio = RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/webm',
            desiredSampRate: 16000,
            
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
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    textarea.textContent = data.transcript;
                })
                .catch(error => {
                    error.error(error);
                  });
            }


        });

        recordAudio.startRecording(); // Start recording the user's audio
        
        }, function(error) {
            console.error(JSON.stringify(error));
        });
    };


    


    return(
        <div className="container">
            <div className="ReturnField--transcript" ></div>
            <button className="ReturnField--button" onClick={handleStartRecording} disabled={isRecording}>Start Recording Speech</button>
            {audioStreamID}
        </div>
    )
}





