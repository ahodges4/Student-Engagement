import React, {useState} from "react";  // Import React and useState hook
import TranscriptsTable from "./TranscriptsTable"  // Import TranscriptsTable component
import closeIcon from "../../icons/close.png"  // Import close icon

export default function EditLecture(props){
    // Destructure props object and create state variables using useState hook
    const [lectureID, setLectureID] = useState(props.lectureID);
    const [lectureTitle, setLectureTitle] = useState(props.lectureTitle);
    const [lectureURL, setLectureURL] = useState(props.lectureURL);
    const [transcriptIDs, setTranscriptIDs] = useState(props.transcriptIDs);

    // Create state variables for form validation
    const [isValid, setIsValid] = useState(true);
    const [isTitleValid, setIsTitleValid] = useState(true);
    const [isURLValid, setIsURLValid] = useState(true);
    const [isTranscriptIDsValid, setIsTranscriptIDsValid] = useState(true);

    // Destructure setShowEditWindow and updateTable from props
    const {setShowEditWindow, updateTable} = props;

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        checkValid();  // Validate form fields
        console.log(isValid);
        if (isValid){
            // If form is valid, send PUT request to server and update table
            fetch('http://127.0.0.1:5000/changeLectureRecording', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "lecture_id": Number(lectureID),
                    "lecture_title": lectureTitle,
                    "lecture_url": lectureURL,
                    "transcript_ids": transcriptIDs
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                updateTable();
                setShowEditWindow(false);
            })
            .catch(error => {
                console.error(error);
            });
        }
        else{
            checkTitleValid(lectureTitle);  // Validate lecture title
            checkURLValid(lectureURL);  // Validate lecture URL
        }
    }

    // Validate lecture title
    const checkTitleValid = (title) => {
        if (title.length === 0){
            setIsTitleValid(false);
        }
        else{
            setIsTitleValid(true);
        }
    }

    // Validate lecture URL
    const checkURLValid = (url) => {
        const urlRegex = /^(?:(?:https?|ftp):\/\/|www\.)[\w/\-?=%.]+\.[\w/\-?=%.]+$/;
        if (url.length === 0 || !urlRegex.test(url)){
            setIsURLValid(false);
        }
        else{
            setIsURLValid(true);
        }
    }

    // Validate all form fields
    const checkValid = () => {
        if (isTitleValid && isURLValid && isTranscriptIDsValid){
            setIsValid(true);
        }
        else{
            setIsValid(false);
        }
    }

    // Handle lecture title input change
    const handleTitleChange = (event) => {
        setLectureTitle(event.target.value);
        checkTitleValid(event.target.value);  // Validate lecture title
        checkValid();  // Validate all form fields
    }
    
    // Function to handle changes to lecture URL input field
    const handleURLChange = (event) => {
        setLectureURL(event.target.value);
        checkURLValid(event.target.value);
        checkValid(); // Check if form is valid after URL is changed
    };

    // Function to handle closing of modal window
    const handleClose = () => {
        setShowEditWindow(false);
    };


    


    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="EditWindow">
                    <img className="CloseButton" src = {closeIcon} alt = "Close" onClick={handleClose}></img>
                    <form onSubmit={handleSubmit} className="EditWindow--Form">
                        <label>
                            Lecture Title:
                            <input type="text" value={lectureTitle} onChange={handleTitleChange} onBlur={checkValid} className={isTitleValid ? "valid" : "invalid"} />
                        </label>
                        <label>
                            Lecture URL:
                            <input type="text" value={lectureURL} onChange={handleURLChange} onBlur={checkValid} className={isURLValid ? "valid" : "invalid"}/>
                        </label>
                        <label>
                            Transcript IDs:
                            <input type="text" readOnly={true} value={transcriptIDs} className={isTranscriptIDsValid ? "valid" : "invalid"}/>
                        </label>
                        <button type="submit" >Update Lecture</button>
                    </form>
                    <TranscriptsTable transcriptIDs = {transcriptIDs} setTranscriptIDs = {setTranscriptIDs} setIsTranscriptIDsValid = {setIsTranscriptIDsValid}/>
                </div>
            </div>
        </div>
    )
}