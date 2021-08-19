const API = 'https://api.github.com/users/rrickgauer/starred?per_page=100';  

const e_searchInput = $('#search-input');
const e_filterSelect = $('.filter-select');
const e_sortSelect = $('.sort-select');

let m_apiRequestUrls = [];
let m_listCards = [];
let m_languagesUniqueList = [];

/**
 * Main logic
 */
$(document).ready(function() {
    fetchInitialData(API, executeAllRequests);
    filterRepos();
    sortRepos();
    searchRepos();
    activateSearchBar();

});


/**
 * Event listners for the search bar.
 */
function activateSearchBar() {

    $(e_searchInput).on('focus', function() {
        $('.repo-search').addClass('active');
    });

    $(e_searchInput).on('focusout', function() {
        $('.repo-search').removeClass('active');
    });
}

/**
 * Run the initial api request.
 * The main purpose of this is to parse the 'Links' response header field to generate the page numbers for the urls.
 * 
 * @param {string} a_strUrl - api url
 * @param a_fnCallbackXhr - callback for successful request response
 */
function fetchInitialData(a_strUrl, a_fnCallbackXhr) {
    $.ajax({
        url: a_strUrl,
        headers: {
            'Authorization': 'token ' + GH_TOKEN,
        },
        method: 'GET',
        dataType: 'json',
        success: function(response, success, xhr) {
            a_fnCallbackXhr(xhr); 
        },
      });
}

function executeAllRequests(a_oApiXhrResponse)
{
    let linkResponse = a_oApiXhrResponse.getResponseHeader("link");
    generateAllApiUrls(linkResponse);
    getAllStars();
}

/**
 * Generate and save all the urls needed to retrieve all the api request data.
 * 
 * @param {string} a_strApiLinksHeaderRespone - raw string of the links header field from the api response.
 */
function generateAllApiUrls(a_strApiLinksHeaderRespone) {
    let lastPage = getLastPage(a_strApiLinksHeaderRespone);

    for (let count = 1; count <= lastPage; count++) {
        const newUrl = `${API}&page=${count}`;
        m_apiRequestUrls.push(newUrl);
    }
}

/**
 * Fetch all the star data from the API and display it.
 */
async function getAllStars() {
    
    // put each fetch promise into an array
    const responsePromises = [];
    for (let url of m_apiRequestUrls) {
        responsePromises.push(fetchStars(url));
    }

    // resolve all the promises
    let result = await Promise.all(responsePromises);

    // create card objects out of each api response object
    m_listCards = [];
    for (let ar of result) {
        for (const starResponse of ar) {
            const card = new Card(starResponse);
            m_listCards.push(card);
        }
    }

    // add an index to each card element
    for (let count = 0; count < m_listCards.length; count++) {
        m_listCards[count].listIndex = count;
    }

    // display the stars html
    displayRepos();
    getNumStars();
}


/**
 * Retrieve an api response from the given url
 */
async function fetchStars(a_strUrl) {

    let apiResponse = await fetch(a_strUrl, {
        method: 'GET',
        headers: {
            'Authorization': 'token ' + GH_TOKEN,   // 'Authorization':'Basic xxxxxxxxxxxxx',
        },
    });

    return apiResponse.json();
}

/**
 * Get the last page number required to fetch all my github stars from the api.
 * Github limits the response body to only 100 items per page, so I need to request multiple pages to get all the stars.
 * 
 * @param {string} a_strLinkResponseText - api link header response value
 * @returns {number} the last page number of the request url
 */
function getLastPage(a_strLinkResponseText) {
    let ar    = a_strLinkResponseText.split(",");          // Split on commas
    ar[1]     = ar[1].trim();
    let entry = ar[1].split(";");
    entry     = entry[0].split("?");
    entry     = entry[1];
    entry     = entry.replace(">", "");
    entry     = entry.split("=");
    entry     = entry[2];

    return parseInt(entry);
}

/**
 * Display all the card objects.
 */
function displayRepos() {
    let html = '';

    for (let count = 0; count < m_listCards.length; count++) {
        let repo = m_listCards[count];
        html += repo.getHtml();
    }


    $('#repos').html(html);
    $('.my-spinner').remove();
    buildLanguagesList();
    enableAllInputs();
}

/**
 * Generate the html for the language filter list
 */
function buildLanguagesList() {
    for (let count = 0; count < m_listCards.length; count++) {
        if (!m_languagesUniqueList.includes(m_listCards[count].language)) {
            m_languagesUniqueList.push(m_listCards[count].language);
        }
    }


    m_languagesUniqueList.sort();

    let html = '';
    for (let count = 0; count < m_languagesUniqueList.length; count++) {
        html += `<option value="${m_languagesUniqueList[count]}">${m_languagesUniqueList[count]}</option>`;
    }

    $('.filter-select').append(html);
}


function enableAllInputs() {
    $('.form-control').prop('disabled', false);
}


function searchRepos() {
    $(e_searchInput).on('keyup', function() {
        const value = $(this).val().toUpperCase();

        if (value == '') {
            $('.repo').removeClass('d-none');
            return;
        }

        $('.repo').addClass('d-none');
        $(`.repo .search-blank:contains(${value})`).closest('.repo').removeClass('d-none');
    });
}


function sortRepos() {
    $(e_sortSelect).on('change', function() {
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
    let repos = m_listCards;

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
    let repos = m_listCards;

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
    let repos = m_listCards;

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
    $(e_filterSelect).on('change', function() {
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

function getNumStars() {
    const numStars = $('.repo').length;
    const display = numStars + ' stars';

    $('.num-stars').text(display);
}



