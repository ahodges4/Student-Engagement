import React, {useState, useEffect} from "react";
import QuestionGrid from "./QuestionGrid";

export default function TranscriptsTable(){
    // Define state variables
    const [rows, setRows] = useState([]);
    const [Selected, setSelected] = useState();
    const [showQuestions, setShowQuestions] = useState(false);
    const [questionsData , setQuestionData] = useState(null);

    // Fetch transcripts data from backend on component mount
    useEffect(() => {
        fetch(`http://127.0.0.1:5000/transcripts`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setSelected(data.filter(obj => obj.transcript !== null)[0].id)
            setRows(data.filter(obj => obj.transcript !== null));
        })
        .catch(error => {
            console.error(error);
        });
    }, []);
    
    // Handle radio button changes
    const handleRadioChange = (event) => {
        setSelected(Number(event.target.value));
    }
    
    // Handle click event for generating questions
    const handleClick = () => {
        fetch(`http://127.0.0.1:5000/generateTranscriptQuestions/${document.querySelector('input[name="selectedRow"]:checked').value}`, {
             method: 'POST'
        })
        .then(resonse => resonse.json())
        .then(data => {
            console.log(data);
            if (Object.keys(data).length !== 0){
                setShowQuestions(true);
                setQuestionData(data);
            }
        })
        .catch(error => {
            error.log(error);
        })
    }

    // Render the component
    return(
        
        <div className="TranscriptsTable">
            {!showQuestions && (
                <table className="TranscriptsTable--Table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>ID</th>
                            <th>Transcript</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((obj) =>(
                            <tr key={obj.id}>
                                <td>
                                    <input type="radio" name="selectedRow" value={obj.id} checked = {obj.id === Selected} onChange={handleRadioChange}/>
                                </td>
                                <td>{obj.id}</td>
                                <td>{obj.transcript}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {!showQuestions && (
                <div className="TranscriptsTable--SQButton--Div">
                    <button onClick={handleClick} className="TranscriptsTable--SQButton"><span>Generate Questions for selected Transcript</span></button>
                </div>
            )}
            {showQuestions && questionsData && (
                <div>
                    <div className="QuestionGrid--QuestionStatement--div-outer">
                        <div className="QuestionGrid--QuestionStatement--div-inner">
                            <span className="QuestionGrid--QuestionStatement" maxLength = "20">{questionsData.statement}</span>
                        </div>
                    </div>
                    <QuestionGrid questions={questionsData} />
                </div>
            )}
            
        </div>
        
    );
}
