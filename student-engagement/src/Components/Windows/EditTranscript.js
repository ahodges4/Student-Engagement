import React, {useState} from "react";
import closeIcon from "../../icons/close.png"

export default function EditTranscript(props){

    // Set initial state values for transcript ID and transcript text.
    const [transcriptID, setTranscriptID] = useState(props.transcriptID);
    const [transcript, setTranscript] = useState(props.transcript);
    const [transcriptName, setTranscriptName] = useState(props.transcriptName)

    // Set initial state value for transcript validity. 
    const [isTranscriptValid, setIsTranscriptValid] = useState(true);

    // Destructure setShowEditWindow and updateTable functions from props.
    const {setShowEditWindow, updateTable} = props;

    // Define function to handle submission of transcript form.
    const handleSubmit = (event) => {
        event.preventDefault();

        // Check if the transcript is valid before submitting the form.
        if (isTranscriptValid){

            // If transcript is valid, send PUT request to update transcript on the server.
            fetch(`http://127.0.0.1:5000/transcripts/${transcriptID}`,{
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "transcript" : transcript,
                    "transcript_name" : transcriptName
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);

                // After successful update, update the table and close the edit window.
                updateTable();
                setShowEditWindow(false);
            })
            .catch(error => {
                console.error(error);
            });
        }
        else{

            // If transcript is not valid, call the checkTranscript function to update isTranscriptValid state.
            checkTranscript(transcript);
        }
    }

    // Define function to check if the transcript is valid.
    const checkTranscript = (transcript) => {

        // If transcript length is zero, set isTranscriptValid state to false.
        if (transcript.length === 0){
            setIsTranscriptValid(false);
        }else{

            // Otherwise, set isTranscriptValid state to true.
            setIsTranscriptValid(true);
        }
    }

    // Define function to handle changes to the transcript text.
    const handleTranscriptChange = (event) => {

        // Set the transcript text state to the new value.
        setTranscript(event.target.value);

        // Call the checkTranscript function to update isTranscriptValid state.
        checkTranscript(event.target.value);
    }

    const handleTranscriptNameChange = (event) => {
        setTranscriptName(event.target.value);
    }

    // Define function to handle closing the edit window.
    const handleClose = () => {
        setShowEditWindow(false);
    }
    
    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="EditWindow">
                    <img className="CloseButton" src = {closeIcon}  alt = "close" onClick = {handleClose} />
                    <form onSubmit={handleSubmit} className="EditWindow--Form">
                        <input type="text" value={transcriptName} onChange = {handleTranscriptNameChange}></input>
                        <textarea value={transcript} onChange = {handleTranscriptChange} onBlur={checkTranscript} className={isTranscriptValid ? "valid" : "invalid"}></textarea>
                        
                        <button type="submit">Update Transcript</button>
                    </form>
                </div>
            </div>
        </div>
    )
}