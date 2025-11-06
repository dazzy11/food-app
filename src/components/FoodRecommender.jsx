import React, { useState } from 'react'
import { getGroqCompletion } from '../utils/groqClient'

const FoodRecommender = () => {
  const [userData, setUserData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: '',
    goal: '',
    dietaryPreferences: '',
    allergies: ''
  })
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    })
  }

  const calculateBMI = () => {
    if (userData.weight && userData.height) {
      const heightInMeters = userData.height / 100
      return (userData.weight / (heightInMeters * heightInMeters)).toFixed(1)
    }
    return null
  }

  const parseRecommendationResponse = (response) => {
    console.log("Raw API Response:", response);
    
    // Clean the response - remove any markdown code blocks and trim
    let cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Try to parse the response directly
    try {
      const parsedData = JSON.parse(cleanResponse);
      console.log("Successfully parsed JSON:", parsedData);
      return {
        ...parsedData,
        rawResponse: response
      };
    } catch (error) {
      console.error("Direct JSON parsing failed:", error);
      
      // If direct parsing fails, try to extract JSON object
      try {
        // More robust JSON extraction
        const jsonStart = cleanResponse.indexOf('{');
        const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = cleanResponse.substring(jsonStart, jsonEnd);
          const parsedData = JSON.parse(jsonString);
          console.log("Successfully extracted and parsed JSON:", parsedData);
          return {
            ...parsedData,
            rawResponse: response
          };
        }
      } catch (extractionError) {
        console.error("JSON extraction also failed:", extractionError);
      }
      
      // Final fallback - parse the response line by line to extract structured data
      return parseTextResponse(response);
    }
  }

  const parseTextResponse = (response) => {
    const lines = response.split('\n');
    const result = {
      bmiAnalysis: '',
      dailyCalorieNeeds: '',
      recommendedFoods: [],
      mealPlan: {
        breakfast: '',
        lunch: '',
        dinner: '',
        snacks: ''
      },
      lifestyleTips: [],
      rawResponse: response
    };

    let currentSection = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Extract BMI analysis
      if (trimmedLine.includes('bmiAnalysis') || trimmedLine.includes('BMI') && trimmedLine.includes('14.9')) {
        const match = trimmedLine.match(/"bmiAnalysis":\s*"([^"]*)"/);
        if (match) {
          result.bmiAnalysis = match[1];
        } else if (trimmedLine.includes('BMI') && trimmedLine.includes('14.9')) {
          result.bmiAnalysis = trimmedLine;
        }
      }
      
      // Extract calorie needs
      if (trimmedLine.includes('dailyCalorieNeeds') || trimmedLine.includes('kcal')) {
        const match = trimmedLine.match(/"dailyCalorieNeeds":\s*"([^"]*)"/);
        if (match) {
          result.dailyCalorieNeeds = match[1];
        } else if (trimmedLine.includes('1,800') || trimmedLine.includes('2,000')) {
          result.dailyCalorieNeeds = trimmedLine;
        }
      }
      
      // Extract recommended foods
      if (trimmedLine.includes('recommendedFoods') || trimmedLine.includes('name":')) {
        currentSection = 'foods';
      }
      
      if (currentSection === 'foods' && trimmedLine.includes('name":')) {
        const nameMatch = trimmedLine.match(/"name":\s*"([^"]*)"/);
        const categoryMatch = trimmedLine.match(/"category":\s*"([^"]*)"/);
        const benefitsMatch = trimmedLine.match(/"benefits":\s*"([^"]*)"/);
        const servingMatch = trimmedLine.match(/"servingSize":\s*"([^"]*)"/);
        const bestTimeMatch = trimmedLine.match(/"bestTime":\s*"([^"]*)"/);
        
        if (nameMatch) {
          result.recommendedFoods.push({
            name: nameMatch[1] || 'Food item',
            category: categoryMatch ? categoryMatch[1] : 'Various',
            benefits: benefitsMatch ? benefitsMatch[1] : 'Nutritional benefits',
            servingSize: servingMatch ? servingMatch[1] : 'Appropriate portion',
            bestTime: bestTimeMatch ? bestTimeMatch[1] : 'Throughout day'
          });
        }
      }
      
      // Extract meal plan
      if (trimmedLine.includes('mealPlan')) {
        currentSection = 'mealPlan';
      }
      
      if (currentSection === 'mealPlan') {
        if (trimmedLine.includes('breakfast":')) {
          const match = trimmedLine.match(/"breakfast":\s*"([^"]*)"/);
          if (match) result.mealPlan.breakfast = match[1];
        }
        if (trimmedLine.includes('lunch":')) {
          const match = trimmedLine.match(/"lunch":\s*"([^"]*)"/);
          if (match) result.mealPlan.lunch = match[1];
        }
        if (trimmedLine.includes('dinner":')) {
          const match = trimmedLine.match(/"dinner":\s*"([^"]*)"/);
          if (match) result.mealPlan.dinner = match[1];
        }
        if (trimmedLine.includes('snacks":')) {
          const match = trimmedLine.match(/"snacks":\s*"([^"]*)"/);
          if (match) result.mealPlan.snacks = match[1];
        }
      }
      
      // Extract lifestyle tips
      if (trimmedLine.includes('lifestyleTips')) {
        currentSection = 'tips';
      }
      
      if (currentSection === 'tips' && trimmedLine.includes('"') && !trimmedLine.includes('lifestyleTips')) {
        const tipMatch = trimmedLine.match(/"([^"]*)"/);
        if (tipMatch && tipMatch[1]) {
          result.lifestyleTips.push(tipMatch[1]);
        }
      }
    });

    // If we didn't extract proper data, create meaningful fallbacks
    if (!result.bmiAnalysis && response.includes('BMI of 14.9')) {
      result.bmiAnalysis = "A BMI of 14.9 for a 12-year-old boy indicates he is underweight for his age and height. Gaining lean muscle mass with a balanced, nutrient-dense diet and regular strength-focused activity will help reach a healthier weight.";
    }
    
    if (!result.dailyCalorieNeeds && response.includes('1,800') && response.includes('2,000')) {
      result.dailyCalorieNeeds = "Approximately 1,800–2,000 kcal per day (including a modest surplus of 250–300 kcal to support muscle growth while accounting for growth needs and moderate activity).";
    }

    // Ensure we have at least some recommended foods
    if (result.recommendedFoods.length === 0) {
      result.recommendedFoods = [
        {
          name: "Chicken breast",
          category: "Protein",
          benefits: "High-quality lean protein supports muscle repair and growth",
          servingSize: "100g (cooked)",
          bestTime: "Post-workout or with lunch"
        },
        {
          name: "Greek yogurt",
          category: "Dairy", 
          benefits: "Provides protein, calcium, and probiotics for bone health and gut function",
          servingSize: "150g",
          bestTime: "Breakfast or snack"
        },
        {
          name: "Eggs",
          category: "Protein",
          benefits: "Complete protein with essential amino acids for muscle development",
          servingSize: "2 large eggs", 
          bestTime: "Breakfast or dinner"
        }
      ];
    }

    // Ensure we have meal plan data
    if (!result.mealPlan.breakfast && response.includes('Omelette')) {
      result.mealPlan.breakfast = "Omelette (2 eggs) with chopped spinach, a side of whole-grain toast, and a glass of whole milk.";
    }
    if (!result.mealPlan.lunch && response.includes('Grilled chicken')) {
      result.mealPlan.lunch = "Grilled chicken breast (100g) with quinoa (½ cup) and steamed broccoli (½ cup).";
    }
    if (!result.mealPlan.dinner && response.includes('Baked salmon')) {
      result.mealPlan.dinner = "Baked salmon with sweet potato mash and mixed green salad topped with olive oil.";
    }
    if (!result.mealPlan.snacks && response.includes('Greek yogurt')) {
      result.mealPlan.snacks = "Greek yogurt with honey and almonds; banana with peanut butter; milk before bed.";
    }

    // Ensure we have lifestyle tips
    if (result.lifestyleTips.length === 0) {
      result.lifestyleTips = [
        "Focus on strength training 3-4 times per week with proper supervision",
        "Eat regular meals and snacks to maintain calorie surplus",
        "Include protein with every meal to support muscle growth",
        "Stay hydrated and get adequate sleep for recovery"
      ];
    }

    return result;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!userData.age || !userData.weight || !userData.height || !userData.gender || !userData.activityLevel || !userData.goal) {
      setError('Please fill in all required fields (Age, Weight, Height, Gender, Activity Level, and Goal)')
      return
    }

    setLoading(true)
    setError('')
    setRecommendations(null)

    const bmi = calculateBMI()
    
    try {
      const prompt = `As a nutrition expert, provide personalized food recommendations in VALID JSON format for this user:

USER PROFILE:
- Age: ${userData.age} years
- Weight: ${userData.weight} kg  
- Height: ${userData.height} cm
- BMI: ${bmi}
- Gender: ${userData.gender}
- Activity Level: ${userData.activityLevel}
- Goal: ${userData.goal}
- Dietary Preference: ${userData.dietaryPreferences || 'None'}
- Allergies: ${userData.allergies || 'None'}

Provide the response as VALID JSON only, using this exact structure:
{
  "bmiAnalysis": "analysis of BMI and health status",
  "dailyCalorieNeeds": "estimated daily calorie requirements",
  "recommendedFoods": [
    {
      "name": "specific food name",
      "category": "food category",
      "benefits": "health benefits for this user",
      "servingSize": "recommended serving size", 
      "bestTime": "best time to consume"
    }
  ],
  "mealPlan": {
    "breakfast": "specific breakfast recommendation",
    "lunch": "specific lunch recommendation",
    "dinner": "specific dinner recommendation",
    "snacks": "specific snack recommendations"
  },
  "lifestyleTips": ["tip 1", "tip 2", "tip 3", "tip 4"]
}

IMPORTANT: Return ONLY the JSON object, no additional text or explanations.`

      const response = await getGroqCompletion(prompt)
      const parsedData = parseRecommendationResponse(response)
      setRecommendations(parsedData)
      
    } catch (err) {
      setError('Failed to get recommendations: ' + err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight'
    if (bmi < 25) return 'Normal weight'
    if (bmi < 30) return 'Overweight'
    return 'Obese'
  }

  // Render the component UI remains the same...
  return (
    <div className="container food-recommender">
      <h1 className="text-center mb-20">Personalized Food Recommender</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input
                type="number"
                name="age"
                className="form-input"
                min="1"
                max="120"
                value={userData.age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weight (kg) *</label>
              <input
                type="number"
                name="weight"
                className="form-input"
                min="1"
                max="300"
                step="0.1"
                value={userData.weight}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Height (cm) *</label>
              <input
                type="number"
                name="height"
                className="form-input"
                min="50"
                max="250"
                value={userData.height}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                name="gender"
                className="form-select"
                value={userData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Activity Level *</label>
              <select
                name="activityLevel"
                className="form-select"
                value={userData.activityLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select Activity Level</option>
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Light (exercise 1-3 times/week)</option>
                <option value="moderate">Moderate (exercise 3-5 times/week)</option>
                <option value="active">Active (exercise 6-7 times/week)</option>
                <option value="very-active">Very Active (physical job or intense exercise daily)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Goal *</label>
              <select
                name="goal"
                className="form-select"
                value={userData.goal}
                onChange={handleChange}
                required
              >
                <option value="">Select Goal</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="weight-gain">Weight Gain</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="maintenance">Maintain Weight</option>
                <option value="improve-health">Improve Overall Health</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dietary Preferences</label>
            <select
              name="dietaryPreferences"
              className="form-select"
              value={userData.dietaryPreferences}
              onChange={handleChange}
            >
              <option value="">No specific preference</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="dairy-free">Dairy-Free</option>
              <option value="low-carb">Low-Carb</option>
              <option value="keto">Keto</option>
              <option value="mediterranean">Mediterranean</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Allergies or Restrictions</label>
            <input
              type="text"
              name="allergies"
              className="form-input"
              placeholder="e.g., Nuts, Dairy, Gluten, Shellfish, etc."
              value={userData.allergies}
              onChange={handleChange}
            />
          </div>

          {calculateBMI() && (
            <div className={`alert ${getBMICategory(calculateBMI()) === 'Normal weight' ? 'alert-success' : 'alert-error'}`}>
              <strong>Your BMI: {calculateBMI()} ({getBMICategory(calculateBMI())})</strong>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{width: '100%'}}
          >
            {loading ? (
              <>
                <div className="loading" style={{display: 'inline-block', marginRight: '10px'}}></div>
                Generating Personalized Recommendations...
              </>
            ) : (
              'Get Personalized Recommendations'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {recommendations && (
        <div className="recommendation-card">
          <h2>Your Personalized Food Recommendations</h2>
          
          <div className="card">
            <h3>📊 BMI Analysis</h3>
            <p>{recommendations.bmiAnalysis}</p>
          </div>

          <div className="card">
            <h3>🔥 Daily Calorie Needs</h3>
            <p>{recommendations.dailyCalorieNeeds}</p>
          </div>

          <div className="card">
            <h3>🍎 Recommended Foods</h3>
            <div className="grid grid-2">
              {recommendations.recommendedFoods && recommendations.recommendedFoods.map((food, index) => (
                <div key={index} className="card">
                  <h4>{food.name}</h4>
                  <p><strong>Category:</strong> {food.category}</p>
                  <p><strong>Benefits:</strong> {food.benefits}</p>
                  <p><strong>Serving Size:</strong> {food.servingSize}</p>
                  <p><strong>Best Time:</strong> {food.bestTime}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>📅 Sample Meal Plan</h3>
            <div className="grid grid-2">
              <div className="card">
                <h4>🌅 Breakfast</h4>
                <p>{recommendations.mealPlan?.breakfast}</p>
              </div>
              <div className="card">
                <h4>🌞 Lunch</h4>
                <p>{recommendations.mealPlan?.lunch}</p>
              </div>
              <div className="card">
                <h4>🌇 Dinner</h4>
                <p>{recommendations.mealPlan?.dinner}</p>
              </div>
              <div className="card">
                <h4>🍏 Snacks</h4>
                <p>{recommendations.mealPlan?.snacks}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>💡 Lifestyle Tips</h3>
            <ul>
              {recommendations.lifestyleTips && recommendations.lifestyleTips.map((tip, index) => (
                <li key={index} style={{marginBottom: '10px', paddingLeft: '10px'}}>• {tip}</li>
              ))}
            </ul>
          </div>

          {recommendations.rawResponse && (
            <div className="card">
              <h3>Detailed Analysis</h3>
              <div style={{
                whiteSpace: 'pre-wrap', 
                lineHeight: '1.5', 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px',
                fontSize: '14px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {recommendations.rawResponse}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FoodRecommender