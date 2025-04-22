import requests
import json

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NTI3MTc4NSwianRpIjoiZWU3Y2VlNjQtNTNlYi00NTgwLWFmMjgtZTA5NTgzODQ5ZjE0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3NDUyNzE3ODUsImNzcmYiOiI1N2Y5MDAxMi1mNjRmLTRjOWMtYjg0MS1lZTU1Mzc1OGY4YzkiLCJleHAiOjE3NDUyNzI2ODV9.BubwyTAhOewW_0OdSaKPxfqsZOWJ4L8PXYlEhNWmG9Y"
user_id = 1
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

case = {
    "nom": "Ahmed Updated",
    "prenom": "Ben Ali Updated",
    "filiere": "Informatique Avancée",
    "competences": "Python, JavaScript, Java",
    "photo": "https://example.com/updated_photo.jpg"
}
    

url = f"http://localhost:5000/api/profile/{user_id}"
try:
    response = requests.put(url, headers=headers, data=json.dumps(case))
    print("Status Code:", response.status_code)
    print("Response:", response.json())
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
print("-" * 50)