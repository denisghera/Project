document.getElementById('add-ingredients-btn').addEventListener('click', function() {
    const ingredients = [...document.querySelectorAll('.recipe-ingredients li')].map(ingredient => ingredient.textContent);

    fetch('/add_ingredients_to_cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredients }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Ingredients added to cart successfully!');
        } else {
            alert('The following items are not part of our offer: ' + data.missing.join(', '));
        }
    })
    .catch(error => console.error('Error:', error));
});