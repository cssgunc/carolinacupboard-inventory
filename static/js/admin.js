$('#editModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var onyen = button.data('onyen'); // Extract info from data-* attributes
    var type = button.data('type');
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    modal.find('#editModalOnyen').val(onyen);
    modal.find('#editModalType').val(type);
});

$('#deleteModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var onyen = button.data('onyen'); // Extract info from data-* attributes
    var type = button.data('type');
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    modal.find('#deleteModalOnyen').val(onyen);
    modal.find('#deleteModalType').val(type);
});

$('#submitCreate').on('click', function(event) {
    $('#createForm').submit();
});

$('#submitEdit').on('click', function(event) {
    $('#editForm').submit();
});

$('#submitDelete').on('click', function(event) {
    $('#deleteForm').submit();
});