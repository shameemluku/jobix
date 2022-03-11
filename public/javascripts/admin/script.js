let table;
$(document).ready(function() {

    if (window.location.pathname == '/admin') {
        loadHomeNumbers()


        $('#user_Table').dataTable({
            "language": {
                "search": "<i class='far fa-search'></i>"
            },
            "autoWidth": false
        });

        dataTableStyle("#user_Table_wrapper div:first-child")
    }


    if (window.location.pathname == '/admin/transactions') {

        $('#test').DataTable({
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ]
        });

    }






});


function dataTableStyle(query) {



    styleQuery = document.querySelector(query)

    styleQuery.style.color = "rgb(128, 128, 128)"
    styleQuery.style.backgroundColor = "white"
    styleQuery.style.width = "100%";
    styleQuery.style.margin = "0";
    styleQuery.style.padding = "0.5rem 10px 0px 10px";

    document.querySelector("div.dataTables_wrapper div.dataTables_info").style.padding = "0"
    document.querySelector("div.dataTables_wrapper div.dataTables_info").style.margin = "10px"
    document.querySelector("div.dataTables_wrapper div.dataTables_info").style.color = "#b1b1b1"
    document.querySelector("div.dataTables_wrapper div.dataTables_paginate ul.pagination").style.margin = "0 10px 0 0"
    document.querySelector("div.dataTables_wrapper div.dataTables_length select").style.width = "50px"

}


$('.block-togBtn').on('change', function() {

    let status;
    if (!this.checked) {
        status = "BLOCKED"
    } else {
        status = "ACTIVE"
    }

    $.ajax({
        type: "POST",
        url: "/admin/block-user",
        data: { status: status, id: this.value },
        beforeSend: function() {

        },
        success: function(data) {

            if (!data.status) {
                $("#snackbar").html('<i class="far fa-exclamation-circle mr-2" style="color:white"></i>Server Timeout. Login again');
                $("#snackbar").addClass("show");
                setTimeout(function() {
                    $("#snackbar").removeClass("show");
                }, 3000);
            }
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



function loadHomeNumbers() {
    $.ajax({
        type: "POST",
        url: "/admin/home-numbers",
        beforeSend: function() {

        },
        success: function(data) {

            $('#hostCount').html(data.hireCount);
            $('#workerCount').html(data.workerCount);
            $('#projectCount').html(data.projectCount);
            $('#earningsCount').html("₹ " + data.earnings);
            console.log(data)

        },

        error: function(error) {


        }
    });
}





$(function() {
    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
    }, function(start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));




    });
});



$("#trans-filter-form").submit(function(e) {

    e.preventDefault();
    var form = $(this);

    $.ajax({
        type: "post",
        url: '/admin/filter-transaction',
        data: form.serialize(),


        success: function(response) {

            if (response.status) {
                let Tdata = response.data;


                $('#test').DataTable().destroy();

                $('#transaction-table').html("")

                Tdata.forEach(data => {

                    if (data.method == "PAYPAL") {
                        data.method = `<img src="/images/site/paypal.svg" height="20px"> <b>PAYPAL</b>`
                    } else if (data.method == "RAZOR") {
                        data.method = `<img src="/images/site/rayzor.png" height="30px"><b><i>RAZORPAY</i></b>`
                    }
                    if (data.type == 'PROJECT') {
                        data.type = `<span style="background-color: rgb(129, 185, 106); padding:5px; color:white; border-radius:5px"> Payment for Project </span>`
                    } else if (data.type == 'PAYOUT') {
                        data.type = `<span style="background-color: rgb(230, 116, 96); padding:5px; color:white; border-radius:5px"> Payout request </span>`
                    }


                    $('#test').find('tbody').append(`<tr>
                    <td style="display:none"></td>
                    <td style="color: slategrey; font-size:10px">${data.payId}</td>
                    <td class="">${data.date}</td>
                    <td class="">${data.method}</td>
                    <td class="">${data.type}</td>
                    <td class=""><b>₹ ${data.amount}</b></td>
                    <td class="">${data.sender}</td>
                  </tr>`)

                })










                $('#test').DataTable({
                    dom: 'Bfrtip',
                    buttons: [
                        'copy', 'csv', 'excel', 'pdf', 'print'
                    ]
                });


            }

        },
        error: function(error) {


        }
    });


})