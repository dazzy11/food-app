import React, { useState } from 'react'

const Checkout = ({ cart, total, onOrderComplete, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [orderPlaced, setOrderPlaced] = useState(false)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const handlePlaceOrder = () => {
    const orderData = {
      id: Math.random().toString(36).substr(2, 9),
      items: cart,
      total: total,
      paymentMethod: paymentMethod,
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    }
    
    setOrderPlaced(true)
    setTimeout(() => {
      onOrderComplete(orderData)
    }, 2000)
  }

  if (orderPlaced) {
    return (
      <div className="container checkout">
        <div className="card text-center">
          <div className="alert alert-success">
            <h2>🎉 Order Placed Successfully!</h2>
            <p>Your order is being prepared and will be delivered soon.</p>
            <div className="loading" style={{margin: '20px auto'}}></div>
            <p>Redirecting to order tracking...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container checkout">
      <h1 className="text-center mb-20">Checkout</h1>
      
      <div className="grid grid-2">
        <div>
          <div className="card">
            <h3>Order Summary</h3>
            {cart.map(item => (
              <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                <span>{item.name} x {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <hr style={{margin: '15px 0'}} />
            <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem'}}>
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="card">
            <h3>Delivery Address</h3>
            <div className="form-group">
              <textarea 
                className="form-input"
                rows="4"
                placeholder="Enter your delivery address"
                defaultValue="123 Main Street, Mumbai, Maharashtra - 400001"
              ></textarea>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Payment Method</h3>
            <div className="payment-methods">
              <div 
                className={`payment-method ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                💳 Credit/Debit Card
              </div>
              <div 
                className={`payment-method ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                💵 Cash on Delivery
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input type="text" className="form-input" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="text" className="form-input" placeholder="MM/YY" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input type="text" className="form-input" placeholder="123" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Card Holder Name</label>
                  <input type="text" className="form-input" placeholder="John Doe" />
                </div>
              </div>
            )}
          </div>

          <div style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
            <button className="btn btn-secondary" onClick={onBack} style={{flex: 1}}>
              Back to Cart
            </button>
            <button className="btn btn-success" onClick={handlePlaceOrder} style={{flex: 2}}>
              Place Order - {formatPrice(total)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout