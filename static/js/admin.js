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
                    ${product.name} - $${product.price}
                    <button onclick="deleteProduct('${product.name}')">Delete</button>
                    <button onclick="editProduct('${product.name}', ${product.price})">Edit</button>
                `;
                productList.appendChild(listItem);
            });
        });
}

document.getElementById('addProductForm').onsubmit = function(event) {
    event.preventDefault(); // Prevent page reload

    const name = document.getElementById('newProductName').value;
    const price = document.getElementById('newProductPrice').value;

    fetch('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, price: parseFloat(price) }),
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
