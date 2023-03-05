import React, { useState } from "react"

// This imports the VideoPlayer and VideoPlayerSetup components from their respective files
import VideoPlayer from "../Components/VideoPlayer"
import VideoPlayerSetup from "../Components/VideoPlayerSetup";

// This function component is the main component for playing back a lecture
export default function LecturePlayback(){

    // These state variables are used to determine if the user has entered their lecture information yet and
    // to keep track of the interval and transcript data for the lecture
    const [isSetup, setIsSetup] = useState(false);
    const [interval, setIntervalValue] = useState("");
    const [transcripts, setTranscripts] = useState({});

    // This function is called when the user submits the lecture information form
    const handleSubmit = (event, interval, transcripts) => {

        // This prevents the default behavior of submitting the form (i.e. refreshing the page)
        event.preventDefault();
        
        // This sets the interval state variable to the value entered by the user
        setIntervalValue(interval);

        // This splits the transcript data entered by the user into an array and removes any leading/trailing whitespace
        const transcriptArray = transcripts.split(",").filter((transcript) => transcript.trim() !== "");
        
        // This creates an empty array to store the transcript data for each individual transcript
        const newTranscripts = [];

        // This loop sends a request to the server for each transcript in the list with a 2 second delay between each request
        transcriptArray.forEach((transcript, index) => {
            setTimeout(() => {
                fetch('http://127.0.0.1:5000/transcripts/' + transcript)
                .then(response => response.json())
                .then(data => {
                    console.log(data);

                    // This adds the returned transcript data to the newTranscripts array and checks if all
                    // transcripts have been returned. If all transcripts have been returned, the newTranscripts
                    // array is set as the state for the transcripts variable.
                    newTranscripts.push(data);
                    if (newTranscripts.length === transcriptArray.length) {
                        setTranscripts(newTranscripts);
                    }
                })
                .catch(error => {
                    console.error(error);
                });
            }, index * 2000);
        });

        // This changes the isSetup state variable to true to indicate that the user has entered their lecture information
        setIsSetup(true);
    }


    // This returns the VideoPlayer component if the user has entered their lecture information or the VideoPlayerSetup
    // component if they have not yet done so.
    return(
        <div>
            {isSetup ? (
                <VideoPlayer questionInterval={interval} transcripts={transcripts} />
                ) : (
                <VideoPlayerSetup onSubmit={handleSubmit} />
                )}
        </div>
    )
}
