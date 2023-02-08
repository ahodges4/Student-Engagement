import React, { useState } from "react";
import useWebSocket from "react-use-websocket";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import io from 'socket.io-client';


export default function ReturnField(){
    const [socketUrl, setSocketUrl] = useState("ws://localhost:8000/");
    const [isRecording, setIsRecording] = useState(false);

    const {sendMessage, socketMessage} = useWebSocket(socketUrl);
    let recordAudio;

    const socketio = io();
    const socket = socketio.on('connect', function() {
        console.log("Connected");
    });

    const handleStartRecording = () => {
        navigator.getUserMedia({
            audio: true
        }, function(stream) {
                recordAudio = RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm',
                sampleRate: 44100,
                desiredSampRate: 44100,
                
                recorderType: StereoAudioRecorder,
                numberOfAudioChannels: 1,


                //1)
                // get intervals based blobs
                // value in milliseconds
                // as you might not want to make detect calls every seconds
                timeSlice: 4000,

                //2)
                // as soon as the stream is available
                ondataavailable: function(blob) {
                    sendMessage(blob);
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