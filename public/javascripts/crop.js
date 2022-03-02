jQuery(document).ready(function($) {

    var $modal = $('#modal_crop');
    var crop_image = document.getElementById('sample_image');
    var cropper;
    $('#upload_image').change(function(event) {
        var files = event.target.files;
        var done = function(url) {
            crop_image.src = url;
            jQuery.noConflict();
            $modal.modal('show');
        };
        if (files && files.length > 0) {
            reader = new FileReader();
            reader.onload = function(event) {
                done(reader.result);
            };
            reader.readAsDataURL(files[0]);
        }
    });
    $modal.on('shown.bs.modal', function() {
        cropper = new Cropper(crop_image, {
            aspectRatio: 1,
            viewMode: 3,
            preview: '.preview'
        });
    }).on('hidden.bs.modal', function() {
        cropper.destroy();
        cropper = null;
    });
    $('#crop_and_upload').click(function() {
        canvas = cropper.getCroppedCanvas({
            width: 400,
            height: 400
        });
        canvas.toBlob(function(blob) {
            url = URL.createObjectURL(blob);
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function() {
                var base64data = reader.result;

                $("#test").html(`<img src='${base64data}'>`)
                $.ajax({
                    url: '/changeDp',
                    method: 'POST',
                    data: { crop_image: base64data },
                    beforeSend: function() {
                        $modal.modal('hide');
                        $('.profilepic').hide()
                        $('.profilepic-loading').show()
                    },
                    success: function(data) {

                        $('#propic-round').attr('src', "images/profile-pics/" + data.image);
                        $('#headerPropic').attr('src', "images/profile-pics/" + data.image);
                        $('.profilepic').show()
                        $('.profilepic-loading').hide()

                        $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>Profile pic updated successfully');
                        $("#snackbar").addClass("show");
                        setTimeout(function() {
                            $("#snackbar").removeClass("show");
                        }, 3000);
                    }
                });
            };
        });
    });
});



$("#skillUpdate").submit(function(e) {

    e.preventDefault();
    var form = $(this);
    var actionUrl = form.attr('action');

    $.ajax({
        type: "POST",
        url: actionUrl,
        data: form.serialize(),
        beforeSend: function() {
            $('#skill-update-loading').show()
        },
        success: function(data) {
            $('#skill-update-loading').hide()
            console.log(data);

            let html = ""
            data.forEach(elem => {
                html = html + ` <span>${elem.name}</span>`
            })

            $('.skills-list').html(html)

            $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>Skills updated successfully');
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        },

        error: function(error) {

            $("#snackbar").html('<i class="far fa-exclamation-circle mr-2" style="color:white"></i>Server Timeout. Login again');
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        }
    });

});



$("#bio-form").submit(function(e) {

    e.preventDefault();
    var form = $(this);
    var actionUrl = form.attr('action');

    $.ajax({
        type: "POST",
        url: actionUrl,
        data: form.serialize(),
        beforeSend: function() {
            $('#data-update-loading').show()
            $("#bio-form input,textarea,select").prop('disabled', true);

        },
        success: function(data) {

            $("#bio-form input,textarea,select").prop('disabled', false);

            $('#data-update-loading').hide()
            $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>Details updated successfully');
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        }
    });

});