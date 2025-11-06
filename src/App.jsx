import React, { useState } from 'react'
import Navbar from './components/Navbar'
import FoodMenu from './components/FoodMenu'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import OrderTracking from './components/OrderTracking'
import NutritionDetails from './components/NutritionDetails'
import FoodRecommender from './components/FoodRecommender'
import Auth from './components/Auth'
import HelpChatbot from './components/HelpChatbot'

function App() {
  const [currentView, setCurrentView] = useState('menu')
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [order, setOrder] = useState(null)

  const addToCart = (foodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === foodItem.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === foodItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...foodItem, quantity: 1 }]
    })
  }

  const updateQuantity = (id, quantity) => {
    if (quantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id))
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      )
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setCurrentView('menu')
  }

  const handleOrderComplete = (orderData) => {
    setOrder(orderData)
    setCart([])
    setCurrentView('tracking')
  }

  return (
    <div className="App">
      <Navbar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        cartCount={cart.reduce((count, item) => count + item.quantity, 0)}
      />
      
      <main>
        {!user ? (
          <Auth onLogin={handleLogin} />
        ) : (
          <>
            {currentView === 'menu' && (
              <FoodMenu addToCart={addToCart} />
            )}
            {currentView === 'cart' && (
              <Cart 
                cart={cart} 
                updateQuantity={updateQuantity}
                onCheckout={() => setCurrentView('checkout')}
              />
            )}
            {currentView === 'checkout' && (
              <Checkout 
                cart={cart}
                total={getCartTotal()}
                onOrderComplete={handleOrderComplete}
                onBack={() => setCurrentView('cart')}
              />
            )}
            {currentView === 'tracking' && order && (
              <OrderTracking order={order} />
            )}
            {currentView === 'nutrition' && (
              <NutritionDetails />
            )}
            {currentView === 'recommender' && (
              <FoodRecommender />
            )}
          </>
        )}
      </main>
      
      <HelpChatbot />
    </div>
  )
}

export default App