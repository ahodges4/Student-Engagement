import React, {useState} from "react";

import TranscriptsTable from "../Components/TranscriptsTable";

export default function Transcripts(){
    return (
        <div>
            <TranscriptsTable showButton = {false}/>
        </div>
    )
}