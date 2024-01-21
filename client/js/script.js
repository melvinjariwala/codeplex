function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'block';
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

function showLandingPage() {
    // Add code to display your landing page content
    // For example, create and append elements to the DOM
    const landingPageContent = document.createElement('div');
    landingPageContent.innerHTML = `
    
    <h1>Welcome to CodePlex!</h1>
    <p>Enter a GitHub username to get started.</p>
    
    `;
    landingPageContent.classList.add("landing-page")
    document.body.appendChild(landingPageContent);


    $(".main-content").hide();
}

function hideLandingPage() {
    const landingPage = document.querySelector('.landing-page');
    if (landingPage) {
        landingPage.remove();
        $(".main-content").show();
    }
}

function showError() {
    const errorMessage = document.createElement('div');
    errorMessage.innerHTML = `<h1>User not found!</h1><p>Please enter valid GitHub username</p>`;
    errorMessage.classList.add("error-message");
    document.body.appendChild(errorMessage);
    $(".main-content").hide();
}

function hideError() {
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
        $(".main-content").show();
    }
}

function contact() {
    fetchUserInfoAndRepos("melvinjariwala", 1, 10)
}

function fetchUserInfoAndRepos(username, page = 1, pageSize = 10, filterTerm = '') {
    // Fetch user information from the server
    showLoader();
    fetch(`https://api.github.com/users/${username}`)
        .then(response => response.json())
        .then(userInfo => {
            // Update image source with user's avatar
            if (userInfo.message === "Not Found") {
                showError();
            } else {
                hideError();
                const avatarImage = $('#avatar');
                avatarImage.attr('src', userInfo.avatar_url);

                // Update other user information fields
                $('#user-name').text(userInfo.name);
                $('#user-bio').text(userInfo.bio);
                $('#user-location').text(userInfo.location);
                $('#user-link').attr('href', userInfo.html_url).attr('target', '_blank').text(userInfo.html_url);

                // Fetch user repositories and update the UI with pagination
                fetchRepositories(userInfo, page, pageSize, filterTerm);
            }

        })
        .catch(error => console.error(error)).finally(() => hideLoader());
}

function fetchRepositories(user, page, pageSize, filterTerm) {
    const per_page = filterTerm ? user.public_repos : pageSize
    const API_URL = `https://api.github.com/users/${user.login}/repos?page=${page}&per_page=${per_page}`;
    console.log("API_URL", API_URL);

    // Fetch user repositories for the specified page and page size
    fetch(API_URL)
        .then(response => response.json())
        .then(repositories => {
            console.log(repositories);

            const filteredRepositories = filterRepositories(repositories, filterTerm);

            // Update HTML with repositories
            const repositoriesContainer = $('#repositories-container');
            repositoriesContainer.empty();

            filteredRepositories.forEach(repo => {
                const repoContainer = $('<div class="repository-container"></div>');

                const repoName = $(`<h3>${repo.name}</h3>`);
                const repoDescription = $(`<p>${repo.description === null ? " " : repo.description}</p>`);
                const topicsContainer = $('<div class="topics-container"></div>');

                if (repo.topics && repo.topics.length > 0) {
                    repo.topics.forEach(topic => {
                        const topicElement = $(`<span class="topic">${topic}</span>`);
                        topicsContainer.append(topicElement);
                    });
                }

                repoContainer.append(repoName);
                repoContainer.append(repoDescription);
                repoContainer.append(topicsContainer);

                repositoriesContainer.append(repoContainer);
            });

            // Handle pagination controls
            handlePaginationControls(user, page, pageSize, filterTerm ? filteredRepositories.length : user.public_repos, filterTerm);
        })
        .catch(error => console.error(error));
}

function filterRepositories(repositories, filterTerm) {
    if (!filterTerm) {
        return repositories;
    }

    const lowerCaseFilter = filterTerm.toLowerCase();
    return repositories.filter(repo => {
        const repoName = repo.name.toLowerCase();
        const repoDescription = repo.description ? repo.description.toLowerCase() : '';

        const topics = repo.topics && repo.topics.map(topic => topic.toLowerCase());

        return repoName.includes(lowerCaseFilter) || repoDescription.includes(lowerCaseFilter) ||
            (topics && topics.some(topic => topic.includes(lowerCaseFilter)));
    });
}

function handlePaginationControls(user, currentPage, pageSize, totalRepositories, filterTerm) {
    const paginationControls = document.getElementById('pagination-controls');

    if (!paginationControls) {
        console.error('Error: Pagination controls container not found.');
        return;
    }

    // Clear existing pagination controls
    paginationControls.innerHTML = '';

    // Create a label for clarity
    const pageSizeLabel = document.createElement('label');
    pageSizeLabel.innerText = 'Repositories per page: ';

    // Create a select element for choosing the number of repositories per page
    const pageSizeSelect = document.createElement('select');
    pageSizeSelect.addEventListener('change', function () {
        // Handle change in page size
        console.log("pageSizeSelect.value", pageSizeSelect.value);
        console.log("user", user);
        fetchUserInfoAndRepos(user.login, 1, parseInt(pageSizeSelect.value), filterTerm);
    });

    [10, 20, 50, 100].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.text = option;
        pageSizeSelect.add(optionElement);
    });

    pageSizeSelect.value = pageSize.toString(); // Set the selected option based on the current page size


    pageSizeLabel.appendChild(pageSizeSelect);

    // Append the controls to the page
    paginationControls.appendChild(pageSizeLabel);

    // Calculate the number of pages
    const totalPages = Math.ceil(totalRepositories / pageSize);
    console.log("totalPages", totalPages)

    // Create page navigation buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.addEventListener('click', function () {
            // Handle click on page button
            fetchRepositories(user, i, pageSize, filterTerm);
        });

        // Highlight the current page button
        if (i === currentPage) {
            pageButton.classList.add('current-page');
        }

        paginationControls.appendChild(pageButton);
    }
}

document.addEventListener('DOMContentLoaded', function () {


    const searchedUsername = localStorage.getItem('username');

    if (!searchedUsername) {
        showLandingPage();
    } else {
        hideLandingPage();
        fetchUserInfoAndRepos(searchedUsername, 1, 10);
    }

    document.getElementById('gitHubForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting in the traditional way

        // Fetch user information and repositories
        const username = document.getElementById('usernameInput').value.trim();
        if (username) {
            localStorage.setItem('username', username);
            hideLandingPage()

            // Clear existing repositories before fetching and displaying new ones
            const repositoriesContainer = document.getElementById('repositories-container');
            repositoriesContainer.innerHTML = '';
            showLoader()

            // Fetch user information with default pagination settings
            const defaultPage = 1;
            const defaultPageSize = 10;

            fetchUserInfoAndRepos(username, defaultPage, defaultPageSize);
        }
    });

    // Event listener for repository filter
    document.getElementById('repositoryFilter').addEventListener('input', function (event) {
        // Fetch the value from the input field
        const filterTerm = event.target.value.trim().toLowerCase();
        console.log("filterTerm", filterTerm);
        // Fetch repositories based on user input (assume default pagination settings for simplicity)
        // const username = document.getElementById('usernameInput').value.trim();
        const username = localStorage.getItem('username');
        if (username) {
            const defaultPage = 1;
            const defaultPageSize = 10;
            fetchUserInfoAndRepos(username, defaultPage, defaultPageSize, filterTerm);
        }
    });
});
