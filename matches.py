import json, ast

config = {
    'template': 'templates/index.html',
    'create_directory': '../templates/cricket_matches/',
}


def get_country(country):
    """
    Returns a given country's matches data
    """
    with open('processed/data.json') as matches_data:
        data = json.load(matches_data)
    print sorted(data.keys())
    if country in data:
        return data[country]
    else:
        return dict((k, {}) for k in data.keys())

#    
#countries = ['Australia', 'India', 'Pakistan', 'England', 'Sri Lanka', 'West Indies', 'New Zealand']
#
#for each in countries:
#    aus = get_country(each)
#    res = []
#    for k in aus:
#        for j in aus[k]:
#            for l in aus[k][j]:
#                res.append(l['location'])
#        
#print set(res)
#print len(set(res))