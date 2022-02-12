

$(document).ready(function() {
    var len = 0;
    var maxchar = 200;
    
    

    //////// PROJECT DETAILS PAGE /////////////
    
    
    // ------- Remaining characters ----------
    
    $( '#coverTxt' ).keyup(function(){
      len = this.value.length
      if(len > maxchar){
          return false;
      }
      else if (len > 0) {
          $( "#remainingC" ).html( ( maxchar - len )+" characters left" );
      }
      else if (len == 0) {
        $( "#remainingC" ).html("");
      }
      else {
          $( "#remainingC" ).html( ( maxchar ) +" characters left" );
      }
    })

    // -------- Submit button --------

    $( "#submitBtn" ).click(function() {
        $("#sendCard").show()
        $("#detailsCard").hide()
    });



    // -------- Cancel button --------

    $( "#cancelBtn" ).click(function() {
        $("#detailsCard").show()
        $("#sendCard").hide()
    });


    // Calculating commission

    var amount = $('#amountTxt').text();
    var commission = amount * 0.1;
    $('#comiTxt').text(commission);
    $('#estimateTxt').text(amount-commission);
    

});



//Send Propsal button click

function sendProposal(pId,id,name){
    coverMsg = $('#coverTxt').val()
    userdata={
        pId:pId,
        id:id,
        name:name,
        message:coverMsg
    }


    $.ajax({
        type: "post",
        url: '/send-proposal',
        data: userdata,
  
        //success
        success: function(data)
        {
        //   $("#card-Holder").html(data);
          
        //   $( "#snackbar" ).html( '<i class="far fa-check-circle mr-2" style="color:white"></i>Filter applied' );
        //   $( "#snackbar" ).addClass( "show" );
        //   setTimeout(function()
        //   {   
        //     $( "#snackbar" ).removeClass( "show" );
        //   }, 3000);

          
            Swal.fire({
                title: 'Great !',
                text: 'Proposal sent successfully. Now, wait for the host to accept!',
                icon: 'success',
                confirmButtonText: 'Done'
              })
        
        },
        //error
        error: function (error) {
  
          $( "#snackbar" ).html( '<i class="far fa-exclamation-circle mr-2" style="color:white"></i>Server Timeout. Login again' );
          $( "#snackbar" ).addClass( "show" );
          setTimeout(function()
          {   
            $( "#snackbar" ).removeClass( "show" );
          }, 3000);
        }
    });
}

