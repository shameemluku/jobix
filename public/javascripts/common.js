$(document).ready(function() {
    var len = 0;
    var maxchar = 200;


    //////// PROJECT DETAILS PAGE /////////////


    // ------- Remaining characters ----------

    $('#coverTxt').keyup(function() {
        len = this.value.length
        if (len > maxchar) {
            return false;
        } else if (len > 0) {
            $("#remainingC").html((maxchar - len) + " characters left");
        } else if (len == 0) {
            $("#remainingC").html("");
        } else {
            $("#remainingC").html((maxchar) + " characters left");
        }
    })

    // -------- Submit button --------

    $("#submitBtn").click(function() {
        $("#sendCard").show()
        $("#detailsCard").hide()
    });



    // -------- Cancel button --------

    $("#cancelBtn").click(function() {
        $("#detailsCard").show()
        $("#sendCard").hide()
    });


    // Calculating commission

    var amount = $('#amountTxt').text();
    var commission = amount * 0.1;
    $('#comiTxt').text(commission);
    $('#estimateTxt').text(amount - commission);




    $('#table_id').dataTable({
        "language": {
            "search": "<i class='far fa-search'></i>"
        },
        "autoWidth": false
    });

    $('#complete_table_id').dataTable({
        "language": {
            "search": "<i class='far fa-search'></i>"
        },
        "autoWidth": false
    });




    dataTableStyle("#table_id_wrapper div:first-child")
    dataTableStyle("#complete_table_id_wrapper div:first-child")


});


// Data table style

function dataTableStyle(query) {



    styleQuery = document.querySelector(query)

    styleQuery.style.color = "rgb(128, 128, 128)"
    styleQuery.style.backgroundColor = "white"
    styleQuery.style.width = "100%";
    styleQuery.style.margin = "0";
    styleQuery.style.padding = "0.5rem 10px 0px 10px";
    styleQuery.style.marginBottom = "-12px";

    document.querySelector("#id_heading").style.maxidth = "100px"

}






//Send Propsal button click

function sendProposal(pId, id, name, hId) {
    coverMsg = $('#coverTxt').val()
    amount = $('#bidAmount').val()

    userdata = {
        pId: pId,
        id: id,
        name: name,
        message: coverMsg,
        amount: amount,
        host: hId
    }


    $.ajax({
        type: "post",
        url: '/send-proposal',
        data: userdata,

        //success
        success: function(data) {
            //   $("#card-Holder").html(data);

            //   $( "#snackbar" ).html( '<i class="far fa-check-circle mr-2" style="color:white"></i>Filter applied' );
            //   $( "#snackbar" ).addClass( "show" );
            //   setTimeout(function()
            //   {   
            //     $( "#snackbar" ).removeClass( "show" );
            //   }, 3000);


            var count = $("#details-bidCount").html()
            $("#details-bidCount").html(parseInt(count) + 1)

            Swal.fire({
                title: 'Great !',
                text: 'Proposal sent successfully. Now, wait for the host to accept!',
                icon: 'success',
                confirmButtonText: 'Done'
            })

        },
        //error
        error: function(error) {

            console.log(error);

            $("#snackbar").html('<i class="far fa-exclamation-circle mr-2" style="color:white"></i>' + error.responseText);
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        }
    });
}


// Register host skills



$("#regSkills").submit(function(e) {

    e.preventDefault();
    var form = $(this);

    $.ajax({
        type: "post",
        url: '/register-hostSkills',
        data: form.serialize(),

        //success
        success: function(data) {

            if (data.success) {
                Swal.fire({
                    title: 'Great !',
                    text: 'Proposal sent successfully. Now, wait for the host to accept!',
                    icon: 'success',
                    confirmButtonText: 'Done',
                    confirmButtonColor: '#26bf2e',
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location = "/work-dashboard"
                    }
                })

            } else {

                $("#snackbar").html('<i class="far fa-exclamation-circle mr-2" style="color:white"></i>Server Timeout. Login again');
                $("#snackbar").addClass("show");
                setTimeout(function() {
                    $("#snackbar").removeClass("show");
                }, 3000);

            }

        },
        //error
        error: function(error) {

            $("#snackbar").html('<i class="far fa-exclamation-circle mr-2" style="color:white"></i>Server Timeout. Login again');
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        }
    });


})

function sayHi(id) {

    $.ajax({
        type: "post",
        url: '/removeNoti',
        data: { id: id },

        //success
        success: function(data) {

            if (data.success) {
                $("#notiCount").html("");
            }

        },
        //error
        error: function(error) {

        }
    });
}

/////////////////////// BIDS PAGE ////////////////////////////


var USER;

function showProfile(user) {

    USER = user;
    console.log(user);
    $("#userDiv").hide();
    $("#user-details").css("display", "block");
    $("#bid-details").css("display", "none");


    $("#username").html(user.username);
    $("#bid-userId").html(user.userId);
    $("#bid-message").html('<i>' + user.message + '</i>');

    $("#bid-amount").html('₹ ' + user.amount);

    $.ajax({
        type: "post",
        url: '/bid-userdata',
        data: user,

        beforeSend: function() {
            $("#loadingDiv").show();
        },

        //success
        success: function(data) {

            $("#loadingDiv").hide();
            $("#userDiv").show();

            $('#skillsDiv').html("")

            $('#bid-emailTxt').html(data.email)

            $('#bid-countryTxt').html('<b>' + data.country + '</b>')


            data.skillsArray.forEach(element => {
                $('#skillsDiv').append('<span id="skills">' + element.name + '</span>&nbsp;');
            });

        },
        //error
        error: function(error) {

        }
    });

}



function hireUser(proDetails) {

    // console.log(proDetails);

    var data = {
        _id: proDetails._id,
        pheading: proDetails.pheading,
        pdetails: proDetails.pdetails,
        dueDate: proDetails.dueDate,
        orgiAmount: proDetails.amount,
        worker: USER.username,
        workerId: USER.userId,
        bidAmount: USER.amount
    }

    data.bidding = [];
    proDetails.bidding.forEach(element => {
        data.bidding.push(element.userId)
    })


    $.ajax({
        type: "post",
        url: '/hire',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(data),

        beforeSend: function() {

        },

        //success
        success: function(data) {

        },
        //error
        error: function(error) {

        }
    });
}

// Bid page user pop up from bidded users
function hideProfile() {

    USER = null;
    $("#user-details").css("display", "none");
    $("#bid-details").css("display", "block");


}



// LOAD BID LIST FROM WORK HOME PAGE

function loadBids(e) {
    e.preventDefault()

    $('#biddingBtn').addClass('active-cat');
    $('#workingBtn').removeClass('active-cat');

    $('#dash-heading').html("&gt; Bidded Projects")

    $('#active-works').hide()
    $('#bidded-projects').show()


    $.ajax({
        type: "post",
        url: '/home-bidded',
        data: null,

        beforeSend: function() {
            $('#loadingDiv').show()
        },

        //success
        success: function(data) {

            $('#loadingDiv').hide()
            if (data.status) {

                $('#bid-t-body').html("")
                data.list.forEach(elem => {
                    html = '<tr id="tr-' + elem._id + '" class="table-row"> \
              <td> \
                <div class="w-100"> \
                  <div class="container"> \
                      <div class="row"> \
                          <div class="col-10"> \
                             <p class="mb-0 t-card-head">' + elem.pheading + '</p> \
                             <p class="mb-0" style="color:#787878; font-size:12px">Project id : ' + elem._id + '</p> \
                             <p class="mb-0"><i class="far fa-user-circle"></i> ' + elem.hostname + '</p> \
                          </div>\
                          <div class="col-2 d-flex justify-content-center">\
                              <span style="color: rgba(143, 89, 18, 0.788); font-weight:600; font-size:19px">₹ ' + elem.amount + '</span>\
                          </div>\
                      </div>\
                      <div class="row">\
                        <div class="col mt-3">\
                          <span class="t-bidCount"><i class="fal fa-user"></i>&nbsp; <b>' + elem.bidCount + '</b> &nbsp;bids</span>\
                        </div>\
                        <div class="col mt-3 d-flex justify-content-end">\
                          <span class="" style="color:red">' + elem.status + '</span>\
                        </div>\
                      </div>\
                      <div class="row">\
                        <div class="col mt-3">\
                          <a href="#" class="removeBtn w-sm-100" style="float: right;" onclick="removeBid(&apos;' + elem._id + '&apos;,event)">Remove</a>\
                          <a href="/bid-details?id={{this._id}}" class="t-viewBtn w-sm-100 mr-1" style="float: right;">view details</a> \
                        </div>\
                        \
                      </div>\
                  </div>\
                </div>\
              </td>\
            </tr>'

                    html = $('#bid-t-body').html() + html

                    $('#bid-t-body').html(html)


                })

            }





        },
        //error
        error: function(error) {

            console.log(error);

            $("#snackbar").html('<i class="far fa-exclamation-circle mr-2" style="color:white"></i>' + error.responseText);
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);
        }
    });
}

function hideBid(e) {

    e.preventDefault()
    $('#biddingBtn').removeClass('active-cat');
    $('#workingBtn').addClass('active-cat');

    $('#dash-heading').html("&gt; Working Projects")

    $('#active-works').show()
    $('#bidded-projects').hide()
}



function removeBid(id, e) {

    e.preventDefault()

    Swal.fire({
        title: 'Are you sure?',
        text: "You are about to remove this bidding",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove!'
    }).then((result) => {

        if (result.isConfirmed) {

            $.ajax({

                type: "post",
                url: '/remove-bid',
                data: { id: id },


                //success
                success: function(data) {
                    if (data.status) {

                        $('#tr-' + id + '').hide()
                        Swal.fire(
                            'Success!',
                            'You withdrawed from bidding',
                            'success'
                        )

                    } else {
                        $("#snackbar").html('<i class="far fa-exclamation-circle mr-2" style="color:white"></i>Oops, Something wrong!');
                        $("#snackbar").addClass("show");
                        setTimeout(function() {
                            $("#snackbar").removeClass("show");
                        }, 3000);
                    }
                },
                //error
                error: function(error) {

                }
            });



        }
    })






}