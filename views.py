import requests

def get_search():
     url = "http://127.0.0.1:8000/api/people"
     headers = {'content-type': 'application/json'}
     try:
        response = requests.get(url,headers=headers)
        return response
     except requests.exceptions.ConnectionError as e:
        print "These aren't the domains we're looking for."
