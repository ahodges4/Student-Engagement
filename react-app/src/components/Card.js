import dogSwim from "../images/dog_swim.png"

export default function Card(){
    return(
        <div className="card">
            <img src={dogSwim} alt="Swimming Dog" className="card--image"></img>
            <div className="card--stats">
                <img src={dogSwim} alt="Swimming Dog" className="card--star"></img>
                <span>5.0</span>
                <span className="grey">(6) - </span>
                <span className="grey">UK</span>
            </div>
            <p>Dog Swimming Lessons with Katie</p>
            <p><span className="bold">From £5697</span> / minute</p>
        </div>
    )
}