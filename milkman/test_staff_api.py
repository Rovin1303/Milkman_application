import requests

LOGIN_URL = 'http://127.0.0.1:8000/staff/login/'
STAFF_URL = 'http://127.0.0.1:8000/staff/staff/'

r = requests.post(LOGIN_URL, json={'email':'admin@gmail.com','password':'admin123'})
print('login', r.status_code, r.text)
if r.ok:
    token = r.json().get('token')
    r2 = requests.get(STAFF_URL, headers={'Authorization': f'Token {token}'})
    print('staff list', r2.status_code, r2.text)
else:
    print('login failed')
