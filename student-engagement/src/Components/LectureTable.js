import React, {useState, useEffect} from "react";

import EditWindow from "./Windows/EditLecture";
import AddWindow from "./Windows/AddLecture";

import editIcon from "../icons/edit.png";
import deleteIcon from "../icons/delete.png";
import tickIcon from "../icons/check.png";
import plusIcon from "../icons/plus.png";


export default function LectureTable(props){

    // Destructure props object
    const { transcripts, lecture } = props;

    // State variables
    const [rows, setRows] = useState([]);
    const [Selected, setSelected] = useState(); 
    const [SelectedTitle, setSelectedTitle] = useState();
    const [lectureTranscripts, setLectureTranscripts] = useState({});
    const [selectedData, setSelectedData] = useState();
    const [selectedTranscripts, setSelectedTranscripts] = useState();

    const [showEditWindow, setShowEditWindow] = useState(false);
    const [ShowAddWindow, setShowAddWindow] = useState(false);

    const [lastDelete, setLastDelete] = useState(null);

    // Function to update fields from server
    const updateFields = () => {
        fetch(`http://127.0.0.1:5000/lectures`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setSelected(data[0].id);
            setSelectedTitle(data[0].lecture_title)
            setRows(data);
            fetch('http://127.0.0.1:5000/lecture_transcripts')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const newLectureTranscripts = {};
                data.forEach(item => {
                    if (newLectureTranscripts[item.lecture_id]) {
                        newLectureTranscripts[item.lecture_id].push(item.transcript_id);
                    } else {
                        newLectureTranscripts[item.lecture_id] = [item.transcript_id];
                    }
                });
                setLectureTranscripts(newLectureTranscripts);
            })
            .catch(error => {
                console.error(error);
            });
        })
        .catch(error => {
            console.error(error);
        });
    }

    // Use effect hook to call updateFields on initial render
    useEffect(() => {
        updateFields()
    }, []);

    // Handle radio button changes
    const handleRadioChange = (event) => {
        setSelected(Number(event.target.value));
        const selectedRow = rows.find(row => row.id === Number(event.target.value));
        setSelectedTitle(selectedRow.lecture_title);
    }

    // Submit button click handler
    const handleSubmit = () => {
        const selectedRow = rows.find(row => row.id === Selected);
        const selectedTranscripts = lectureTranscripts[selectedRow.id]
        console.log(selectedRow);
        console.log(selectedTranscripts);

        props.onSubmit(selectedRow, selectedTranscripts);
    }

    // Add button click handler
    const handleAdd = () => {
        setShowEditWindow(false);
        setShowAddWindow(true);
    }

    // Edit button click handler
    const handleEdit = (obj) => {
        setShowAddWindow(false);
        setSelectedTranscripts(lectureTranscripts[obj.id]);
        setSelectedData(obj)
        setShowEditWindow(true);
    }

    // Delete button click handler
    const handleDelete = (id) => {
        console.log(lastDelete);
        if(lastDelete === null){
            setLastDelete(id);
        }
        else if (lastDelete === id){
            fetch(`http://127.0.0.1:5000/lectures/${id}`, {
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

    

    



    return (
        <div className="LectureTable">
            <table className="LectureTable--Table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Lecture Title</th>
                        <th>Lecture Url</th>
                        <th>Transcript IDs</th>
                        <th></th>
                        <th><img src={plusIcon} className="LectureTable--AddIcon" onClick={handleAdd}/></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((obj) => (
                        <tr key={obj.id}>
                            <td>
                            <input type="radio" name="selectedRow" value={obj.id} checked = {obj.id === Selected} onChange={handleRadioChange}/>
                            </td>
                            <td>{obj.lecture_title}</td>
                            <td>{obj.lecture_url}</td>
                            <td>{lectureTranscripts[obj.id]?.join(', ')}</td>
                            <td><img className="LectureTable--Edit" src = {editIcon} alt="edit" onClick={() => handleEdit(obj)}/></td>
                            <td><img className="LectureTable--Delete" src = {lastDelete===obj.id ? tickIcon : deleteIcon} alt="delete" onClick={() => handleDelete(obj.id)}/></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handleSubmit}>Start Playback for {SelectedTitle}</button>
            {showEditWindow && (
            <EditWindow lectureID= {selectedData.id} lectureTitle={selectedData.lecture_title} lectureURL = {selectedData.lecture_url} transcriptIDs = {selectedTranscripts} setShowEditWindow = {setShowEditWindow} updateTable = {updateFields}/>
            )}

            {ShowAddWindow && (
                <AddWindow setShowAddWindow = {setShowAddWindow} updateTable = {updateFields}/>
            )}
        </div>
    )
}