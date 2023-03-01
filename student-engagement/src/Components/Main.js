import React from 'react'
import { Router, Routes, Route } from 'react-router-dom';

import RecordingField from './RecordingField';
import Home from '../pages/Home'
import RecordingSetup from '../pages/RecordingSetup';
import Recording from '../pages/Recording';
import QuestionGenerator from '../pages/QuestionGenerator';

function Main() {
    return (
        <Routes>
            <Route path = '/' element={<Home />}></Route>
            <Route path = '/RecordingSetup' element={<RecordingSetup />}></Route>
            <Route path = '/Recording/:audioStreamID' element={<Recording />}></Route>
            <Route path = '/QuestionGenerator' element={<QuestionGenerator/>}></Route>
        </Routes>
    );
}

export default Main;