import sys, ast, json
from flask import Flask, request, render_template
from flask.ext.script import Manager, Server

from matches import get_country

cricket_app = Flask(__name__)
cricket_app.debug = True
manager = Manager(cricket_app)

def main_():
    port = 2345
    manager.add_command("runserver", Server(host='0.0.0.0', port=port))
    manager.run()

@cricket_app.route('/')
def index():
    return json.dumps({'app': 'cricket matches --> 18[something] to 2015..', 'v': '1.0'})

@cricket_app.route('/teams/')
def teams():
    return render_template('sorted.html')

@cricket_app.route('/get_team/')
def get_team():
    team = request.args['team'].encode('utf-8')
    response = get_country(team)
    return json.dumps(response)


if __name__ == '__main__':
    if len(sys.argv) == 2:
        if 'runserver' in sys.argv:
            main_()