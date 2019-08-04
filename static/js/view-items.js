$('#addModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var id = button.data('id');
    var name = button.data('name');
    var barcode = button.data('barcode');
    var maxCount = button.data('count');
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    modal.find('#addModalId').val(id);
    modal.find('#addModalName').val(name);
    modal.find('#addModalBarcode').val(barcode);
    modal.find('#addModalQuantity').val(1);
    modal.find('#addModalQuantity').attr('max', maxCount);
});

$('#submitAddToCart').on('click', function(event) {
    $('#addToCartForm').submit();
});