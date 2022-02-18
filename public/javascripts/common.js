

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

    
 
    $('#table_id').DataTable();

    $('#example').dataTable( {
        "language": {
          "search": "Filter records:"
        }
      } );
    

});



//Send Propsal button click

function sendProposal(pId,id,name,hId){
    coverMsg = $('#coverTxt').val()
    userdata={
        pId:pId,
        id:id,
        name:name,
        message:coverMsg,
        host:hId
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

              
            var count = $( "#details-bidCount" ).html()
            $( "#details-bidCount" ).html(parseInt(count)+1)

            Swal.fire({
                title: 'Great !',
                text: 'Proposal sent successfully. Now, wait for the host to accept!',
                icon: 'success',
                confirmButtonText: 'Done'
              })
        
        },
        //error
        error: function (error) {

          console.log(error);
  
          $( "#snackbar" ).html( '<i class="far fa-exclamation-circle mr-2" style="color:white"></i>'+error.responseText );
          $( "#snackbar" ).addClass( "show" );
          setTimeout(function()
          {   
            $( "#snackbar" ).removeClass( "show" );
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
        success: function(data)
        {

          if(data.success){
            Swal.fire({
                title: 'Great !',
                text: 'Proposal sent successfully. Now, wait for the host to accept!',
                icon: 'success',
                confirmButtonText: 'Done',
                confirmButtonColor: '#26bf2e',
              }).then((result) => {
                if (result.isConfirmed) {
                    window.location="/work-dashboard"
                }
              })

            }else{ 

              $( "#snackbar" ).html( '<i class="far fa-exclamation-circle mr-2" style="color:white"></i>Server Timeout. Login again' );
              $( "#snackbar" ).addClass( "show" );
              setTimeout(function(){   
                  $( "#snackbar" ).removeClass( "show" );
              }, 3000);

            }
        
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


})

function sayHi(id){

  $.ajax({
    type: "post",
    url: '/removeNoti',
    data: {id:id},

    //success
    success: function(data)
    {

      if(data.success){
        $( "#notiCount" ).html("");
      }
    
    },
    //error
    error: function (error) {

    }
  });
}

