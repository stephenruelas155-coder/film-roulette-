
const filmCollection = document.getElementById("filmCollection");
const searchInput = document.getElementById("searchInput");

//simple display system 
// fetch("database/films.json")
//     .then(response => response.json())
//     .then(films => {
//         films.forEach(film => {
//             const item = document.createElement("div");

//             item.innerHTML = `
//                 <h3>${film.title}</h3>
//                 <p>Release Year: ${film.year}</p>
//                 <p>Genre: ${film.genre}</p>
//                 <p>Director: ${film.director}</p>
//                 <hr>
//             `;

//             filmCollection.appendChild(item);
//         });
//     })
//     .catch(error => {
//         console.error("Error loading films:", error);
//     });

//a quicker way to show films
let filmData = [];

//looks for film data
fetch("database/films.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load film data");
        }
        return response.json();
    })
    .then(data => {
        filmData = data;
        console.log("Film Data:", filmData);
        renderFilms(filmData);
    })
    .catch(error => {
        console.error("Error loading films:", error);
    });

//shows films
function renderFilms(films) {
    filmCollection.innerHTML = "";

    films.forEach(film => {
        const item = document.createElement("div");

        // how the films are displayed
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

//search function
function handleSearch() {
    const query = searchBox.value.trim().toLowerCase();

    if (!query) {
        renderFilms(filmData);
        return;
    }

    const results = filmData.filter(film =>
        film.title.toLowerCase().includes(query)
    );

    renderFilms(results);
}

//filtter function


searchBox.addEventListener("input", handleSearch);