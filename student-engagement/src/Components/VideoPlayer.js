import React, {useState, useRef} from "react";



export default function VideoPlayer(){
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    
    const handlePlay = () => {
        setIsPlaying(true);
        videoRef.current.play();
    }

    const handlePause = () => {
        setIsPlaying(false);
        videoRef.current.pause()
    }

    const handleTimeUpdate = () => {
        console.log('Current time: ', videoRef.current.currentTime);
        console.log('Duration: ', videoRef.current.duration);
    }
    
    
    return (
        <div>
            <video ref={videoRef} onTimeUpdate = {handleTimeUpdate} width = "640" height="360">
                <source src = "https://player.vimeo.com/video/783455338?h=c3a102c9fe&title=0&byline=0&portrait=0" type="video/mp4"/>
                <p>Your browser doesn't support HTML5 video.</p>
            </video>
            {isPlaying ? (
                <button onClick={handlePause}>Pause</button>
            ) : (
                <button onClick={handlePlay}>Play</button>
                )}
        </div>
    );
}