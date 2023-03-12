import React, { useState } from "react";

export default function FileTranscript() {
    
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('file', selectedFile);
        const response = await fetch('http://127.0.0.1:5000/generateTranscriptFromFile', {
            method: 'POST',
            body : formData,
        });
        console.log(response);
    };
    
    
    return(
        <div className="FileTranscript--Div">
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileSelect} />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
}