

export default function Card(props){
    return(
        <div className="card">
            <img src={props.img} alt="Swimming Dog" className="card--image"></img>
            <div className="card--stats">
                <img src={props.img} alt="Swimming Dog" className="card--star"></img>
                <span>5.0</span>
                <span className="grey">({props.reviewCount}) - </span>
                <span className="grey">{props.Location}</span>
            </div>
            <p className="card--text">{props.name}</p>
            <p><span className="bold">{props.Price}</span> / minute</p>
            <div className="card--button--div"><a href="https://www.google.com"><button className="card--button" href="www.google.com">Sign Up</button></a></div>
        </div>
    )
}