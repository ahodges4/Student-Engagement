import { useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";

function RecordingSetup() {
    const navigate = useNavigate();

    const openAudioStream = () => {
        fetch('http://127.0.0.1:5000/openAudioStream', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            //pass onto the next page
            navigate(`/Recording/${data.audioStreamID}`);
        })
        .catch(error =>{
            console.log(error);
        });
    }

    return (
      <div className="RecordingSetup">
        This is the recording setup page
        
        <button className="RecordingSetup--Button" onClick={openAudioStream}>Start Recording</button>
        
        
      </div>
    );
  }
  
  export default RecordingSetup;