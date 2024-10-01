from flask import Flask, render_template
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client['wt_project']
collection = db["test"]

@app.route('/')
def home():
    products = db.test.find()  # Retrieve all products from the database
    return render_template('index.html', products=products)

if __name__ == "__main__":
    app.run(debug=True)