import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const OrderTracking = ({ order }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [deliveryPosition, setDeliveryPosition] = useState(null);
  const [route, setRoute] = useState([]);

  // Sample coordinates (Mumbai area)
  const restaurantLocation = [19.0760, 72.8777]; // Restaurant location
  const customerLocation = [19.0750, 72.8650];   // Customer location
  
  const steps = ['Order Placed', 'Preparing', 'On the Way', 'Delivered'];

  // Generate route points between restaurant and customer
  useEffect(() => {
    const points = [];
    const stepsCount = 20;
    
    for (let i = 0; i <= stepsCount; i++) {
      const lat = restaurantLocation[0] + (customerLocation[0] - restaurantLocation[0]) * (i / stepsCount);
      const lng = restaurantLocation[1] + (customerLocation[1] - restaurantLocation[1]) * (i / stepsCount);
      points.push([lat, lng]);
    }
    
    setRoute(points);
    setDeliveryPosition(restaurantLocation); // Start at restaurant
  }, []);

  // Simulate delivery movement
  useEffect(() => {
    if (currentStep < 2 || !route.length) return; // Only move when order is "On the Way"

    const moveDelivery = () => {
      setDeliveryPosition(prev => {
        if (!prev) return route[0];
        
        const currentIndex = route.findIndex(
          point => point[0] === prev[0] && point[1] === prev[1]
        );
        
        if (currentIndex < route.length - 1) {
          return route[currentIndex + 1];
        } else {
          // Reached destination
          clearInterval(movementInterval);
          return prev;
        }
      });
    };

    const movementInterval = setInterval(moveDelivery, 2000); // Move every 2 seconds

    return () => clearInterval(movementInterval);
  }, [currentStep, route]);

  // Auto-advance steps for demo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 8000); // Update every 8 seconds for demo

    return () => clearInterval(timer);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getDeliveryStatus = () => {
    switch(currentStep) {
      case 0:
        return "Order received at restaurant";
      case 1:
        return "Food is being prepared";
      case 2:
        return deliveryPosition && deliveryPosition[0] === customerLocation[0] && deliveryPosition[1] === customerLocation[1] 
          ? "Arrived at your location" 
          : "On the way to you";
      case 3:
        return "Delivered! Enjoy your meal!";
      default:
        return "Processing your order";
    }
  };

  const getEstimatedTime = () => {
    if (currentStep < 2) return "25-30 minutes";
    if (currentStep === 2) {
      if (!deliveryPosition) return "15-20 minutes";
      const progress = route.findIndex(point => 
        point[0] === deliveryPosition[0] && point[1] === deliveryPosition[1]
      ) / route.length;
      const remainingTime = Math.max(1, Math.round((1 - progress) * 20));
      return `${remainingTime}-${remainingTime + 5} minutes`;
    }
    return "Delivered";
  };

  return (
    <div className="container order-tracking">
      <h1 className="text-center mb-20">Order Tracking</h1>
      
      <div className="card">
        <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3>Order #{order?.id || '12345'}</h3>
            <p style={{ margin: '5px 0', color: '#666' }}>
              <strong>Status:</strong> {steps[currentStep]} • {getDeliveryStatus()}
            </p>
            <p style={{ margin: '5px 0', color: '#666' }}>
              <strong>Estimated Delivery:</strong> {getEstimatedTime()}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '5px 0' }}>
              <strong>Delivery Partner:</strong> Rajesh Kumar
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Contact:</strong> +91 98765 43210
            </p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="tracking-steps">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`tracking-step ${index <= currentStep ? 'active' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{step}</div>
            </div>
          ))}
        </div>

        {/* Live Map */}
        <div className="map-container">
          <MapContainer 
            center={restaurantLocation} 
            zoom={13} 
            style={{ height: '400px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Restaurant Marker */}
            <Marker position={restaurantLocation} icon={restaurantIcon}>
              <Popup>
                <strong>FoodExpress Restaurant</strong><br />
                Starting Point
              </Popup>
            </Marker>
            
            {/* Customer Marker */}
            <Marker position={customerLocation} icon={customerIcon}>
              <Popup>
                <strong>Delivery Location</strong><br />
                Your Address
              </Popup>
            </Marker>
            
            {/* Delivery Partner Marker */}
            {deliveryPosition && (
              <Marker position={deliveryPosition} icon={deliveryIcon}>
                <Popup>
                  <strong>Delivery Partner</strong><br />
                  Rajesh Kumar<br />
                  On the way with your order
                </Popup>
              </Marker>
            )}
            
            {/* Route Line */}
            <Polyline 
              positions={route} 
              color="blue" 
              weight={4}
              opacity={0.7}
              dashArray="10, 10"
            />
            
            {/* Progress Line (shows completed route) */}
            {deliveryPosition && (
              <Polyline 
                positions={route.slice(0, route.findIndex(point => 
                  point[0] === deliveryPosition[0] && point[1] === deliveryPosition[1]
                ) + 1)} 
                color="green" 
                weight={4}
              />
            )}
          </MapContainer>
        </div>

        {/* Delivery Info Card */}
        <div className="card" style={{ marginTop: '20px', background: '#f8f9fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>🚚 Live Delivery Updates</h4>
              <p style={{ margin: '5px 0' }}>
                <strong>Current Status:</strong> {getDeliveryStatus()}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Vehicle:</strong> Motorcycle • AB 12 CD 3456
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                padding: '10px 15px', 
                background: currentStep === 3 ? '#28a745' : '#007bff', 
                color: 'white', 
                borderRadius: '20px',
                fontWeight: 'bold'
              }}>
                {currentStep === 3 ? '✅ Delivered' : '🕒 In Progress'}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary" style={{ marginTop: '20px' }}>
          <h4>Order Summary</h4>
          {order?.items?.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{item.name} x {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span>{formatPrice(order?.total || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;