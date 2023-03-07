import React, {useState} from "react";
import TranscriptsTable from "./TranscriptsTable";
import closeIcon from "../../icons/close.png"


export default function AddLecture(props){

    const [lectureTitle, setLectureTitle] = useState("");
    const [lectureURL, setLectureURL] = useState("");
    const [transcriptIDs, setTranscriptIDs] = useState([]);
    
    const [isTitleValid, setIsTitleValid] = useState(false);
    const [isURLValid, setIsURLValid] = useState(false);
    const [isTranscriptIDsValid, setIsTranscriptIDsValid] = useState(false);



    //Destructure prop object
    const {setShowAddWindow, updateTable} = props;


    const handleSubmit = (event) => {
        event.preventDefault();

        
        if (checkValid()){
            fetch('http://127.0.0.1:5000/newLecture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "lecture_title": lectureTitle,
                    "lecture_url": lectureURL,
                    "transcript_ids": transcriptIDs
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                updateTable()
                setShowAddWindow(false);
            })
            .catch(error => {
                console.error(error);
            })
        }
        else{
            checkTitleValid(lectureTitle);
            checkURLValid(lectureURL);
        }
    }


    const checkTitleValid = (title) => {
        if (title.length === 0){
            setIsTitleValid(false);
        }
        else{
            setIsTitleValid(true);
        }
    }

    const checkURLValid = (url) => {
        const urlRegex = /^(?:(?:https?|ftp):\/\/|www\.)[\w/\-?=%.]+\.[\w/\-?=%.]+$/;
        if (url.length === 0 || !urlRegex.test(url)){
            setIsURLValid(false);
        }
        else{
            setIsURLValid(true);
        }
    }

    

    const checkValid = () => {
        if (isTitleValid && isURLValid && isTranscriptIDsValid){
            return(true);
        }
        else{
            return(false);
        }
    }

    const handleTitleChange = (event) => {
        setLectureTitle(event.target.value);
        checkTitleValid(event.target.value);
        checkValid();
    }
    
    const handleURLChange = (event) => {
        setLectureURL(event.target.value);
        checkURLValid(event.target.value);
        checkValid()
    }



    const handleClose = () => {
        setShowAddWindow(false);
    }



    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="AddWindow">
                    <img className="CloseButton" src = {closeIcon} alt = "Close" onClick = {handleClose} />
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
                        <button type="submit" >Create Lecture</button>
                    </form>
                    <TranscriptsTable transcriptIDs = {transcriptIDs} setTranscriptIDs = {setTranscriptIDs} setIsTranscriptIDsValid = {setIsTranscriptIDsValid}/>
                </div>
            </div>
        </div>
    )
}