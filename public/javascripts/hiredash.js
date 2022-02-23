$(document).ready(function() {


    // $('#table_id_bidding').dataTable({
    //     "language": {
    //         "search": "<i class='far fa-search'></i>"
    //     },
    //     "autoWidth": false
    // });

    // 
})

var first = true; // To controll data initilization


function hideHired(e) {
    e.preventDefault()

    $('#hire_table').hide()
    $('#projectlist_table').show()

    $('#biddingBtn').addClass('active-cat');
    $('#workingBtn').removeClass('active-cat');

    $('#dash-heading').html("&gt; Project Lists")


    $.ajax({
        type: "post",
        url: '/host-projectlist',
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

                    html = '<tr class="table-row">\
                    <td class="td-id" style="width:100px !important; white-space: initial;">\
                       ' + elem._id + '\
                    </td>\
                    <td>\
                       <div class="w-100">\
                          <div class="container">\
                             <div class="row">\
                                <div class="col-10">\
                                   <p class="mb-0 t-card-head">' + elem.pheading + '</p>\
                                </div>\
                                <div class="col-2">\
                                   <span style="color: rgba(143, 89, 18, 0.788); font-weight:600; font-size:19px">₹ ' + elem.amount + '</span>\
                                </div>\
                             </div>\
                             <div class="row">\
                                <div class="col mt-3">\
                                   <span class="t-bidCount"><i class="fal fa-user"></i>&nbsp; <b>' + elem.bidCount + '</b> &nbsp;bids</span>\
                                   <span class="t-saveCount ml-1"><i class="fal fa-heart"></i>&nbsp; <b>&nbsp;' + elem.saveCount + '</b></span>\
                                </div>\
                             </div>\
                             <div class="row">\
                                <div class="col mt-3">\
                                   <a href="/bid-details?id=' + elem._id + '" class="t-viewBtn w-sm-100" style="float: right;">view details</a>\
                                </div>\
                             </div>\
                          </div>\
                       </div>\
                    </td>\
                 </tr>'

                    html = $('#bid-t-body').html() + html

                    $('#bid-t-body').html(html)

                })

                if (first) {



                    $('#table_id_bidding').dataTable({
                        "language": {
                            "search": "<i class='far fa-search'></i>"
                        },
                        "autoWidth": false
                    });

                    dataTableStyle("#table_id_bidding_wrapper div:first-child")
                    first = false;
                }


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


function loadProList(e) {

    e.preventDefault()

    $('#biddingBtn').removeClass('active-cat');
    $('#workingBtn').addClass('active-cat');


    $('#dash-heading').html("&gt; Hired Projects")

    $('#hire_table').show()
    $('#projectlist_table').hide()
}