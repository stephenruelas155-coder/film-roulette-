const filmCollection = document.getElementById("filmCollection");

fetch("database/films.json")
    .then(response => response.json())
    .then(films => {
        films.forEach(film => {
            const item = document.createElement("div");

            item.innerHTML = `
                <h3>${film.title}</h3>
                <p>Release Year: ${film.year}</p>
                <p>Genre: ${film.genre}</p>
                <p>Director: ${film.director}</p>
                <hr>
            `;

            filmCollection.appendChild(item);
        });
    })
    .catch(error => {
        console.error("Error loading films:", error);
    });