import os
import logging
from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename
from crop_data import get_crop_recommendation
from disease_detection import analyze_plant_disease
from weather_service import WeatherService
from ml_service import CropMLService
import base64
from google import genai
from google.genai import types
import markdown

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure Google Gemini API Key securely
API_KEY = os.environ.get("gemini-api")  # Use an environment variable
client = genai.Client(api_key=API_KEY)

# Function to generate AI response
def generate(user_message):
    model = "gemini-2.0-flash"
    
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_message)],
        ),
    ]
    
    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        top_k=40,
        max_output_tokens=8192,
        response_mime_type="text/plain",
        system_instruction=[
            types.Part.from_text(
                text="""You are Bhumi, an expert AI farming assistant focused on sustainable agriculture. Your goal is to help farmers grow healthier crops by providing the best farming practices, organic solutions, and weather-based tips. Answer in a simple, farmer-friendly tone. Give step-by-step instructions where needed. Provide eco-friendly and low-cost solutions if possible. Here’s the query:

 #  {Farmer's Question}

 #  💡 If the farmer asks about a specific crop (e.g., rice, wheat, tomatoes), provide: 1. Best soil type & preparation methods.
 #  2. Ideal watering schedule & techniques.
 #  3. Common diseases & natural/chemical treatments.
 #  4. Fertilization & organic composting tips.
 #  5. Weather-based precautions & pest control strategies.
 #  6. Post-harvest handling & storage advice.

 #  🚜 If the farmer asks a general question (e.g., how to improve soil fertility, how to control pests), provide:
 #  1. Easy-to-follow techniques (e.g., crop rotation, mulching, composting).
 #  2. Low-cost or organic alternatives.
 #  3. A brief explanation of why the method works.

 #  🗣️ If the input is in voice format, respond in a friendly conversational tone.
 #  🔄 Keep responses concise yet informative (150-200 words max).
 #  📌 If the farmer needs step-by-step guidance, list the steps clearly."""
            ),
        ],
    )

    # Stream AI Response
    response_text = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        response_text += chunk.text

    return markdown.markdown(response_text)  # Convert to HTML

# Initialize services
weather_service = WeatherService()
ml_service = CropMLService()

# Log API key status (without revealing the key)
logger.debug("Weather API Key status: %s", "Present" if os.environ.get('OPENWEATHERMAP_API_KEY') else "Missing")

# Configure upload folder
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def landing_page():
    return render_template('index.html')

@app.route('/dashboard', methods=["GET"])
def home_page():
    return render_template('home.html')

@app.route('/api/chat', methods=["POST"])
def chat():
    data = request.json
    user_input = data.get('message', '')

    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    ai_response = generate(user_input)
    return jsonify({"response": ai_response})

@app.route('/index')
def index():
    try:
        # Get weather data for a default location (can be made dynamic later)
        logger.debug("Attempting to fetch weather data for Mumbai")
        weather_data = weather_service.get_weather('Mumbai')

        if weather_data is None:
            logger.warning("Weather data fetch failed, rendering template with warning")
            return render_template('index1.html', weather=None, 
                                weather_error="Unable to fetch weather data. Please check your API key.")

        logger.debug("Weather data fetched successfully: %s", weather_data)
        return render_template('index1.html', weather=weather_data)

    except Exception as e:
        logger.error("Error in index route: %s", str(e))
        return render_template('index1.html', weather=None, 
                             weather_error="An error occurred while fetching weather data.")
    
@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.form
        soil_type = data.get('soil_type')
        season = data.get('season')

        # If temperature and rainfall are not provided, get them from weather API
        if not data.get('temperature') or not data.get('rainfall'):
            weather_data = weather_service.get_weather('Mumbai')
            if weather_data:
                temperature = weather_data['temperature']
                rainfall = weather_data['rainfall']
            else:
                return jsonify({'error': 'Could not fetch weather data'}), 500
        else:
            temperature = float(data.get('temperature', 0))
            rainfall = float(data.get('rainfall', 0))

        if not all([soil_type, season]):
            return jsonify({'error': 'All fields are required'}), 400

        # Use ML service for recommendations
        recommendation = ml_service.get_crop_recommendations(soil_type, season, temperature, rainfall)
        return render_template('recommendation.html', recommendation=recommendation)

    except ValueError as e:
        return jsonify({'error': 'Invalid numeric values provided'}), 400
    except Exception as e:
        logging.error(f"Error in recommendation: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    
# Keep the disease detection routes unchanged
@app.route('/disease-detection')
def disease_detection():
    return render_template('disease_detection.html')

@app.route('/analyze-disease', methods=['POST'])
def analyze_disease():
    if 'plant_image' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['plant_image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Analyze the image using our disease detection module
        result = analyze_plant_disease(filepath)

        if result:
            result['image_url'] = url_for('static', filename=f'uploads/{filename}')
            return render_template('disease_result.html', result=result)
        else:
            return render_template('disease_detection.html', 
                                 error="Could not detect any known diseases. Please try with a clearer image.")

    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
