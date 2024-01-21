const formSubmitted = document.querySelector("form");
const inputSelected = document.querySelector("input");
const repository = document.querySelector(".repositories");
const ContainerMain = document.querySelector(".mainContainer");
const paginationContainer = document.querySelector("#pagination");

const API = "https://api.github.com/users/";
let isSearching = false;

async function fetchData(username) {
    try {
        const response = await fetch(`${API}${username}`);
        if (!response.ok) throw new Error(response.statusText);

        const {
            avatar_url,
            bio,
            blog,
            company,
            followers,
            following,
            location,
            login,
            twitter_username,
        } = await response.json();

        const html = `
            <div class="user-avatar" style="background: url(${avatar_url}) no-repeat center/cover"></div>
            <p class="user-name">${login}</p>
            <button class="follow">Follow</button>
            <p class="user-bio">${bio}</p>
            <div class="followers-info">
                <a href="#">
                    <i class="fa-solid fa-person"></i>
                    <span class="followers">${followers}</span> follower
                </a>

                <a href='#'>
                    <span class="following">${following} </span> following
                </a>

                <div class="icon-container">
                    <i class="fa-regular fa-building"></i>
                    <a href="#" class="company">${company}</a>
                </div>
                <div class="icon-container">
                    <i class="fa-sharp fa-solid fa-location-dot"></i>
                    <a href="#" class="location">${location}</a>
                </div>
                <div class="icon-container">
                    <i class="fa-regular fa-solid fa-link"></i>
                    <a href="#" class="blog">${blog}</a>
                </div>
                <div class="icon-container">
                    <i class="fa-brands fa-twitter"></i>
                    <a href="#" class="twitter_username">@${twitter_username}</a>
                </div>
            </div>
        `;

        const section = document.createElement("section");
        section.classList.add("about-user");
        section.innerHTML = html;
        ContainerMain.insertAdjacentElement("afterbegin", section);
    } catch (error) {
        console.error(error);
    } finally {
        isSearching = false;
    }
}

async function fetchRepos(username, page = 1) {
    try {
        const perPage = 10; // Set the number of repositories per page
        const response = await fetch(`${API}${username}/repos?page=${page}&per_page=${perPage}`);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();

        data.forEach(({ name, description, forks_count, language, watchers_count, html_url }) => {
            const singleElement = document.createElement("div");
            singleElement.classList.add("repo-card");
            const html = `
                <a href=${html_url} class="repo-title">${name}</a>
                <p class="repo-subtitle">${description}</p>
                <div class="popularity">
                    <p class="technology-used">${language}</p>
                    <p class="stars"><i class="fa-regular fa-star"></i>${watchers_count}</p>
                    <img src="./gitlogo.svg" alt="Fork SVG" class="fork-svg">
                    <span class="forked">${forks_count}</span>
                </div>
                <p class="pill">Public</p>
            `;
            singleElement.innerHTML = html;
            repository.append(singleElement);
        });

        // Calculate total pages correctly
        const totalCountResponse = await fetch(`${API}${username}`);
        const totalCountData = await totalCountResponse.json();
        const totalRepos = totalCountData.public_repos;
        const totalPages = Math.ceil(totalRepos / perPage);

        // Add pagination links dynamically
        renderPaginationLinks(totalPages, page);

    } catch (error) {
        console.error(error);
    }
}

function renderPaginationLinks(totalPages, currentPage) {
    paginationContainer.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.classList.add("page-item");
        const a = document.createElement("a");
        a.classList.add("page-link");
        a.href = "#";
        a.textContent = i;

        if (i === currentPage) {
            li.classList.add("active");
        }

        a.addEventListener("click", () => handlePaginationClick(i));
        li.appendChild(a);
        paginationContainer.appendChild(li);
    }
}

async function handlePaginationClick(page) {
    repository.innerHTML = ""; // Clear previous repositories
    await fetchRepos(inputSelected.value, page);
}

formSubmitted.addEventListener("submit", async (e) => {
    e.preventDefault();
    const val = inputSelected.value;

    if (!isSearching && val) {
        try {
            isSearching = true;
            await fetchData(val);
            await fetchRepos(val);
            inputSelected.style.display = "none";

        } catch (error) {
            console.error(error);
        }finally{
            setTimeout(() => {
                // inputSelected.   value="";
                inputSelected.style.display = "block";
            }, 500);
        }
    }
    document
    .querySelector("input")
    .addEventListener("click", () => location.reload());
});
