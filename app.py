from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient

app = Flask(__name__)

# Initialize MongoDB client
client = MongoClient('localhost', 27017)
db = client['wt_project']
collection = db["test"]

# === Public Routes ===

# Home Page
@app.route('/')
def home():
    return render_template('home.html')

# Products Page
@app.route('/products')
def products():
    products = list(db.test.find({}, {'_id': 0}))  # Fetch products from DB
    return render_template('products.html', products=products)

# Recipes Page
@app.route('/recipes')
def recipes():
    return render_template('recipes.html')

# Account Page
@app.route('/account')
def account():
    return render_template('account.html')

# === Admin Route ===

# Admin Page
@app.route('/admin')
def admin_page():
    return render_template('admin.html')

# === API Routes for Admin (CRUD Operations) ===

# API: Get all products
@app.route('/api/products', methods=['GET'])
def get_products():
    products = list(db.test.find({}, {'_id': 0}))
    return jsonify(products), 200

# API: Add new product
@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    if not data or 'name' not in data or 'price' not in data:
        return jsonify({'error': 'Invalid data'}), 400
    db.test.insert_one(data)
    return jsonify({'message': 'Product added successfully!'}), 201

# API: Update a product by name
@app.route('/api/products/<string:name>', methods=['PUT'])
def update_product(name):
    data = request.json
    if not data:
        return jsonify({'error': 'Invalid data'}), 400
    result = db.test.update_one({"name": name}, {"$set": data})
    if result.matched_count == 0:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'message': 'Product updated successfully!'}), 200

# API: Delete a product by name
@app.route('/api/products/<string:name>', methods=['DELETE'])
def delete_product(name):
    result = db.test.delete_one({"name": name})
    if result.deleted_count == 0:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'message': 'Product deleted successfully!'}), 200

if __name__ == "__main__":
    try:
        app.run(debug=True)
    except KeyboardInterrupt:
        client.close()
