import React, {useState, useEffect} from "react";
import QuestionGrid from "./QuestionGrid";

// Import icons
import editIcon from "../icons/edit.png";
import tickIcon from "../icons/check.png";
import deleteIcon from "../icons/delete.png";
import plusIcon from "../icons/plus.png";

// Import component for editing transcripts and adding transcripts
import EditTranscript from "./Windows/EditTranscript";
import AddTranscript from "./Windows/AddTranscript";

export default function TranscriptsTable(props){

    // Define state variables
    const [rows, setRows] = useState([]); // Array of transcripts to be displayed in the table
    const [Selected, setSelected] = useState(); // ID of the selected transcript
    const [showQuestions, setShowQuestions] = useState(false); // Flag indicating whether to show generated questions
    const [questionsData , setQuestionData] = useState(null); // Data containing generated questions
    const [selectedData, setSelectedData] = useState(); // Data of the selected transcript

    const [showButton, setShowButton] = useState(props.showButton); // Flag indicating whether to show the button to generate questions
    const [showEditWindow, setShowEditWindow] = useState(false); // Flag indicating whether to show the window for editing transcripts
    const [ShowAddWindow, setShowAddWindow] = useState(false); // Flag indicating whether to show the window for adding transcripts

    const [lastDelete, setLastDelete] = useState(null); // ID of the last deleted transcript

    const [model, setModel] = useState("t5-result");

    const [statement, setStatement] = useState();

    
    const updateFields = () => {
        // Fetch the data from the API and update the rows in the table
        fetch(`http://127.0.0.1:5000/transcripts`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Select the first transcript with a non-null transcript field
            const filteredData = data.filter(obj => obj.transcript !== null);
            if (filteredData.length > 0) {
                setSelected(filteredData[0].id);
                setSelectedData(filteredData[0]);
            } else {
                setSelected(null);
            }
            setRows(filteredData);
        })
        .catch(error => {
            console.error(error);
        });
    }
    

    useEffect(() => {
        // Set the initial state of the showButton flag and update the table rows
        if(showButton === undefined){
            setShowButton(true);
        }
        
        updateFields();
    }, [showButton]);
    
    // Handle radio button changes
    const handleRadioChange = (event, obj) => {
        setSelectedData(obj);
        setSelected(Number(event.target.value));
    }

    const handleModelSelect = (event) => {
        setModel(event.target.value);
    }
    
    // Handle click event for generating questions
    const handleClick = () => {
        setStatement(selectedData.transcript);
        // Send a POST request to the API to generate questions for the selected transcript
        fetch(`http://127.0.0.1:5000/generateTranscriptQuestions/${document.querySelector('input[name="selectedRow"]:checked').value}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model" : model
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // If questions were generated, show them
            if (Object.keys(data).length !== 0){
                setShowQuestions(true);
                setQuestionData(data);
            }
        })
        .catch(error => {
            console.error(error);
        })
    }


    const handleAdd = () => {
        // Show the window for adding a transcript and hide the window for editing a transcript
        setShowEditWindow(false);
        setShowAddWindow(true);

    }

    const handleEdit = (obj) => {
        // Show the window for editing a transcript and hide the window for adding a transcript
        setShowAddWindow(false);
        setSelectedData(obj);
        setShowEditWindow(true);
    }

    // Function that delets Transcript. Requires user to press twice to delete.
    const handleDelete = (id) => {
        console.log(lastDelete);
        if(lastDelete === null){
            setLastDelete(id);
        }
        else if (lastDelete === id){
            fetch(`http://127.0.0.1:5000/transcripts/${id}`, {
            method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                updateFields()
            })
            .catch(error => {
                console.error(error);
            })
        }else{
            setLastDelete(id);
        }
        
    }

    // Render the component
    return(
        
        <div className="TranscriptsTable">
            {!showQuestions && (
                <table className="TranscriptsTable--Table">
                    <thead>
                        <tr>
                            {showButton && (<th></th>)}
                            <th>ID</th>
                            <th>Name</th>
                            <th>Transcript</th>
                            <th></th>
                            <th><img src={plusIcon} className="LectureTable--AddIcon" alt = "Add" onClick={handleAdd}/></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((obj) =>(
                            <tr key={obj.id}>
                                {showButton && (<td className="TranscriptTable--Cell">
                                    <input type="radio" name="selectedRow" value={obj.id} checked = {obj.id === Selected} onChange={(event) => handleRadioChange(event, obj)}/>
                                </td>)}
                                <td className="TranscriptTable--Cell">{obj.id}</td>
                                <td className="TranscriptTable--Cell">{obj.transcript_name}</td>
                                <td className="TranscriptTable--Cell"><div className="TranscriptTable--Transcript">{obj.transcript}</div></td>
                                <td className="TranscriptTable--Cell"><img className="LectureTable--Edit" src = {editIcon} alt="edit" onClick={() => handleEdit(obj)}/></td>
                                <td className="TranscriptTable--Cell"><img className="LectureTable--Delete" src = {lastDelete===obj.id ? tickIcon : deleteIcon} alt="delete" onClick={() => handleDelete(obj.id)}/></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {!showQuestions && showButton && (
                <div className="TranscriptsTable--SQButton--Div">
                    <div>
                        <h3>Model:</h3>
                        <select id="model-select" onChange={handleModelSelect}>
                            <option value="t5-result">T5- Parth/Result</option>
                            <option value="t5-base">T5 - Valhalla/t5-base-qa-qg-hl</option>
                            <option value="gpt3">GPT-3</option>
                        </select>
                    </div>
                    <button onClick={handleClick} className="TranscriptsTable--SQButton"><span>Generate Questions for selected Transcript</span></button>
                </div>
            )}
            {showQuestions && questionsData && (
                <div>
                    <div className="QuestionGrid--QuestionStatement--div-outer">
                        <div className="QuestionGrid--QuestionStatement--div-inner">
                            <span className="QuestionGrid--QuestionStatement" maxLength = "20">{statement}</span>
                        </div>
                    </div>
                    <QuestionGrid questions={questionsData} />
                </div>
            )}
            {showEditWindow && (<EditTranscript transcriptID = {selectedData.id} transcript = {selectedData.transcript} transcriptName = {selectedData.transcript_name} setShowEditWindow = {setShowEditWindow} updateTable = {updateFields}/>)}
            {ShowAddWindow && (<AddTranscript setShowAddWindow =  {setShowAddWindow} updateTable = {updateFields}/>)}
        </div>
        
    );
}
