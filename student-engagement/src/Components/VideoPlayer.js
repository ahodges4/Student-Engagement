import React, {useState, useRef} from "react";
import ReactPlayer from 'react-player';



export default function VideoPlayer(){
    
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleProgress = (state) => {
        setCurrentTime(state.playedSeconds);
    }

    const handleDuration = (duration) => {
        setDuration(duration);
    }

    const handlePlay = () => {
        setIsPlaying(true);
        playerRef.current?.getInternalPlayer()?.playVideo();
    }

    const handlePause = () => {
        setIsPlaying(false);
        playerRef.current?.getInternalPlayer()?.pauseVideo();
    }
    
    
    return (
        <div>
            <ReactPlayer url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ" ref={playerRef} onProgress={handleProgress} onDuration={handleDuration} controls={true}/>
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
    );
}