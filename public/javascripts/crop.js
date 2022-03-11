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
                        $('#remove-proBtn').html(`<a class="remove-pro {{#if user.propic}}{{else}}d-none{{/if}}" href="#" onclick="removeproPic(event)"><span class="profilepic__text"><i class="fas fa-trash-alt mr-1"></i>Remove</span></label></a>`)

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
            $('#profile-name').html(data.name)
            $('#header-userName').html(data.name)

            $('#data-update-loading').hide()
            $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>Details updated successfully');
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        }
    });

});


function removeproPic(e) {
    e.preventDefault()

    $.ajax({
        type: "get",
        url: "/removedp",
        beforeSend: function() {

            $('.profilepic').hide()
            $('.profilepic-loading').show()

        },
        success: function(data) {

            if (data.status) {
                $('#propic-round').attr('src', "images/site/default.jpg");
                $('#headerPropic').attr('src', "images/site/default.jpg");
                $('.profilepic').show()
                $('.profilepic-loading').hide()
                $('#remove-proBtn').html("")

                $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>Profile pic removed successfully');
                $("#snackbar").addClass("show");
                setTimeout(function() {
                    $("#snackbar").removeClass("show");
                }, 3000);
            } else {
                $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>Error occured');
                $("#snackbar").addClass("show");
                setTimeout(function() {
                    $("#snackbar").removeClass("show");
                }, 3000);
            }


        },
        error: function(data) {
            $('#paypal-update-loading').hide()
            $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>Error adding data');
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        }
    });
}



$("#payment-form").submit(function(e) {

    e.preventDefault();
    var form = $(this);
    var actionUrl = form.attr('action');

    $.ajax({
        type: "POST",
        url: actionUrl,
        data: form.serialize(),
        beforeSend: function() {

            $('#paypal-update-loading').show()
            $("#payment-form input").prop('disabled', true);

        },
        success: function(data) {

            if (data.status) {

                if ($(".paypal-list li").length == 0) {
                    $('#empty-div').hide()
                }

                let index = $(".paypal-list li").length + 1;


                $("#payment-form input").prop('disabled', false);
                let html = $(".paypal-list").html()
                $(".paypal-list").html(html + `<li id="${index}">
                        <div class="skills-list pColor">
                        <span>${data.email}</span><a href="#" onclick="deletePaypal('${data.email}',${index},event)"><i class="fas fa-times-circle ml-2"></i></a>
                        </div>
                     </li>`)

                $('#paypal-update-loading').hide()
                $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>New paypal account added successfully');
                $("#snackbar").addClass("show");
                setTimeout(function() {
                    $("#snackbar").removeClass("show");
                }, 3000);
            } else {
                $("#payment-form input").prop('disabled', false);
                $('#paypal-update-loading').hide()
                $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>' + data.err);
                $("#snackbar").addClass("show");
                setTimeout(function() {
                    $("#snackbar").removeClass("show");
                }, 3000);
            }

        },
        error: function(data) {
            $("#payment-form input").prop('disabled', false);
            $('#paypal-update-loading').hide()
            $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>Error adding data');
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        }
    });

});



function deletePaypal(email, index, e) {
    e.preventDefault()
    index = parseInt(index)

    $.ajax({
        type: "POST",
        url: '/remove-payment',
        data: { email: email },
        beforeSend: function() {



        },
        success: function(data) {

            $("#" + index).remove()

            if ($(".paypal-list li").length == 0) {
                $('#empty-div').show()
            }

            $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>Removed successfully');
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        }
    });

}



function checkPass() {
    let newpass = document.forms["password-form"]["new"].value;
    let newConfirm = document.forms["password-form"]["new-confirm"].value;

    if (newpass === newConfirm) {

        $('#passErr').html("")
        return true;
    } else {
        $('#passErr').html("Password must match")
        return false;
    }
}




$("#password-form").submit(function(e) {

    e.preventDefault()

    var form = $(this);

    $.ajax({
        type: "POST",
        url: '/change-password',
        data: form.serialize(),

        beforeSend: function() {
            $('#password-loading').show()
            $("#password-form input").prop('disabled', true);

        },

        success: function(data) {

            $("#password-form input").prop('disabled', false);
            $('#password-loading').hide()


            if (data.status) {

                Swal.fire({
                    title: 'Great !',
                    text: 'Password changed successfully!',
                    icon: 'success',
                    confirmButtonText: 'Done'
                })

            } else {
                $('#passErr').html(data.error)
            }
        }
    });

})