import Logo from "../images/logo.svg"

export default function Navbar(){
  return (
    <div>
      <nav>
        <img src={Logo} alt="Logo" className="nav--logo"/>
      </nav>
    </div>  
  )
}