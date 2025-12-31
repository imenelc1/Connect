import requests

TOKEN = "token"
API_URL = "http://127.0.0.1:8000/api/dashboard/tentatives/create/"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# IDs de 7 exercices différents
EXERCICES_IDS = [1, 2, 3, 4, 5, 6, 7]

for i, EXERCICE_ID in enumerate(EXERCICES_IDS):
    payload = {
        "exercice_id": EXERCICE_ID,
        "etat": "soumis",
        "reponse": "test",
        "output": "ok",
        "temps_passe": 600
    }

    res = requests.post(API_URL, json=payload, headers=headers)
    print(f"Exercice {EXERCICE_ID}: {res.status_code} - {res.json()}")
