import React from 'react'

const FoodMenu = ({ addToCart }) => {
  const foodItems = [
    {
      id: 1,
      name: "Margherita Pizza",
      description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
      price: 299,
      image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop",
      category: "Italian"
    },
    {
      id: 2,
      name: "Butter Chicken",
      description: "Tender chicken in rich buttery tomato gravy",
      price: 349,
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
      category: "Indian"
    },
    {
      id: 3,
      name: "Veg Burger",
      description: "Fresh vegetable patty with lettuce, tomato, and special sauce",
      price: 179,
      image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop",
      category: "Fast Food"
    },
    {
      id: 4,
      name: "Sushi Platter",
      description: "Assorted fresh sushi with soy sauce and wasabi",
      price: 599,
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
      category: "Japanese"
    },
    {
      id: 5,
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with Caesar dressing and croutons",
      price: 229,
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
      category: "Salads"
    },
    {
      id: 6,
      name: "Chocolate Brownie",
      description: "Warm chocolate brownie with vanilla ice cream",
      price: 149,
      image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=300&fit=crop",
      category: "Desserts"
    }
  ]

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  return (
    <div className="container food-menu">
      <h1 className="text-center mb-20">Our Menu</h1>
      <div className="food-grid">
        {foodItems.map(item => (
          <div key={item.id} className="food-card">
            <img 
              src={item.image} 
              alt={item.name}
              className="food-image"
            />
            <div className="food-info">
              <h3 className="food-name">{item.name}</h3>
              <p className="food-description">{item.description}</p>
              <div className="food-price">{formatPrice(item.price)}</div>
              <button 
                className="btn btn-primary"
                onClick={() => addToCart(item)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FoodMenu