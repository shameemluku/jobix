let paydata = {};

function approvePayout(id, amount, paymail, userId) {

    paydata.id = id
    paydata.amount = amount
    paydata.paymail = paymail
    paydata.userId = userId
    paydata.finalAmount = parseFloat(paydata.amount / 75).toFixed(2)

    $('#admin-payout-modal').modal('show');


}


paypal.Buttons({

    // Sets up the transaction when a payment button is clicked
    createOrder: function(data, actions) {
        return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: paydata.finalAmount
                },
                payee: {
                    email_address: paydata.paymail
                }
            }]
        });
    },

    // Finalize the transaction after payer approval
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(orderData) {

            console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
            //var transaction = orderData.purchase_units[0].payments.captures[0];
            //alert('Transaction '+ transaction.status + ': ' + transaction.id + '\n\nSee console for all available details');

            paydata.paydetails = data

            $.ajax({
                type: "POST",
                url: "/admin/payouts",
                data: paydata,
                beforeSend: function() {

                },
                success: function(data) {

                    window.location.href = '/admin/payouts'

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
    }
}).render('#paypal-button-container');