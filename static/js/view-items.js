$('#reserveModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var id = button.data('id');
    var name = button.data('name');
    var barcode = button.data('barcode');
    var maxCount = button.data('count');
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    modal.find('#reserveModalId').val(id);
    modal.find('#reserveModalName').val(name);
    modal.find('#reserveModalBarcode').val(barcode);
    modal.find('#reserveModalQuantity').attr('max', maxCount);
    modal.find('#reserveModalQuantity').val(1);
});