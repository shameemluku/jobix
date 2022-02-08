function changeBtnColor() {
    var checkBox = document.getElementById("togBtn");
    var button = document.getElementById("submitBtn");
    if (checkBox.checked == true){
        button.style.backgroundColor = "#2ab934";
    } else {
         button.style.backgroundColor = "#D62828";
    }
}

function checkOtp(otp){
    let userOtp = document.forms["otpForm"]["otp"].value;

    if(otp===userOtp){
        var alertDiv = document.getElementById("error-otp");
        alertDiv.style.display="none";
        return true;
        
    }
    else{
        var alertDiv = document.getElementById("error-otp");
        alertDiv.style.display="block";
        return false;
    }
}