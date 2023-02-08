import logo from '../logo.svg';
export default function Navbar(){
    return (
        <div>
            <nav>
                <img src={logo} alt="Logo" className = "nav--logo"/>
            </nav>
        </div>
    )
}