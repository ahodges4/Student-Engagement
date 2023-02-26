import React from 'react'
import { Router, Routes, Route } from 'react-router-dom';

import ReturnField from './ReturnField';
import Home from '../pages/Home'
import RecordingSetup from '../pages/RecordingSetup';
import Recording from '../pages/Recording';

function Main() {
    return (
        <Routes>
            <Route path = '/' element={<Home />}></Route>
            <Route path = '/RecordingSetup' element={<RecordingSetup />}></Route>
            <Route path = '/Recording/:audioStreamID' element={<Recording />}></Route>
        </Routes>
    );
}

export default Main;