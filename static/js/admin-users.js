$(document).ready(function () {
    $('#usersTable').DataTable();
    
    $('#editModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var onyen = button.data('onyen'); // Extract info from data-* attributes
        var type = button.data('type');
        var pid = button.data('pid');
        var email = button.data('email');
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this);
        modal.find('#editModalOnyen').val(onyen);
        modal.find('#editModalType').val(type);
        modal.find('#editModalPid').val(pid);
        modal.find('#editModalEmail').val(email);
    });

    $('#deleteModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var onyen = button.data('onyen'); // Extract info from data-* attributes
        var type = button.data('type');
        var pid = button.data('pid');
        var email = button.data('email');
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this);
        modal.find('#deleteModalOnyen').val(onyen);
        modal.find('#deleteModalType').val(type);
        modal.find('#deleteModalPid').val(pid);
        modal.find('#deleteModalEmail').val(email);
    });
});