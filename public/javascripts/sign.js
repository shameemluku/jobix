function changeBtnColor() {
    var checkBox = document.getElementById("togBtn");
    var button = document.getElementById("submitBtn");
    if (checkBox.checked == true) {
        button.style.backgroundColor = "#2ab934";
    } else {
        button.style.backgroundColor = "#D62828";
    }
}

function checkOtp(otp) {
    let userOtp = document.forms["otpForm"]["otp"].value;

    if (otp === userOtp) {
        var alertDiv = document.getElementById("error-otp");
        alertDiv.style.display = "none";
        return true;

    } else {
        var alertDiv = document.getElementById("error-otp");
        alertDiv.style.display = "block";
        return false;
    }
}


function saveProject(pId) {
    var reqData = {
        pId: pId
    }

    $.ajax({

        type: "post",
        url: '/save-project',
        data: reqData,

        beforeSend: function() {
            var count = parseInt($("#saveCount").text());
            $("#saveCount").html(count + 1);

            $("#unsave" + pId).removeClass("d-none");
            $("#save" + pId).addClass("d-none");
        },

        //success
        success: function(data) {
            if (data.success) {

                $("#snackbar").html('<i class="fas fa-heart-circle mr-2" style="color:white"></i>Project saved');
                $("#snackbar").addClass("show");
                setTimeout(function() {
                    $("#snackbar").removeClass("show");
                }, 3000);
            } else {

                var count = parseInt($("#saveCount").text());
                $("#saveCount").html(count - 1);

                $("#unsave" + pId).addClass("d-none");
                $("#save" + pId).removeClass("d-none");
            }

        },
        //error
        error: function(error) {

            var count = parseInt($("#saveCount").text());
            $("#saveCount").html(count - 1);

            $("#unsave" + pId).addClass("d-none");
            $("#save" + pId).removeClass("d-none");

            $("#snackbar").html('<i class="far fa-exclamation-circle mr-2" style="color:white"></i>Server Timeout. Login again');
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        }
    });
}


function unsaveProject(pId) {
    var reqData = {
        pId: pId
    }
    $.ajax({

        type: "post",
        url: '/unsave-project',
        data: reqData,

        beforeSend: function() {
            var count = parseInt($("#saveCount").text());
            $("#saveCount").html(count - 1);

            $("#save" + pId).removeClass("d-none");
            $("#unsave" + pId).addClass("d-none");
        },

        //success
        success: function(data) {
            if (data.success) {} else {
                var count = parseInt($("#saveCount").text());
                $("#saveCount").html(count + 1);

                $("#save" + pId).addClass("d-none");
                $("#unsave" + pId).removeClass("d-none");
            }

        },
        //error
        error: function(error) {

            var count = parseInt($("#saveCount").text());
            $("#saveCount").html(count + 1);

            $("#save" + pId).addClass("d-none");
            $("#unsave" + pId).removeClass("d-none");

            $("#snackbar").html('<i class="far fa-exclamation-circle mr-2" style="color:white"></i>Server Timeout. Login again');
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        }
    });
}