jQuery(document).ready(function($) {

    var perfEntries = performance.getEntriesByType("navigation");

    if (perfEntries[0].type === "back_forward") {
        location.reload(true);
    }

    getGreeting();

});



const selected = document.querySelector(".selected");
const optionsContainer = document.querySelector(".options-container");
const searchBox = document.querySelector(".search-box input");

const optionsList = document.querySelectorAll(".option");



optionsList.forEach(o => {
    o.addEventListener("click", () => {});
});

searchBox.addEventListener("keyup", function(e) {
    filterList(e.target.value);
});

const filterList = searchTerm => {
    searchTerm = searchTerm.toLowerCase();
    optionsList.forEach(option => {
        let label = option.firstElementChild.nextElementSibling.innerText.toLowerCase();
        if (label.indexOf(searchTerm) != -1) {
            option.style.display = "block";
        } else {
            option.style.display = "none";
        }
    });
};




// FILTER FORM

$("#filterForm").submit(function(e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);

    $.ajax({
        type: "get",
        url: '/filter-projects?filter=true',
        data: form.serialize(),

        beforeSend: function() {
            $("#card-Holder").html("");
            $('#round-loader').show()
        },

        //success
        success: function(data) {

            $("#card-Holder").html(data);
            $('#round-loader').hide()

            $("#snackbar").html('<i class="far fa-check-circle mr-2" style="color:white"></i>Filter applied');
            $("#snackbar").addClass("show");
            setTimeout(function() {
                $("#snackbar").removeClass("show");
            }, 3000);

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

});

/////////////// greeting

function getGreeting() {
    var day = new Date();
    var hr = day.getHours();
    if (hr >= 0 && hr < 12) {
        $('#wishTxt').text('Good Morning!')
    } else if (hr == 12) {
        $('#wishTxt').text('Good Noon!')
    } else if (hr >= 12 && hr <= 17) {
        $('#wishTxt').text('Good Afternoon!')
    } else {
        $('#wishTxt').text('Good Evening!')
    }
}



//////////////////////////////////////