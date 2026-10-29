const searchBox = document.getElementById("searchBox");
const filmCollection = document.getElementById("filmCollection");

const yearOptions = document.getElementById("yearOptions");
const genreOptions = document.getElementById("genreOptions");
const directorOptions = document.getElementById("directorOptions");
const yearSort = document.getElementById("yearSort");

let filmData = [];


const availableYears = [
    2014,
    2020,
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

// Grab data from films.json
fetch("database/films.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load film data");
        }

        return response.json();
    })
    .then(data => {
        filmData = data;

        createOptions(availableYears, yearOptions, "year");
        createOptions(availableGenres, genreOptions, "genre");
        createOptions(availableDirectors, directorOptions, "director");

        renderFilms();
    })
    .catch(error => {
        console.error("Error loading films:", error);
        filmCollection.textContent = "Could not load films.";
    });

//checkboxes
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

//checkbox selection
function getSelected(property) {
    return [...document.querySelectorAll(
        `input[data-filter="${property}"]:checked`
    )].map(checkbox => checkbox.value);
}

// shows films based on search and filter
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

    //sort by year ascending or descending
    if (yearSort.value === "ascending") {
        results.sort((a, b) => a.year - b.year);
    } else if (yearSort.value === "descending") {
        results.sort((a, b) => b.year - a.year);
    }

    filmCollection.innerHTML = "";

    if (results.length === 0) {
        filmCollection.textContent = "No films were found.";
        return;
    }

    results.forEach(film => {
        const item = document.createElement("div");

        item.innerHTML = `
            <h3>${film.title}</h3>
            <p>Year: ${film.year}</p>
            <p>Genre: ${film.genre}</p>
            <p>Director: ${film.director}</p>
            <hr>
        `;

        filmCollection.appendChild(item);
    });
}



//Search titles 
searchBox.addEventListener("input", renderFilms);

//Sort years based off search
yearSort.addEventListener("change", renderFilms);


document.getElementById("clearFilters").addEventListener("click", () => {
    document.querySelectorAll(
        '.filter-window input[type="checkbox"]'
    ).forEach(checkbox => {
        checkbox.checked = false;
    });

    yearSort.value = "";

    renderFilms();
});