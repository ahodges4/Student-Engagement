import dog from "../images/dog.png"

export default function Hero(){
    return(
        <section className="hero">
            <img src={dog} alt="Dog" className="hero--photo"/>
            <h1 className="hero--header">Online Experiences</h1>
            <p className="hero--text">Join unique interactive activities led by one-of-a-kind hosts-all without leaving home</p>
        </section>
    )
}