import { useState } from "react";

export default function VideoPlayerSetup(props){

    // Destructure props object
    const { transcripts, interval, onSubmit } = props;

    // Set up state variables for transcripts and interval
    const [inputTranscripts, setInputTranscripts] = useState(transcripts);
    const [minutes , setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    // Handle transcript input change
    const handleTranscriptChange = (event) => {
        const value = event.target.value;
        // Only allow numbers and commas
        const regex = /^[\d,]*$/;
        if(regex.test(value)){
            setInputTranscripts(value);
        }   
    }

    // Handle minute input change
    const handleMinuteChange = (event) => {
        const value = event.target.value;
        // Only allow numbers
        const regex = /^\d*$/;
        if(regex.test(value)){
            setMinutes(value);
        }
    }

    // Handle second input change
    const handleSecondChange = (event) => {
        const value = event.target.value;
        // Only allow numbers
        const regex = /^\d*$/;
        if(regex.test(value)){
            setSeconds(value);
        }
    }

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();

        const totalSeconds = parseInt(minutes * 60) + parseInt(seconds);
        console.log(totalSeconds);

        props.onSubmit(event, totalSeconds, inputTranscripts);
    }

    return (
        <div className="VideoPlayerSetup--Div">
            <form onSubmit={handleSubmit} className="VideoPlayerSetup--Form">
                <h2>
                    Transcript IDs (Comma seperated)
                </h2>
                <br/>
                <input type="text" value={inputTranscripts || ""} onChange={handleTranscriptChange} ></input>
                <br/>
                <div>
                    <h2>Interval</h2>
                    <br/>
                    <div className="VideoPlayerSetup--IntervalContainer">
                        <div>
                            <label>
                                Minutes
                            </label>
                            <input type="text" className="VideoPlayerSetup--Interval" value={minutes || ""} onChange={handleMinuteChange} ></input>
                        </div>
                        <div>
                            <label>
                                Seconds
                            </label>
                            <input type="text" className="VideoPlayerSetup--Interval" value={seconds || ""} onChange={handleSecondChange} ></input>
                        </div>
                    </div>    
                    <br/>
                </div>
                <br/>
                <input type="submit" value="Submit"></input>
            </form>
        </div>
    );
}
