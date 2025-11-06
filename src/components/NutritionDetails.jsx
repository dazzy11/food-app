import React, { useState } from 'react'
import { getGroqCompletion } from '../utils/groqClient'

const NutritionDetails = () => {
  const [foodItem, setFoodItem] = useState('')
  const [nutritionData, setNutritionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const parseNutritionResponse = (response) => {
    // Try to extract JSON from the response
    try {
      // Look for JSON pattern in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      // If no JSON found, create a structured response from text
      return {
        food: foodItem,
        calories: "Information not available in structured format",
        macronutrients: {
          protein: "N/A",
          carbohydrates: "N/A", 
          fat: "N/A",
          fiber: "N/A"
        },
        micronutrients: ["Check the detailed response below"],
        healthBenefits: ["Check the detailed response below"],
        recipe: {
          ingredients: ["Information available in text format"],
          instructions: [response.substring(0, 500) + "..."]
        },
        rawResponse: response
      }
    } catch (parseError) {
      // If JSON parsing fails, return a structured error response
      return {
        food: foodItem,
        calories: "Could not parse nutrition data",
        macronutrients: {
          protein: "N/A",
          carbohydrates: "N/A",
          fat: "N/A",
          fiber: "N/A"
        },
        micronutrients: ["Please try again with a different food item"],
        healthBenefits: ["Please try again with a different food item"],
        recipe: {
          ingredients: ["N/A"],
          instructions: ["Failed to parse recipe information"]
        },
        rawResponse: response
      }
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!foodItem.trim()) return

    setLoading(true)
    setError('')
    setNutritionData(null)
    
    try {
      const prompt = `Provide detailed nutrition information for "${foodItem}" in this exact JSON format without any additional text:

{
  "food": "food name",
  "calories": "calories per 100g",
  "macronutrients": {
    "protein": "amount in grams",
    "carbohydrates": "amount in grams", 
    "fat": "amount in grams",
    "fiber": "amount in grams"
  },
  "micronutrients": ["list of key vitamins and minerals"],
  "healthBenefits": ["list of health benefits"],
  "recipe": {
    "ingredients": ["list of ingredients for a simple preparation"],
    "instructions": ["step by step cooking instructions"]
  }
}

If you cannot provide exact values, give reasonable estimates. Keep the response concise and accurate.`

      const response = await getGroqCompletion(prompt)
      const parsedData = parseNutritionResponse(response)
      setNutritionData(parsedData)
      
    } catch (err) {
      setError('Failed to fetch nutrition information. Please check your internet connection and try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container nutrition-details">
      <h1 className="text-center mb-20">Nutrition Information</h1>
      
      <div className="card">
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label className="form-label">Enter Food Item</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Apple, Chicken Breast, Brown Rice, Pizza"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !foodItem.trim()}
          >
            {loading ? (
              <>
                <div className="loading" style={{display: 'inline-block', marginRight: '10px'}}></div>
                Analyzing...
              </>
            ) : (
              'Get Nutrition Info'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {nutritionData && (
        <div className="nutrition-card">
          <h2>Nutrition Information for {nutritionData.food}</h2>
          
          <div className="card">
            <h3>Calories & Macronutrients (per 100g)</h3>
            <div className="nutrition-item">
              <span>Calories:</span>
              <strong>{nutritionData.calories}</strong>
            </div>
            {Object.entries(nutritionData.macronutrients).map(([key, value]) => (
              <div key={key} className="nutrition-item">
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          {nutritionData.micronutrients && nutritionData.micronutrients.length > 0 && (
            <div className="card">
              <h3>Key Micronutrients</h3>
              <ul>
                {nutritionData.micronutrients.map((nutrient, index) => (
                  <li key={index} style={{marginBottom: '8px'}}>{nutrient}</li>
                ))}
              </ul>
            </div>
          )}

          {nutritionData.healthBenefits && nutritionData.healthBenefits.length > 0 && (
            <div className="card">
              <h3>Health Benefits</h3>
              <ul>
                {nutritionData.healthBenefits.map((benefit, index) => (
                  <li key={index} style={{marginBottom: '8px'}}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {nutritionData.recipe && (
            <div className="card">
              <h3>Simple Recipe</h3>
              <h4>Ingredients:</h4>
              <ul>
                {nutritionData.recipe.ingredients.map((ingredient, index) => (
                  <li key={index} style={{marginBottom: '5px'}}>{ingredient}</li>
                ))}
              </ul>
              
              <h4>Instructions:</h4>
              <ol>
                {nutritionData.recipe.instructions.map((step, index) => (
                  <li key={index} style={{marginBottom: '8px'}}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {nutritionData.rawResponse && (
            <div className="card">
              <h3>Detailed Analysis</h3>
              <p style={{whiteSpace: 'pre-wrap', lineHeight: '1.5'}}>
                {nutritionData.rawResponse}
              </p>
            </div>
          )}
        </div>
      )}

      {!nutritionData && !loading && !error && (
        <div className="card text-center">
          <h3>How to use:</h3>
          <p>Enter any food item to get detailed nutrition information, health benefits, and a simple recipe.</p>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '15px'}}>
            {['Apple', 'Banana', 'Chicken', 'Salmon', 'Broccoli', 'Oats', 'Eggs', 'Almonds'].map(item => (
              <button
                key={item}
                className="btn btn-secondary"
                style={{padding: '8px 16px', fontSize: '14px'}}
                onClick={() => setFoodItem(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NutritionDetails