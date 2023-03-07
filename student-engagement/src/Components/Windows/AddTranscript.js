import React, {useState} from "react";
import {useNavigate } from "react-router-dom";

import closeIcon from "../../icons/close.png"

export default function AddTranscript(props){

    // useState hooks to manage component state
    const [transcript, setTranscript] = useState("");
    const [isTranscriptValid, setIsTranscriptValid] = useState(false);
    const [isManual, setIsManual] = useState(true);

    // Destructuring props to access functions passed down from the parent component
    const {setShowAddWindow, updateTable} = props;

    // Function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();

        // Check if transcript is valid before making API call
        checkTranscript(transcript);
        
        if(isTranscriptValid){
            fetch('http://127.0.0.1:5000/transcripts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "transcript": transcript
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                updateTable();
                setShowAddWindow(false);
            })
            .catch(error => {
                console.error(error);
            })
        }
    }

    // Function to check if the transcript is valid
    const checkTranscript = (transcript) => {
        if (transcript.length === 0){
            setIsTranscriptValid(false);
        }
        else{
            setIsTranscriptValid(true);
        }
    }

    // Function to handle transcript input change
    const handleTranscriptChange = (event) => {
        setTranscript(event.target.value);
        checkTranscript(event.target.value);
    }

    // Function to close the modal
    const handleClose = () => {
        setShowAddWindow(false);
    }

    // Functions to handle switching between manual and automatic transcript creation
    const handleManual = () => {
        setIsManual(true);
    }

    const handleAutomatic = () => {
        setIsManual(false);
    }

    // Hook to access the navigate function from React Router
    const navigate = useNavigate();

    // Function to open an audio stream on the server and redirect to the recording page
    const openAudioStream = () => {
        fetch('http://127.0.0.1:5000/openAudioStream', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Redirect to the recording page with the audio stream ID received from the server
            navigate(`/Recording/${data.audioStreamID}?port=${data.port}`);
        })
        .catch(error =>{
            console.error(error);
        });
    }

    // Return the JSX for the AddTranscript component
    return (
        <div className="modal-overlay">
            <div className="modal">
                <header className="subHeader">
                    <div className="subNav--container">
                        <nav className="subNav">
                            <ul>
                                <li className="subNav--Link" onClick={handleManual}>Manual</li>
                                <li>|</li>
                                <li className="subNav--Link" onClick={handleAutomatic}>Automatic</li>
                            </ul>
                        </nav>
                    </div>
                </header>
                <div className="EditWindow">
                    <img className="CloseButton" src = {closeIcon} alt = "Close" onClick = {handleClose} />
                    {isManual && (
                        <form onSubmit={handleSubmit} className="EditWindow--Form">
                            <textarea value={transcript} onChange = {handleTranscriptChange} onBlur={checkTranscript} className={isTranscriptValid ? "valid" : "invalid"}></textarea>
                            <button type="submit">Create Transcript</button>
                        </form>
                    )}

                    {!isManual && (
                        <div>
                            <button className="AddTranscript--RecordAudio" onClick={openAudioStream}>Start Recording Speech</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )


}