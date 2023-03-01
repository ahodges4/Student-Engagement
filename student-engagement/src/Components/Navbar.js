import logo from '../logo.svg';
import { Link } from "react-router-dom"

export default function Navbar(){
    return (
        <div>
            <nav>
                <Link to="/" className = "nav--logo">
                    <img src={logo} alt="Logo" className = "nav--logo"/>
                    Home
                </Link>
                <Link to="/recordingSetup">
                    <button variant="outlined">
                        Start Recording
                    </button>
                </Link>
                <Link to="/QuestionGenerator">
                    <button vairant="outlined">
                        Question Generation
                    </button>
                </Link>
            </nav>
        </div>
    )
}