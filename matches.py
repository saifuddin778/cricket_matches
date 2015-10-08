import json

config = {
    'template': 'templates/index.html',
}


def get_country(country):
    """
    Returns a given country's matches data
    """
    with open('processed/data.json') as matches_data:
        data = json.load(matches_data)
    if country in data:
        return data[country]
    else:
        return dict((k, {}) for k in data.keys())
    
