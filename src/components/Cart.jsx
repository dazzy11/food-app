import React from 'react'

const Cart = ({ cart, updateQuantity, onCheckout }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  if (cart.length === 0) {
    return (
      <div className="container cart">
        <h1 className="text-center">Your Cart</h1>
        <div className="card text-center">
          <h3>Your cart is empty</h3>
          <p>Add some delicious food items from our menu!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container cart">
      <h1 className="text-center mb-20">Your Cart</h1>
      
      <div className="card">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <img 
                src={item.image} 
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                <p>{formatPrice(item.price)}</p>
              </div>
            </div>
            
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              <span style={{padding: '0 15px', fontWeight: 'bold'}}>
                {item.quantity}
              </span>
              <button 
                className="quantity-btn"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            
            <div style={{fontWeight: 'bold'}}>
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-total">
        Total: {formatPrice(getTotal())}
      </div>

      <div style={{textAlign: 'right'}}>
        <button className="btn btn-primary" onClick={onCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  )
}

export default Cart