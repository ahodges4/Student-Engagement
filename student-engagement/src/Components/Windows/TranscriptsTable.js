import React, { useState, useEffect } from "react";

export default function TranscriptsTable(props) {
    // Destructure props
    const { transcriptIDs, setTranscriptIDs, setIsTranscriptIDsValid } = props;

    // Define state variables
    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState([]);

    // Fetch transcripts data from backend on component mount
    useEffect(() => {
        if (rows.length === 0) {
            fetch(`http://127.0.0.1:5000/transcripts`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                // Select only the rows whose IDs are in transcriptIDs
                let selectedIDs = [];
                if (transcriptIDs) {
                    selectedIDs = transcriptIDs.filter((id) =>
                    data.find((obj) => obj.id === id)
                    );
                }
                
                setSelected(selectedIDs);
                setRows(data.filter((obj) => obj.transcript !== null));
            })
            .catch((error) => {
                console.error(error);
            });
        }
    }, [transcriptIDs, rows.length]);

    // Handle checkbox changes
    const handleCheckboxChange = (event) => {
        const id = Number(event.target.value);
        const isChecked = event.target.checked;
        if (isChecked) {
            // Add the selected row ID to the selected array
            setSelected([...selected, id]);
            // Add the selected row ID to the transcriptIDs array
            if (transcriptIDs) {
                setTranscriptIDs([...transcriptIDs, id]);
            }else{
                setTranscriptIDs([id]);
            }
            // Set the validity of the transcript IDs to true
            setIsTranscriptIDsValid(true);
        } else {
            // Remove the selected row ID from the selected array
            setSelected(selected.filter((s) => s !== id));
            // Remove the selected row ID from the transcriptIDs array
            setTranscriptIDs(transcriptIDs.filter((s) => s !== id));
            // If there are no transcript IDs left, set the validity of the transcript IDs to false
            if (transcriptIDs.length === 1) {
                setIsTranscriptIDsValid(false);
            }
        }
    };

    
    
    

    // Render the component
    return(
        
        <div className="EditWindow--TranscriptsTable">
            <table className="EditWindow--TranscriptsTable--Table">
                <thead>
                    <tr>
                        <th></th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Transcript</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((obj) =>(
                        <tr key={obj.id}>
                            <td>
                                <input type="checkbox" name="selectedRows" value={obj.id} checked = {selected.includes(obj.id)} onChange={handleCheckboxChange}/>
                            </td>
                            <td>{obj.id}</td>
                            <td>{obj.transcript_name}</td>
                            <td> <div className="TranscriptTable--Transcript">{obj.transcript}</div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
