from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from pymongo import MongoClient
from bcrypt import hashpw, gensalt, checkpw
from flask_session import Session

app = Flask(__name__)

app.config['SECRET_KEY'] = '123'

client = MongoClient('localhost', 27017)
db = client['wt_project']
products_collection = db["products"]
accounts_collection = db["accounts"]

def create_admin_account():
    if accounts_collection.count_documents({"username": "admin"}) == 0:
        admin_user = {
            "username": "admin",
            "password": hashpw("admin_password".encode('utf-8'), gensalt()),
            "role": "admin"
        }
        accounts_collection.insert_one(admin_user)

create_admin_account() 

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/products')
def products():
    products = list(products_collection.find({}, {'_id': 0}))
    return render_template('products.html', products=products)

@app.route('/recipes')
def recipes():
    return render_template('recipes.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = accounts_collection.find_one({"username": username})
        if user and checkpw(password.encode('utf-8'), user['password']):
            session['username'] = username
            flash('Login successful!', 'success')
            return redirect(url_for('account'))
        else:
            flash('Invalid username or password', 'danger')
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('account'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = hashpw(password.encode('utf-8'), gensalt())
        if accounts_collection.find_one({"username": username}):
            flash('Username already exists!', 'danger')
            return redirect(url_for('register'))
        accounts_collection.insert_one({'username': username, 'password': hashed_password, 'role': "user"})
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/account')
def account():
    return render_template('account.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/admin')
def admin():
    if 'username' not in session:
        flash('You must be logged in to access the admin page.', 'danger')
        return redirect(url_for('login'))

    username = session['username']
    user = accounts_collection.find_one({"username": username})

    if user and user.get('role') == 'admin':
        return render_template('admin.html')
    else:
        flash('You do not have permission to access the admin page.', 'danger')
        return redirect(url_for('home'))

@app.route('/api/products', methods=['GET'])
def get_products():
    products = list(products_collection.find({}, {'_id': 0}))
    return jsonify(products), 200

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    if not data or 'name' not in data or 'price' not in data:
        return jsonify({'error': 'Invalid data'}), 400
    products_collection.insert_one(data)
    return jsonify({'message': 'Product added successfully!'}), 201

@app.route('/api/products/<string:name>', methods=['PUT'])
def update_product(name):
    data = request.json
    if not data:
        return jsonify({'error': 'Invalid data'}), 400
    result = products_collection.update_one({"name": name}, {"$set": data})
    if result.matched_count == 0:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'message': 'Product updated successfully!'}), 200

@app.route('/api/products/<string:name>', methods=['DELETE'])
def delete_product(name):
    result = products_collection.delete_one({"name": name})
    if result.deleted_count == 0:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'message': 'Product deleted successfully!'}), 200

if __name__ == "__main__":
    try:
        app.run(debug=True)
    except KeyboardInterrupt:
        client.close()
