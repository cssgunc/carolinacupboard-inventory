$('#completeModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var id = button.data('id');
    var name = button.data('name');
    var onyen = button.data('onyen');
    var count = button.data('count');
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    modal.find('#completeModalId').val(id);
    modal.find('#completeModalName').val(name);
    modal.find('#completeModalOnyen').val(onyen);
    modal.find('#completeModalCount').val(count);
});

$('#cancelModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var id = button.data('id');
    var name = button.data('name');
    var onyen = button.data('onyen');
    var count = button.data('count');
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    modal.find('#cancelModalId').val(id);
    modal.find('#cancelModalName').val(name);
    modal.find('#cancelModalOnyen').val(onyen);
    modal.find('#cancelModalCount').val(count);
});

$('#submitComplete').on('click', function(event) {
    console.log(event);
    $('#completeForm').submit();
});

$('#submitCancel').on('click', function(event) {
    $('#cancelForm').submit();
});