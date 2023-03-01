import React, {useState, useEffect} from "react";
import QuestionGrid from "./QuestionGrid";


export default function TranscriptsTable(){
    const [rows, setRows] = useState([]);
    const [Selected, setSelected] = useState();
    const [showQuestions, setShowQeustions] = useState(false);
    const [questionsData , setQuestionData] = useState(null);




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
    

    const handleRadioChange = (event) => {
        setSelected(Number(event.target.value));
    }
    
    const handleClick = () => {
        fetch(`http://127.0.0.1:5000/generateTranscriptQuestions/${document.querySelector('input[name="selectedRow"]:checked').value}`, {
             method: 'POST'
        })
        .then(resonse => resonse.json())
        .then(data => {
            console.log(data);
            if (Object.keys(data).length !== 0){
                setShowQeustions(true);
                setQuestionData(data);
            }
        })
        .catch(error => {
            error.log(error);
        })
    }

    return(
        
        <div>
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
                <div className="TranscriptsTable--SQButton">
                    <button onClick={handleClick}>Generate Question for selected Transcript</button>
                </div>
            )}
            {showQuestions && questionsData && (
                <QuestionGrid questions={questionsData} />
            )}
            
        </div>
        
    );
}