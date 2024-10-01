from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
API_KEY = os.getenv('IwWsSjXyjvS5hgtAZGe9O6gN')
SECRET_KEY = os.getenv('y6Q1F74XCU8SOVN21TJDGpZnGvm35agU')

def get_access_token():
    url = f"https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id={API_KEY}&client_secret={SECRET_KEY}"
    response = requests.post(url)
    if response.status_code == 200:
        return response.json().get('access_token')
    else:
        raise Exception("Failed to get access token")

@app.route('/chat', methods=['POST'])
def chat():
    try:
        message = request.json.get('message')
        if not message:
            return jsonify({"error": "No message provided"}), 400

        access_token = get_access_token()
        api_url = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant'
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        data = {
            "messages": [{"role": "user", "content": message}]
        }
        
        response = requests.post(f"{api_url}?access_token={access_token}", headers=headers, json=data)
        
        if response.status_code != 200:
            return jsonify({"error": f"API responded with status {response.status_code}"}), 500

        result = response.json()
        
        if 'error_code' in result:
            return jsonify({"error": f"API error: {result['error_msg']}"}), 500

        if 'result' not in result:
            return jsonify({"error": "Empty response from API"}), 500

        return jsonify({"response": result['result']})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)