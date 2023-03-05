import logo from '../logo.svg';
import { Link } from "react-router-dom"

export default function Navbar(){
    return (
        <header>
            <div class = "nav--container">
                <Link to="/" className = "nav--logo">
                    <img src={logo} alt="Logo" className = "nav--logo"/>
                </Link>
                <nav>
                    <ul>
                        <li>
                            <Link to="/" className='nav--Link'>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/recordingSetup" className='nav--Link'>
                                Start Recording
                            </Link>
                        </li>

                        <li>
                            <Link to="/QuestionGenerator" className='nav--Link'>
                                Question Generation
                            </Link>
                        </li>

                        <li>
                            <Link to="/Lectureplayback" className='nav--Link'>
                                    Lecture  Playback
                            </Link>
                        </li>
                    </ul>
              
                </nav>
            </div>
        </header>
    )
}