toasts = [];

$(document).ready(function () {
    $('#itemsTable').DataTable({
        'order': [[2, 'desc']]
    });

    $('#addToCartButton').on('click', function (event) {
        const button = $(event.target); // Button that triggered the modal
        
        // Pulls data values attached to button
        const id = button.data('id');
        const name = button.data('name');
        const barcode = button.data('barcode');
        const count = button.data('count');
        const description = button.data('description');
        const addToCartQuantity = $('#cartQuantity').val();

        // Create toast alert
        let toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.setAttribute('aria-atomic', 'true');
        toast.setAttribute('data-autohide', 'true');
        toast.setAttribute('data-delay', '5000');
        
        let toastHeader = document.createElement('div');
        toastHeader.className = 'toast-header';

        let toastHeaderText = document.createElement('strong');
        toastHeaderText.className = 'mr-auto';

        let toastClose = document.createElement('button');
        toastClose.className = 'ml-2 mb-1 close';
        toastClose.setAttribute('type', 'button');
        toastClose.setAttribute('data-dismiss', 'toast');
        toastClose.setAttribute('aria-label', 'Close');

        let toastCloseIcon = document.createElement('span');
        toastCloseIcon.setAttribute('aria-hidden', 'true');
        toastCloseIcon.innerHTML = '&times;';

        let toastBody = document.createElement('div');
        toastBody.className = 'toast-body';

        toastHeader.appendChild(toastHeaderText);
        toastClose.appendChild(toastCloseIcon);
        toastHeader.appendChild(toastClose);
        toast.appendChild(toastHeader);
        toast.appendChild(toastBody);
        document.getElementById('toast-pos').appendChild(toast);

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
                // Adds to existing amount if item is already in cart
                for (let i = 0; i < cart.length; i++) {
                    if (cart[i].id === id) {
                        // Cannot add more than currently exist in inventory
                        if (count === parseInt(cart[i].quantity)) {
                            toastHeaderText.appendChild(document.createTextNode('Error'));
                            toastBody.appendChild(document.createTextNode('There is not enough ' + name + ' in stock'));
                        } else {
                            cart[i].quantity = Math.min(count, parseInt(cart[i].quantity) + parseInt(addToCartQuantity));
                            console.log('ADDED');
                            toastHeaderText.appendChild(document.createTextNode('Success'));
                            toastBody.appendChild(document.createTextNode(name + ' added to cart, qty: ' + addToCartQuantity));
                        }
                        found = true;
                        break;
                    }
                }
                // If not yet in cart, push a new item
                if (!found) cart.push(newItem);
                localStorage.setItem('cart', JSON.stringify(cart));
            } else {
                localStorage.setItem('cart', JSON.stringify([newItem]));
                toastHeaderText.appendChild(document.createTextNode('Success'));
                toastBody.appendChild(document.createTextNode(name + ' added to cart, qty: ' + addToCartQuantity));
            }
        } else {
            toastHeaderText.appendChild(document.createTextNode('Error'));
            toastBody.appendChild(document.createTextNode('There is not enough ' + name + ' in stock'));
        }

        $('.toast').toast('show');
        // $('.toast').on('hidden.bs.toast', (e) => {
        //     console.log(e);
        //     e.target.outerHTML = '';
        // });
    });
});