$("#admin-log-form").submit(function(e) {

    if (true) {

        e.preventDefault();

        var form = $(this);
        var actionUrl = form.attr('action');

        $.ajax({
            type: "POST",
            url: actionUrl,
            data: form.serialize(),
            beforeSend: function() {
                $('.loginBtn').html(`<i class="fas fa-circle-notch fa-spin mr-2"></i>Signing in...`)
            },
            success: function(data) {
                if (data.status) {
                    window.location.href = "/admin";
                    $('.loginBtn').html(`Success. Redirecting...`)
                } else {
                    $('.loginError').show()
                    $('.loginError').html(`<b>Oops: </b> ${data.error}`)
                    $('.loginBtn').html(`Sign in`)
                }
            }
        });
    }

});