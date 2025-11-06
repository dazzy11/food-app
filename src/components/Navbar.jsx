import React from 'react'

const Navbar = ({ currentView, setCurrentView, user, cartCount }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#" className="navbar-brand" onClick={() => setCurrentView('menu')}>
          🍕 FoodExpress
        </a>
        
        <ul className="navbar-nav">
          {user && (
            <>
              <li>
                <a 
                  href="#" 
                  onClick={() => setCurrentView('menu')}
                  className={currentView === 'menu' ? 'active' : ''}
                >
                  Menu
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={() => setCurrentView('nutrition')}
                  className={currentView === 'nutrition' ? 'active' : ''}
                >
                  Nutrition Info
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={() => setCurrentView('recommender')}
                  className={currentView === 'recommender' ? 'active' : ''}
                >
                  Food Recommender
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={() => setCurrentView('cart')}
                  className={currentView === 'cart' ? 'active' : ''}
                >
                  Cart {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </a>
              </li>
              {currentView === 'tracking' && (
                <li>
                  <a 
                    href="#" 
                    onClick={() => setCurrentView('tracking')}
                    className="active"
                  >
                    Order Tracking
                  </a>
                </li>
              )}
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar