import React, { useState } from "react"

// This imports the VideoPlayer and VideoPlayerSetup components from their respective files
import VideoPlayer from "../Components/VideoPlayer"
import VideoPlayerSetup from "../Components/VideoPlayerSetup";
import LectureTable from "../Components/LectureTable";

// This function component is the main component for playing back a lecture
export default function LecturePlayback(){

    // These state variables are used to determine if the user has entered their lecture information yet and
    // to keep track of the interval and transcript data for the lecture
    const [isSetup, setIsSetup] = useState(false);
    const [transcripts, setTranscripts] = useState({});
    const [data, setData] = useState();

    // This function is called when the user submits the lecture information form
    const handleSubmit = (data, transcripts) => {

        // Assign data about lecture to data state
        setData(data);

        // This creates an empty array to store the transcript data for each individual transcript
        const newTranscripts = [];

        // This loop sends a request to the server for each transcript in the list with a 2 second delay between each request
        transcripts.forEach((transcript, index) => {
            setTimeout(() => {
                fetch('http://127.0.0.1:5000/transcripts/' + transcript)
                .then(response => response.json())
                .then(data => {
                    console.log(data);

                    // This adds the returned transcript data to the newTranscripts array and checks if all
                    // transcripts have been returned. If all transcripts have been returned, the newTranscripts
                    // array is set as the state for the transcripts variable.
                    newTranscripts.push(data);
                    if (newTranscripts.length === transcripts.length) {
                        setTranscripts(newTranscripts);
                    }
                })
                .catch(error => {
                    console.error(error);
                });
            }, index * 100);
        });

        // This changes the isSetup state variable to true to indicate that the user has entered their lecture information
        setIsSetup(true);
    }


    // This returns the VideoPlayer component if the user has entered their lecture information or the VideoPlayerSetup
    // component if they have not yet done so.
    return(
        <div>
            {isSetup ? (
                <VideoPlayer lecture_data={data} transcripts={transcripts} />
                ) : (
                <LectureTable onSubmit={handleSubmit} />
                )}
        </div>
    )
}
