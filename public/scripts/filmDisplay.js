const searchBox = document.getElementById("searchBox");
const filmCollection = document.getElementById("filmCollection");

const yearOptions = document.getElementById("yearOptions");
const genreOptions = document.getElementById("genreOptions");
const directorOptions = document.getElementById("directorOptions");
const yearSort = document.getElementById("yearSort");

const wheelCollection = document.getElementById("wheelCollection");

let filmData = [];


const availableYears = [
    2014,
    2020,
    2021,
    2022,
    2026
];

const availableGenres = [
    "Action",
    "Horror",
    "Science fiction",
    "Comedy",
];

const availableDirectors = [
    "Christopher Nolan",
    "Destin Daniel Cretton",
    "Kane Parsons",
    "Jordan Peele"
];

async function loadFilms() {
    try {
        const response = await fetch('/api/films-with-ratings');

        if (!response.ok) {
            throw new Error("Unable to load films");
        }

        const data = await response.json();

        filmData = data;

        createOptions(availableYears, yearOptions, "year");
        createOptions(availableGenres, genreOptions, "genre");
        createOptions(availableDirectors, directorOptions, "director");

        renderFilms();

    } catch (error) {
        console.error("Error loading films:", error);
        filmCollection.textContent = "Could not load films.";
    }
}

loadFilms();

function createOptions(options, container, property) {
    container.innerHTML = "";

    options.forEach(value => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.value = value;
        checkbox.dataset.filter = property;

        checkbox.addEventListener("change", renderFilms);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + value));

        container.appendChild(label);
    });
}

function getSelected(property) {
    return [...document.querySelectorAll(
        `input[data-filter="${property}"]:checked`
    )].map(checkbox => checkbox.value);
}

function renderFilms() {
    const query = searchBox.value.trim().toLowerCase();

    const selectedYears = getSelected("year");
    const selectedGenres = getSelected("genre");
    const selectedDirectors = getSelected("director");

    let results = filmData.filter(film => {
        const matchesTitle =
            film.title.toLowerCase().includes(query);

        const matchesYear =
            selectedYears.length === 0 ||
            selectedYears.includes(String(film.year));

        const matchesGenre =
            selectedGenres.length === 0 ||
            selectedGenres.includes(film.genre);

        const matchesDirector =
            selectedDirectors.length === 0 ||
            selectedDirectors.includes(film.director);

        return matchesTitle &&
               matchesYear &&
               matchesGenre &&
               matchesDirector;
    });

    if (yearSort.value === "asc") {
        results.sort((a, b) => a.year - b.year);
    } else if (yearSort.value === "desc") {
        results.sort((a, b) => b.year - a.year);
    }

    filmCollection.innerHTML = "";

    if (results.length === 0) {
        filmCollection.textContent = "No films were found.";
        return;
    }

    results.forEach((film, index) => {
        const item = document.createElement("div");

        item.innerHTML = `
            <h3>${film.title}</h3>
            <button class="addToWheel" data-index="${filmData.indexOf(film)}">
            Add to Wheel
            </button>
            <p>Year: ${film.year}</p>
            <p>Genre: ${film.genre}</p>
            <p>Director: ${film.director}</p>
            <p>TMDB Rating: ${
            film.tmdbRating !== null && film.tmdbRating !== undefined
            ? film.tmdbRating.toFixed(1) + "/10"
            : "Not rated"
            }</p>
            <hr>
        `;

        filmCollection.appendChild(item);
    });
}


document.getElementById("clearFilters").addEventListener("click", () => {
    document.querySelectorAll(
        '.filter-window input[type="checkbox"]'
    ).forEach(checkbox => {
        checkbox.checked = false;
    });

    yearSort.value = "";

    renderFilms();
});

searchBox.addEventListener("input", renderFilms);

yearSort.addEventListener("change", renderFilms);


async function addToWheel(film) {
    await fetch('/api/wheel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(film)
    });

    loadWheel();
}

async function loadWheel() {
    const response = await fetch('/api/wheel');
    const films = await response.json();

    wheelCollection.innerHTML = "";

    films.forEach(film => {
        wheelCollection.innerHTML += `
            <div>
                <h3>${film.title}</h3>

                <button class="removeFromWheel" data-id="${film._id}">
                    Remove
                </button>
            </div>
        `;
    });
}

async function removeFromWheel(id) {
    await fetch(`/api/wheel/${id}`, {
        method: 'DELETE'
    });

    loadWheel();
}

filmCollection.addEventListener('click', function(event) {
    if (event.target.classList.contains('addToWheel')) {
        const index = event.target.dataset.index;
        addToWheel(filmData[index]);
    }
});

wheelCollection.addEventListener('click', function(event) {
    if (event.target.classList.contains('removeFromWheel')) {
        const id = event.target.dataset.id;
        removeFromWheel(id);
    }
});

async function clearWheel() {
    await fetch('/api/wheel', {
        method: 'DELETE'
    });

    loadWheel();

    document.getElementById("randomMovie").innerHTML = "";
}

async function spinWheel() {
    const response = await fetch('/api/wheel');
    const films = await response.json();

    if (films.length === 0) {
        document.getElementById("randomMovie").innerHTML =
            "<p>Your wheel is empty!</p>";
        return;
    }

    const randomIndex = Math.floor(Math.random() * films.length);
    const selectedMovie = films[randomIndex];

    document.getElementById("randomMovie").innerHTML = `
        <h3>Your Movie Is:</h3>
        <h2>${selectedMovie.title}</h2>
    `;
}

loadWheel();

document.getElementById("clearWheel").addEventListener("click", clearWheel);

document.getElementById("spinWheel").addEventListener("click", spinWheel);