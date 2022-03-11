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



// LOGIN

let phone;


function showPhone(e) {
    e.preventDefault()
    $('#login-div').hide()
    $('#otp-div').show()
    startCount()
}

$('#otp-form').submit(function(e) {

    e.preventDefault();
    var form = $(this);


    $.ajax({
        type: "post",
        url: '/login-phone',
        data: form.serialize(),

        beforeSend: function() {
            $('#sendOtpbtn').html('Sending OTP...')
        },

        //success
        success: function(data) {
            if (data.status) {
                phone = data.phone
                $('#otp-form').hide()
                $('#varify-form').show()
                $('#phoneText').html(phone)
            } else {

                $('#sendOtpbtn').html('Send OTP')
                $('#otp-form').show()
                $('#varify-form').hide()
                $('#varify-error').show()
                $('#varify-error').html(data.error)

                setTimeout(function() {
                    $("#varify-error").hide()
                }, 3000);
            }
        },
        //error
        error: function(error) {


        }
    });


})



$('#varify-form').submit(function(e) {

    e.preventDefault();
    var form = $(this);


    $.ajax({
        type: "post",
        url: '/varify-otp-login',
        data: form.serialize(),

        beforeSend: function() {
            $('#verifyBtn').html('verifying.....')
        },

        //success
        success: function(data) {
            if (data.status) {
                $('#verifyBtn').html('Success! Redirecting.....')
                window.location.href = data.url
            } else {

                $('#varify-error').show()
                $('#varify-error').html(data.error)

                setTimeout(function() {
                    $("#varify-error").hide()
                }, 3000);

            }
        },
        //error
        error: function(error) {


        }
    });


})


function resendOtp() {

    $.ajax({
        type: "post",
        url: '/login-phone',
        data: { phone: phone },

        beforeSend: function() {
            $('#resendBtn').html('Resending.....')
        },

        //success
        success: function(data) {
            if (data.status) {
                startCount()
                $('#otp-txt').show()
                $('#resendBtn').hide()
                $('#verifyBtn').show()
            } else {


            }
        },
        //error
        error: function(error) {


        }
    });
}


function showForgot(e) {
    e.preventDefault()

    $("#snackbar").html('<i class="far fa-exclamation-circle mr-2" style="color:white"></i> Login with your phone and change from settings');
    $("#snackbar").addClass("show");
    setTimeout(function() {
        $("#snackbar").removeClass("show");
    }, 3000);
}

let timeLeft;
let elem;
let timerId;

function startCount() {
    try {
        timeLeft = 30;
        elem = document.getElementById('verifyBtn');
        timerId = setInterval(countdown, 1000);
    } catch (err) {
        alert(err)
    }

}



function countdown() {
    if (timeLeft == -1) {
        clearTimeout(timerId);
        doSomething();
    } else {
        elem.innerHTML = "Verify (" + timeLeft + ")"
        timeLeft--;
    }
}

function doSomething() {
    document.getElementById('resendBtn').style.display = "block"
    document.getElementById('verifyBtn').style.display = "none"
    document.getElementById('otp-txt').style.display = "none"

}