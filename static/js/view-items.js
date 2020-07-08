$(document).ready(function () {
    $('#itemsTable').DataTable({
        'order': [[2, 'desc']]
    });

    $('#addToCartButton').on('click', function (event) {
        const button = $(event.target); // Button that triggered the modal
        const id = button.data('id');
        const name = button.data('name');
        const barcode = button.data('barcode');
        const count = button.data('count');
        const description = button.data('description');
        const addToCartQuantity = $('#cartQuantity').val();

        if (addToCartQuantity <= count) {
            
            const newItem = {
                id: id,
                name: name,
                barcode: barcode,
                quantity: addToCartQuantity,
                description: description
            }

            let cart = localStorage.getItem('cart');
            if (cart) {
                cart = JSON.parse(cart);
                let found = false;
                for (let i = 0; i < cart.length; i++) {
                    if (cart[i].id === id) {
                        cart[i].quantity = Math.min(count, parseInt(cart[i].quantity) + parseInt(addToCartQuantity));
                        found = true;
                        break;
                    }
                }
                if (!found) cart.push(newItem);
                localStorage.setItem('cart', JSON.stringify(cart));
            } else {
                localStorage.setItem('cart', JSON.stringify([newItem]));
            }
        }
    });
});