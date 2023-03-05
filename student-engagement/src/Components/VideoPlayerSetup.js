import { useState } from "react";

export default function VideoPlayerSetup(props){

    // Destructure props object
    const { transcripts, interval, onSubmit } = props;

    // Set up state variables for transcripts and interval
    const [inputTranscripts, setInputTranscripts] = useState(transcripts);
    const [inputInterval, setInputInterval] = useState(interval);

    // Handle transcript input change
    const handleTranscriptChange = (event) => {
        const value = event.target.value;
        // Only allow numbers and commas
        const regex = /^[\d,]*$/;
        if(regex.test(value)){
            setInputTranscripts(value);
        }   
    }

    // Handle interval input change
    const handleIntervalChange = (event) => {
        const value = event.target.value;
        // Only allow numbers
        const regex = /^\d*$/;
        if(regex.test(value)){
            setInputInterval(value);
        }
    }

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        props.onSubmit(event, inputInterval, inputTranscripts);
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Transcripts
                <input type="text" value={inputTranscripts || ""} onChange={handleTranscriptChange} ></input>
            </label>
            <br/>
            <label>
                Interval
                <input type="text" value={inputInterval || ""} onChange={handleIntervalChange} ></input>
            </label>
            <br/>
            <button type="submit">Submit</button>
        </form>
    );
}
