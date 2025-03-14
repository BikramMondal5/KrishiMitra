from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def landing_page():
    return render_template('index.html')

@app.route('/dashboard')
def home_page():
    return render_template('home.html')

if __name__ == '__main__':
    app.run(debug=True)
