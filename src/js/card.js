

function Card(parms) {
    this.description      = parms.description;
    this.language         = parms.language;
    this.forks            = parms.forks;
    this.stars            = parms.stargazers_count;
    this.html_url         = parms.html_url;
    this.name             = parms.name;
    this.owner_name       = parms.owner.login;
    this.owner_html_url   = parms.owner.html_url;
}


Card.prototype.getHtml = function() {

    let badge = '';
    if (this.language != null) {
        badge = `<span class="badge badge-secondary">${this.language}</span>`;
    }

    const name = this.name.toUpperCase();
    const ownerName = this.owner_name.toUpperCase();

    
    let html = `
    <li class="list-group-item repo" data-language="${this.language}" data-index="${this.listIndex}" data-name="${name}" data-owner-name="${ownerName}">
        <h3><a target="_blank" href="${this.owner_html_url}">${this.owner_name}</a> / <a target="_blank" href="${this.html_url}">${this.name}</a></h3>
        <p class="description">${this.description}</p>


        <div class="search-blank d-none">${name} ${ownerName}</div>


        <div class="bottom-row">
            <div class="forks"><i class='bx bx-git-repo-forked'></i> ${this.forks.toLocaleString()}</div>
            <div class="stars"><i class='bx bx-star'></i> ${this.stars.toLocaleString()}</div>
            <div class="language">${badge}</div>
        </div>
    </li>`;

    return html;
};




