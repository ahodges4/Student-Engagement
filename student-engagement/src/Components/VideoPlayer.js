import React, {useState, useRef} from "react";
import ReactPlayer from 'react-player';
import QuestionGrid from "./QuestionGrid";
import screenfull from "screenfull";


//Import Icons
import rewindIcon from "../icons/back.png";
import playIcon from "../icons/play.png";
import pauseIcon from "../icons/pause.png";
import nextIcon from "../icons/next.png";
import volumeIcon from "../icons/volume.png";
import fullscreenIcon from "../icons/fullscreen.png";

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
    const [fullscreen, setFullscreen] = useState(false);
    const [showVolumeControl, setShowVolumeControl] = useState(false);
    const [volume, setVolume] = useState(0.5);

    // This function is called whenever the video player's progress changes
    const handleProgress = (state) => {
        setCurrentTime(state.playedSeconds);
        if (currentTime > nextQuestion) {
            // Update the next question time
            setNextQuestion(parseInt(nextQuestion) + parseInt(questionInterval));
            // Send a request to fetch questions for the next transcript
            fetch(`http://127.0.0.1:5000/generateTranscriptQuestions/${transcripts[currentTranscript]["id"]}}`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                // Update states to show the questions and store the current time
                setCurrentTranscript(currentTranscript+1);
                if (Object.keys(data).length !== 0 && data["error"] == null) {
                    setIsPlaying(false);
                    setShowQuestions(true);
                    setQuestionData(data);
                    setResumeFrom(currentTime); // store current time before showing questions
                }
            })
            .catch(error => {
                // Handle errors by logging them
                console.error(error);
            })
            
            
        }
    }

    // This function is called when the video's duration is available
    const handleDuration = (duration) => {
        setDuration(duration);
    }

    // These functions are called when the user clicks the play or pause button
    const handlePlay = () => {
        setIsPlaying(true);
        //playerRef.current?.getInternalPlayer()?.playVideo();
    }

    const handlePause = () => {
        setIsPlaying(false);
        //playerRef.current?.getInternalPlayer()?.pauseVideo();
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

    // This function is called when the user clicks the back button
    const restartVideo = () => {
        setCurrentTranscript(0);
        setResumeFrom(0);
        setNextQuestion(questionInterval);
        playerRef.current?.seekTo(0);
    }

    const handleGoToNextInterval = () => {
        playerRef.current?.seekTo(nextQuestion);
    }

    const handleVolumeChange = (event) => {
        const volume = parseFloat(event.target.value);
        setVolume(volume);
    }



    return (
        <div> 
            {!showQuestions && (
                <div className="VideoPlayer--VideoElement">
                    <ReactPlayer
                        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        ref={playerRef}
                        onReady={resumeVideo}
                        onProgress={handleProgress}
                        onDuration={handleDuration}
                        controls={false}
                        playing={isPlaying}
                        volume={volume}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        onVolumeChange={handleVolumeChange}
                        className="react-player"
                    />
                    <div className="VideoPlayer--Controls">
                        <img className="VideoPlayer--RestartVideo" src={rewindIcon} alt="Rewind" onClick={restartVideo} />
                        {isPlaying ? (
                            <img className="VideoPlayer--PauseVideo" src={pauseIcon} alt="Pause" onClick={handlePause} />
                            ) : (
                            <img className="VideoPlayer--PlayVideo" src={playIcon} alt="Play" onClick={handlePlay} />  
                        )}
                        <img className="VideoPlayer--NextInt" src={nextIcon} alt="Next" onClick={handleGoToNextInterval} />
                        
                        <div style={{position: 'relative'}}>
                            <img className="VideoPlayer--VolumeButton" src={volumeIcon} alt="Volume" onClick={() => setShowVolumeControl(!showVolumeControl)} />
                            {showVolumeControl && (
                                <div className="VideoPlayer--VolumeControl">
                                    <input type="range" min={0} max={1} step={0.1} value={volume} onChange={handleVolumeChange} />
                                </div>
                            )}
                        </div> 
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
