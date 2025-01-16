window.onload = function() {
    loadProducts();
}

function loadProducts() {
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const productList = document.getElementById('productList');
            productList.innerHTML = '';
            data.forEach(product => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span class="product-info">${product.name} - $${product.price}</span>
                    <div class="button-group">
                        <button onclick="deleteProduct('${product.name}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button onclick="editProduct('${product.name}', ${product.price})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                    <div class="image-group">
                        <span>Current Image:</span>
                        <img src="/static/img/products/${product.image}" alt="${product.name}" class="product-image" id="current-image-${product.name}">
                        <input type="file" id="image-upload-${product.name}" class="image-upload" onchange="updateProductImage('${product.name}')">
                        <label for="image-upload-${product.name}">
                            <i class="fas fa-image"></i> Upload Image
                        </label>
                    </div>
                `;
                productList.appendChild(listItem);
            });
        });
}

document.getElementById('addProductForm').onsubmit = function(event) {
    event.preventDefault();

    const name = document.getElementById('newProductName').value;
    const price = document.getElementById('newProductPrice').value;
    const imageFile = document.getElementById('newProductImage').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', parseFloat(price));
    formData.append('image', imageFile);

    fetch('/api/products', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadProducts();
    });
}

function deleteProduct(name) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    fetch(`/api/products/${name}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadProducts();
    });
}

function editProduct(name, currentPrice) {
    const newPrice = prompt(`Enter new price for ${name}`, currentPrice);

    if (newPrice !== null) {
        fetch(`/api/products/${name}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ price: parseFloat(newPrice) }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadProducts();
        });
    }
}

function updateProductImage(name) {
    const imageFile = document.getElementById(`image-upload-${name}`).files[0];
    if (!imageFile) return;

    const formData = new FormData();
    formData.append('image', imageFile);

    fetch(`/api/products/${name}/image`, {
        method: 'PUT',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadProducts();
    });
}

document.getElementById('csvFile').addEventListener('change', function(event) {
    const fileName = event.target.files.length ? event.target.files[0].name : 'No file chosen';
    document.getElementById('csvFileName').textContent = 'Selected file: ' + fileName;
});

function showImagePreview(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const imagePreview = document.getElementById('imagePreview');

    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagePreview.style.display = 'inline';
            imagePreview.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = 'none';
        imagePreview.src = '';
    }
}

document.getElementById('csvUploadForm').onsubmit = function(event) {
    event.preventDefault();

    console.log("CSV Form Submitted");

    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a CSV file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append('csv', file);

    console.log("Uploading file:", file.name);

    fetch('/api/products/csv', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log("CSV Upload Response:", data);
        alert(data.message);
        loadProducts();
    })
    .catch(error => {
        console.error('Error uploading CSV:', error);
        alert('Failed to upload CSV. Please try again.');
    });
};
