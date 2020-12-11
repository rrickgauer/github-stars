const API = 'https://api.github.com/users/rrickgauer/starred?per_page=100';  
const token = '5fa26390bb8bbe4cfb3076cbb5c3f7112f125974';

const searchInput = $('#search-input');
const filterSelect = $('.filter-select');
const sortSelect = $('.sort-select');

// let lastPage = null;
let links = [];

let starsData = [];
let languagesUniqueList = [];


// main
$(document).ready(function() {
    getData(API, console.log, console.log, getLinks);

    filterRepos();
    sortRepos();
    searchRepos();

});

function getData(url, actionResponse, actionSuccess, actionXhr) {
    $.ajax({
        url: url,
        headers: {
            // 'Authorization':'Basic xxxxxxxxxxxxx',
            'Authorization': 'token ' + token,
        },
        method: 'GET',
        dataType: 'json',
        success: function(response, success, xhr) {

            if (actionResponse != undefined) {
                actionResponse(response); 
            } else {
                console.log(response);
            }

            if (actionSuccess != undefined) {
                actionResponse(success); 
            }

            if (actionXhr != undefined) {
                actionXhr(xhr); 
            }
        },
      });
}


function getLinks(xhr) {
    let linkResponse = xhr.getResponseHeader("link");
    let lastPage = getLastPage(linkResponse);

    for (let count = 1; count <= lastPage; count++) {
        links.push(API + '&page=' + count.toString());
    }


    for (let count = 0; count < links.length; count++) {
        getData(links[count], function(stars) {

            for (let i = 0; i < stars.length; i++) {
                let newCard = new Card(stars[i]);
                starsData.push(newCard);
            }
        });
    }

    $(document).ajaxStop(function() {

        for (let count = 0; count < starsData.length; count++) {
            starsData[count].listIndex = count;
        }

        console.log(starsData);

        displayRepos();
    });
}

function getLastPage(link) {
    let ar    = link.split(",");          // Split on commas
    ar[1]     = ar[1].trim();
    let entry = ar[1].split(";");
    entry     = entry[0].split("?");
    entry     = entry[1];
    entry     = entry.replace(">", "");
    entry     = entry.split("=");
    entry     = entry[2];

    return parseInt(entry);
}



function displayRepos() {
    let html = '';

    for (let count = 0; count < starsData.length; count++) {
        let repo = starsData[count];
        html += repo.getHtml();
    }


    $('#repos').html(html);
    $('.my-spinner').remove();
    buildLanguagesList();
    enableAllInputs();
}


function buildLanguagesList() {
    for (let count = 0; count < starsData.length; count++) {
        if (!languagesUniqueList.includes(starsData[count].language)) {
            languagesUniqueList.push(starsData[count].language);
        }
    }


    languagesUniqueList.sort();

    let html = '';
    for (let count = 0; count < languagesUniqueList.length; count++) {
        html += `<option value="${languagesUniqueList[count]}">${languagesUniqueList[count]}</option>`;
    }

    $('.filter-select').append(html);
}


function enableAllInputs() {
    $('.form-control').prop('disabled', false);
}


function searchRepos() {
    $(searchInput).on('keyup', function() {
        const value = $(this).val();

        if (value == '') {
            $('.repo').removeClass('d-none');
            return;
        }

        $('.repo').addClass('d-none');
        $(`.repo:contains(${value})`).removeClass('d-none');

    });
}


function sortRepos() {
    $(sortSelect).on('change', function() {
        const value = $(this).find('option:selected').val();

        if (value == 'owner') {
            sortReposOwner();
        } else if (value == 'repo') {
            sortReposRepo();
        } else {
            sortReposDate();
        }
    });

}


function sortReposOwner() {
    let repos = starsData;

    repos.sort(function(a, b) {
        return (a.owner_name.toUpperCase() < b.owner_name.toUpperCase()) ? -1 : 1;
    });

    let html = '';
    for (let count = 0; count < repos.length; count++) {
        html += repos[count].getHtml();
    }

    $('#repos').html(html);
}

function sortReposRepo() {
    let repos = starsData;

    repos.sort(function(a, b) {
        return (a.name.toUpperCase() < b.name.toUpperCase()) ? -1 : 1;
    });

    let html = '';
    for (let count = 0; count < repos.length; count++) {
        html += repos[count].getHtml();
    }

    $('#repos').html(html);
}

function sortReposDate() {
    let repos = starsData;

    repos.sort(function(a, b) {
        return (a.listIndex < b.listIndex) ? -1 : 1;
    });

    let html = '';
    for (let count = 0; count < repos.length; count++) {
        html += repos[count].getHtml();
    }

    $('#repos').html(html);
}


function filterRepos() {
    $(filterSelect).on('change', function() {
        const optionValue = $(this).find('option:selected').val();
        
        // show all if the all value is selected
        if (optionValue == '__all') {
            $('.repo').show();
            return;
        }

        $('.repo').hide();
        $(`.repo[data-language="${optionValue}"]`).show();
    });
}







