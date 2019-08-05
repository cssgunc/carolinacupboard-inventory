$('#addToCartModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var id = button.data('id');
    var name = button.data('name');
    var barcode = button.data('barcode');
    var maxCount = button.data('count');
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    modal.find('#addToCartModalId').val(id);
    modal.find('#addToCartModalName').val(name);
    modal.find('#addToCartModalBarcode').val(barcode);
    modal.find('#addToCartModalQuantity').attr('max', maxCount);
    modal.find('#addToCartModalQuantity').val(1);
});

$('#submitAddToCart').on('click', function(event) {
    $('#addToCartForm').submit();
});