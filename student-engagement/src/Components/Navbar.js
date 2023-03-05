import logo from '../logo.svg';
import { Link, useLocation } from "react-router-dom"

export default function Navbar(){
    const location = useLocation();
    
    const handleLinkClick = (e, to) => {
        if (to === location.pathname) {
            e.preventDefault();
            window.location.reload();
        }
    }

    return (
        <header>
            <div className="nav--container">
                <Link to="/" className="nav--logo">
                    <img src={logo} alt="Logo" className="nav--logo"/>
                </Link>
                <nav>
                    <ul>
                        <li>
                            <Link to="/" className='nav--Link' onClick={(e) => handleLinkClick(e, '/')}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/recordingSetup" className='nav--Link' onClick={(e) => handleLinkClick(e, '/recordingSetup')}>
                                Start Recording
                            </Link>
                        </li>
                        <li>
                            <Link to="/QuestionGenerator" className='nav--Link' onClick={(e) => handleLinkClick(e, '/QuestionGenerator')}>
                                Question Generation
                            </Link>
                        </li>
                        <li>
                            <Link to="/Lectureplayback" className='nav--Link' onClick={(e) => handleLinkClick(e, '/Lectureplayback')}>
                                Lecture  Playback
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}
