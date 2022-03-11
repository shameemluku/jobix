var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {

    var x = document.getElementsByClassName("pay-tab");
    x[n].style.display = "block";

    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
    }
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Submit";
    } else {
        document.getElementById("nextBtn").innerHTML = "Next " + (n + 1) + " of " + x.length;
    }
    fixStepIndicator(n)
}

function nextPrev(n) {

    var x = document.getElementsByClassName("pay-tab");
    if (n == 1 && !validateForm()) return false;
    x[currentTab].style.display = "none";
    currentTab = currentTab + n;
    if (currentTab >= x.length) {
        $("#checkout-form").submit();

        return false;
    }
    showTab(currentTab);
}



function validateForm() {
    // This function deals with validation of the form fields
    //   var x, y, i, valid = true;
    //   x = document.getElementsByClassName("tab");
    //   y = x[currentTab].getElementsByClassName("variElem");
    //   // A loop that checks every input field in the current tab:
    //   for (i = 0; i < y.length; i++) {
    //     // If a field is empty...
    //     if (y[i].value == "") {
    //       // add an "invalid" class to the field:
    //       y[i].className += " invalid";
    //       // and set the current valid status to false
    //       valid = false;
    //     }
    //   }
    //   // If the valid status is true, mark the step as finished and valid:
    //   if (valid) {
    //     document.getElementsByClassName("step")[currentTab].className += " finish";
    //   }
    //   return valid; // return the valid status

    return true
}


function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    var i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    //... and adds the "active" class on the current step:
    x[n].className += " active";
}




$("#checkout-form").submit(function(e) {


    e.preventDefault();
    var form = $(this);

    $.ajax({

        type: "post",
        url: '/checkout',
        data: form.serialize(),

        beforeSend: function() {
            $('#processing-div').show()
            $('#payment-div').hide()
        },

        success: function(data) {

            if (data.type === "RAZOR") {
                console.log(data.order);

                rayzoPay(data)
            } else {
                console.log(data);
                window.location.href = data.url
            }



        },

        error: function(error) {

            // $("#snackbar").html('<i class="far fa-exclamation-circle mr-2" style="color:white"></i>Server Timeout. Login again');
            // $("#snackbar").addClass("show");
            // setTimeout(function() {
            //     $("#snackbar").removeClass("show");
            // }, 3000);
        }
    });


})




function rayzoPay(data) {

    var options = {
        "key": data.key,
        "amount": data.order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "JobX",
        "description": "Freelance services",
        "image": "https://example.com/your_logo",
        "order_id": data.order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function(response) {

            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)

            varifyPayment(response, data.order, data)
        },
        modal: {
            escape: false,
            ondismiss: function() {
                $('#failed-div').show()
                $('#processing-div').hide()
            }
        },
        "prefill": {
            "name": data.name,
            "email": data.email,
            "contact": data.phone
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function(response) {
        // alert(response.error.code);
        // alert(response.error.description);
        // alert(response.error.source);
        // alert(response.error.step);
        // alert(response.error.reason);
        // alert(response.error.metadata.order_id);
        // alert(response.error.metadata.payment_id);
        $('#failed-div').show()
        $('#processing-div').hide()
    });
    rzp1.open();
}


function varifyPayment(payment, order, details) {
    $.ajax({
        url: "/varify-payment",
        data: {
            type: "RAZOR",
            payment,
            order,
            workerId: details.workerId,
            project: details.project
        },
        method: 'post',
        success: function(data) {
            if (data.success) {
                $('#success-div').show()
                $('#processing-div').hide()
            }
        }
    })
}




$(document).ready(function() {




})