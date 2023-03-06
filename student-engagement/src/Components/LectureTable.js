import React, {useState, useEffect} from "react"


export default function LectureTable(props){


    // Destructure props object
    const { transcripts, lecture } = props;


    const [rows, setRows] = useState([]);
    const [Selected, setSelected] = useState(); 
    const [SelectedTitle, setSelectedTitle] = useState();
    const [lectureTranscripts, setLectureTranscripts] = useState({});


    useEffect(() => {
        fetch(`http://127.0.0.1:5000/lectures`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setSelected(data[0].id);
            setSelectedTitle(data[0].lecture_title)
            setRows(data);
        })
        .catch(error => {
            console.error(error);
        });

        const delay = 500; // delay in milliseconds
        const timeoutId = setTimeout(() => {
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
        }, delay);

        // Clear timeout if the component unmounts or the delay changes
        return () => clearTimeout(timeoutId);

    }, []);

    //Handle radio button changes
    const handleRadioChange = (event) => {
        setSelected(Number(event.target.value));
        const selectedRow = rows.find(row => row.id === Number(event.target.value));
        setSelectedTitle(selectedRow.lecture_title);
    }

    const handleSubmit = () => {
        const selectedRow = rows.find(row => row.id === Selected);
        const selectedTranscripts = lectureTranscripts[selectedRow.id]
        console.log(selectedRow);
        console.log(selectedTranscripts);

        props.onSubmit(selectedRow, selectedTranscripts);
    }

    const handleEdit = (id) => {
        console.log("edit " , id);
    }

    const handleDelete = (id) => {
        console.log("delete " , id);
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
                        <th></th>
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
                            <td><img className="LectureTable--Edit" alt="edit" onClick={() => handleEdit(obj.id)}/></td>
                            <td><img className="LectureTable--Delete" alt="delete" onClick={() => handleDelete(obj.id)}/></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handleSubmit}>Start Playback for {SelectedTitle}</button>
        </div>
    )
}