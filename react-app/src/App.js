
import Navbar from "./components/Navbar"
import Card from "./components/Card"



function App() {
  const data = [
    {
    img : "https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*",
    name : "Mr. Wiskerson",
    rating : "5.0",
    reviewCount : "6",
    Location : "UK",
    Price : "£50"
  },
  {
    img : "https://www.thesprucepets.com/thmb/7TDhfkK5CAKBWEaJfez6607J48Y=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/chinese-dog-breeds-4797219-hero-2a1e9c5ed2c54d00aef75b05c5db399c.jpg",
    name : "Mr. Piskerson",
    rating : "1.0",
    reviewCount : "703",
    Location : "GB",
    Price : "£509"
  }]
  
  const cardElements = data.map(card => {
    return <Card img = {card.img} name = {card.name} rating = {card.rating} reviewCount = {card.reviewCount} Location ={card.Location} Price = {card.Price} />
  })



 return(
  <div className="container">
    <Navbar />
    {cardElements}
    
  </div>
 )
}

export default App;

