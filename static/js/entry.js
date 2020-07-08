$(document).ready(function () {
    $('#itemsTable').DataTable();

    $('#addModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var id = button.data('id');
        var name = button.data('name');
        var barcode = button.data('barcode');
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this);
        modal.find('#addModalId').val(id);
        modal.find('#addModalName').val(name);
        modal.find('#addModalBarcode').val(barcode);
        modal.find('#addModalQuantity').val(1);
    });

    $('#editModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var id = button.data('id');
        var name = button.data('name');
        var barcode = button.data('barcode');
        var description = button.data('description');
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this);
        modal.find('#editModalId').val(id);
        modal.find('#editModalName').val(name);
        modal.find('#editModalBarcode').val(barcode);
        modal.find('#editModalDescription').val(description);
    });

    $('#removeModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var id = button.data('id');
        var name = button.data('name');
        var barcode = button.data('barcode');
        var maxCount = button.data('count');
        var customerOnyen = document.getElementById('customerOnyen').value;
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this);
        modal.find('#removeModalId').val(id);
        modal.find('#removeModalName').val(name);
        modal.find('#removeModalBarcode').val(barcode);
        modal.find('#removeModalQuantity').attr('max', maxCount);
        modal.find('#removeModalQuantity').val(1);
        if(customerOnyen) modal.find('#removeModalOnyen').val(customerOnyen);
    });
});