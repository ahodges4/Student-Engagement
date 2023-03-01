import React, { useState } from "react";
import useWebSocket from "react-use-websocket";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { useParams } from "react-router-dom";


import { Link } from "react-router-dom"



export default function ReturnField(){
    const [socketUrl, setSocketUrl] = useState("ws://localhost:8000/");
    
    const [isRecording, setIsRecording] = useState(false);

    const {sendMessage, socketMessage} = useWebSocket(socketUrl);
    let recordAudio;

    const {audioStreamID} = useParams();

    const textarea = document.querySelector(".ReturnField--transcript");

    const handleStartRecording = () => {
        
        navigator.getUserMedia({
            audio: true
        }, function(stream) {
                recordAudio = RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm',
                desiredSampRate: 16000,
                
                recorderType: StereoAudioRecorder,
                numberOfAudioChannels: 1,


                // get intervals based blobs
                // value in milliseconds
                timeSlice: 5000,

                // as soon as the stream is available
                ondataavailable: function(blob) {
                    sendMessage(blob);
                    console.log(blob);

                    fetch(`http://127.0.0.1:5000/transcripts/${audioStreamID}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        textarea.value = data.transcript;
                    })
                    .catch(error => {
                        error.error(error);
                      });
                }


            });

            recordAudio.startRecording();
        }, function(error) {
            console.error(JSON.stringify(error));
        });
    };


    


    return(
        <div className="container">
            <textarea rows="10" cols="50" className="ReturnField--transcript"></textarea>
            <button className="ReturnField--button" onClick={handleStartRecording} disabled={isRecording}>Start Recording Speech</button>
            {audioStreamID}
        </div>
    )
}





/*navigator.mediaDevices.getUserMedia({audio: true, video: false}).then((stream) => {
            setIsRecording(true);
            const audioChunks = [];
            const options = {
                audioBitsPerSecond:44100
            }
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            const encoder = new TextEncoder();

            // mediaRecorder.addEventListener("dataavailable", event => {
            //     audioChunks.push(event.data);
            //     console.log(audioChunks);
            //     sendMessage(event.data);
            //     console.log(event.data.size)
            // });

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
                sendMessage(event.data);
                console.log(mediaRecorder.audioBitsPerSecond);
                
                
            });


            const stop = () => {
                const audioBlob = new Blob(audioChunks);
                console.log("stop");
                sendMessage(audioBlob);
            };

            setInterval(() => {
                mediaRecorder.requestData();
            }, 4000);
        });*/