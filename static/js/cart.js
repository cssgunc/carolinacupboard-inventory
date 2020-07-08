$(document).ready(function () {
    // Grab cart from local storage and parse as JSON
    let cart = JSON.parse(localStorage.getItem('cart'));
    if (cart) {
        let tbody = document.getElementById('cart-tbody');

        // Dynamically generate table rows from cart items
        cart.forEach((item, i) => {
            let row = document.createElement('tr');
            
            // Name cell contains name text
            let nameCell = document.createElement('td');
            nameCell.appendChild(document.createTextNode(item.name));
            row.appendChild(nameCell);

            // Barcode cell contains barcode text
            let barcodeCell = document.createElement('td');
            barcodeCell.appendChild(document.createTextNode(item.barcode ? item.barcode : ''));
            row.appendChild(barcodeCell);

            // Quantity cell contains number input that allows users to change the quantity in their cart
            let quantityCell = document.createElement('td');
            // Create input element and set attributes
            let quantityInput = document.createElement('input');
            quantityInput.className = 'form-control';
            quantityInput.setAttribute('type', 'number');
            quantityInput.setAttribute('min', '1');
            quantityInput.setAttribute('max', item.quantity);
            quantityInput.setAttribute('value', item.quantity);
            quantityInput.setAttribute('style', 'width: 80px');
            // On change, we update the cart's state in localstorage
            quantityInput.addEventListener('change', (event) => {
                if (event.target.value > 0 && event.target.value < event.target.max) {
                    let currCart = JSON.parse(localStorage.getItem('cart'));
                    // Search for an item with the same item id, and update the quantity
                    for(let i = 0; i < currCart.length; i++) {
                        if (currCart[i].id === item.id) {
                            currCart[i].quantity = event.target.value;
                            break;
                        }
                    }
                    // Stringify and save updated cart
                    localStorage.setItem('cart', JSON.stringify(currCart));
                }
            });
            quantityCell.appendChild(quantityInput);
            row.appendChild(quantityCell);

            // Description cell contains description text
            let descCell = document.createElement('td');
            descCell.appendChild(document.createTextNode(item.description ? item.description : ''));
            row.appendChild(descCell);

            // Action cell contains delete button
            let actionCell = document.createElement('td');
            actionCell.className = 'text-right';
            let deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger';
            deleteButton.setAttribute('type', 'button');
            deleteButton.setAttribute('data-id', item.id);
            // On click, delete item from cart
            deleteButton.addEventListener('click', (event) => {
                let currCart = JSON.parse(localStorage.getItem('cart'));
                // Search for an item with the same item id, and remove it
                for(let i = 0; i < currCart.length; i++) {
                    if (currCart[i].id === item.id) {
                        currCart.splice(i,1);
                        break;
                    }
                }
                console.log(currCart);
                // Stringify and save updated cart
                localStorage.setItem('cart', JSON.stringify(currCart));
                event.target.parentNode.parentNode.outerHTML = '';
            });
            deleteButton.appendChild(document.createTextNode('Remove from Cart'));
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            tbody.appendChild(row);
        });
    }
});