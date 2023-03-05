import { useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RecordingSetup() {
  const navigate = useNavigate();

  // Function to open an audio stream on the server and redirect to the recording page
  const openAudioStream = () => {
      fetch('http://127.0.0.1:5000/openAudioStream', {
          method: 'POST'
      })
      .then(response => response.json())
      .then(data => {
          console.log(data);
          // Redirect to the recording page with the audio stream ID received from the server
          navigate(`/Recording/${data.audioStreamID}`);
      })
      .catch(error =>{
          console.log(error);
      });
  }
  
  return (
    <div className="RecordingSetup">
      {/* Display text on the recording setup page */}
      This is the recording setup page
      
      {/* Button to start recording */}
      <button className="RecordingSetup--Button" onClick={openAudioStream}>Start Recording</button>
      
    </div>
  );
}
  

