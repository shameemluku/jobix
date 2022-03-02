$(document).ready(function() {


    $('#user_Table').dataTable({
        "language": {
            "search": "<i class='far fa-search'></i>"
        },
        "autoWidth": false
    });

    dataTableStyle("#user_Table_wrapper div:first-child")

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