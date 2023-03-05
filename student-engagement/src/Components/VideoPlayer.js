import React, {useState, useRef} from "react";
import ReactPlayer from 'react-player';
import QuestionGrid from "./QuestionGrid";

// The VideoPlayer component accepts two props: transcripts and questionInterval
export default function VideoPlayer(props) {
    const { transcripts, questionInterval } = props;

    // Define states to manage the current time, duration, playing status, next question, current transcript, question data, and whether to show the questions
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [nextQuestion, setNextQuestion] = useState(questionInterval);
    const [currentTranscript, setCurrentTranscript] = useState(0);
    const [showQuestions, setShowQuestions] = useState(false);
    const [questionData, setQuestionData] = useState(null);
    const [resumeFrom, setResumeFrom] = useState(0); // new state to store current time before showing questions

    // This function is called whenever the video player's progress changes
    const handleProgress = (state) => {
        setCurrentTime(state.playedSeconds);
        if (currentTime > nextQuestion) {
            // Send a request to fetch questions for the next transcript
            fetch(`http://127.0.0.1:5000/generateTranscriptQuestions/${transcripts[currentTranscript]["id"]}}`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                // Update states to show the questions and store the current time
                setCurrentTranscript(currentTranscript+1);
                if (Object.keys(data).length !== 0) {
                    setIsPlaying(false);
                    setShowQuestions(true);
                    setQuestionData(data);
                    setResumeFrom(currentTime); // store current time before showing questions
                }
            })
            .catch(error => {
                // Handle errors by logging them
                console.log(error);
            })
            // Update the next question time
            setNextQuestion(parseInt(nextQuestion) + parseInt(questionInterval));
        }
    }

    // This function is called when the video's duration is available
    const handleDuration = (duration) => {
        setDuration(duration);
    }

    // These functions are called when the user clicks the play or pause button
    const handlePlay = () => {
        setIsPlaying(true);
        playerRef.current?.getInternalPlayer()?.playVideo();
    }

    const handlePause = () => {
        setIsPlaying(false);
        playerRef.current?.getInternalPlayer()?.pauseVideo();
    }

    // This function is called when the user clicks the continue button
    const handleQuestionContinue = () =>{
        setShowQuestions(false);
    }

    // This function is called when the video player is ready to play
    const resumeVideo = () => {
        playerRef.current?.seekTo(resumeFrom, 'seconds'); 
        setIsPlaying(true);
        playerRef.current?.getInternalPlayer()?.playVideo();
    }

    return (
        <div>
            {!showQuestions && (
                <div>
                    <ReactPlayer
                        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        ref={playerRef}
                        onReady={resumeVideo}
                        onProgress={handleProgress}
                        onDuration={handleDuration}
                        controls={true}
                    />
                    <div>CurrentTime: {currentTime}</div>
                    <div>Duration: {duration}</div>
                    <div>
                        {isPlaying ? (
                            <button onClick={handlePause}>Pause</button>
                            ) : (
                            <button onClick={handlePlay}>Play</button>
                        )}
                    </div>
                </div>
            )}


            {showQuestions && questionData && (
                <div>
                    <QuestionGrid questions={questionData} />
                    <button onClick={handleQuestionContinue}>Continue</button>
                </div>
            )}
        </div>
    );
}
