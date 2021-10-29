let body = document.body;
let dataDump = [];
let months = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December"
}
let genreList = {
    12: "Adventure",
    14: "Fantasy",
    16: "Animation",
    18: "Drama",
    27: "Horror",
    28: "Action",
    35: "Comedy",
    36: "History",
    37: "Western",
    53: "Thriller",
    80: "Crime",
    99: "Documentary",
    878: "Science Fiction",
    9648: "Mystery",
    10402: "Music",
    10749: "Romance",
    10751: "Family",
    10752: "War",
    10770: "TV Movie"
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function removeElementsByClass(className){
    let elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

let apiKey = "1cf50e6248dc270629e802686245c2c8";

function klikFilm(id) {
    removeElementsByClass("row");
    let divEl = document.createElement("div");
    divEl.classList.add("detail");
    for(let i in dataDump) {
        if(dataDump[i]["id"] == id) {
            let poster = dataDump[i]["poster_path"];
            let judul = dataDump[i]["title"];
            let rilis = dataDump[i]["release_date"];
            console.log(rilis);
            rilis = `${rilis.slice(8, 10)} ${months[rilis.slice(5, 7)]} ${rilis.slice(0, 4)}`;
            console.log(rilis)
            let rating = dataDump[i]["vote_average"];
            let voter = dataDump[i]["vote_count"];
            let deskripsi = dataDump[i]["overview"];
            cariDetail(id).then(resu => resu.json()).then(result => {
                divEl.innerHTML += `<img class="poster" src="https://image.tmdb.org/t/p/w500${poster}" align="left">
                <h3 class="movie">${judul} (${rilis})</h3>
                <h3 class="rating">&#9733; ${rating} (${voter})</h3>
                <h3 class="deskripsi">${deskripsi}</h3>`
                let listComp = "";
                document.getElementsByClassName("deskripsi")[0].style.height = "100%";
                divEl.innerHTML += `<h3 class="productions">Production:</h3>
                <div class="production" style="display: inline-block;">`;
                for(let j in result["production_companies"]) {
                    prodEl = document.getElementsByClassName("production")[0];
                    if(result["production_companies"][j]["logo_path"] !== null) {
                        prodEl.innerHTML += `<img class="production-logo" src="https://image.tmdb.org/t/p/w500${result["production_companies"][j]["logo_path"]}" height=100>
                            <h3 class="production-companies" style="font-size: 12pt;">${result["production_companies"][j]["name"]}
                        </div>`;
                    } else {
                        if(listComp == "") {
                            listComp = result["production_companies"][j]["name"];
                        } else {
                            listComp += `, ${result["production_companies"][j]["name"]}`;
                        }
                        console.log(listComp);
                    }
                }
                let prodLog = document.getElementsByClassName("production-logo")[0];
                let prodCom = document.getElementsByClassName("productions")[0];
                if(prodLog == null) {
                    prodCom.innerText += ` ${listComp}`;
                }
            });
        }
    }
    body.append(divEl);
}

function cariFilm(judul) {
    while(judul.search(" ") > -1) {
        judul = judul.replace(" ", "%20");
    }
    let result = fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&page=1&query=${judul}`);
    return result;
}

function cariDetail(id) {
    let result = fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
    return result;
}

function cari(judul) {
    let urutan = [];
    cariFilm(judul).then(res => res.json()).then(data => {
        removeElementsByClass("row");
        removeElementsByClass("detail");
        data = data["results"];
        if(data.length > 0) {
            let divEl = document.createElement("div");
            divEl.classList.add("row");
            document.getElementsByClassName("lds-ellipsis")[0].style.display = "inline-block";
            document.getElementsByTagName("html")[0].style.cursor = "progress";
            for(let i = 0; i < data.length; i++) {
                if(data[i]["original_language"] == "en") {
                    // console.log(data[i]);
                    if(data[i]["release_date"] !== null && data[i]["release_date"] !== "") {
                        urutan[i] = data[i]["release_date"];
                    }
                }
            }
            urutan.sort().reverse();
            // console.log(urutan);
            sleep(1500).then(() => {
                document.getElementsByClassName("lds-ellipsis")[0].style.display = "none";
                document.getElementsByTagName("html")[0].style.cursor = "auto";
                for(let j = 0; j < urutan.length; j++) {
                    for(let i = 0; i < data.length; i++) {
                        if(urutan[j] == data[i]["release_date"]) {
                            dataDump[i] = data[i];
                            let poster = data[i]["poster_path"];
                            let deskripsi = data[i]["overview"];
                            let rating = data[i]["vote_average"];
                            let genres = "";
                            for(let genreId in data[i]["genre_ids"]) {
                                if(genres == "") {
                                    genres = genreList[data[i]["genre_ids"][genreId]];
                                } else {
                                    genres += `, ${genreList[data[i]["genre_ids"][genreId]]}`;
                                }
                            }
                            if(poster !== null && poster !== "") {
                                let judul = data[i]["title"];
                                let voter = data[i]["vote_count"];
                                let id = data[i]["id"];
                                divEl.innerHTML += `<div class="column" onclick="klikFilm(${id})" style="cursor: pointer;">
                                    <img class="poster" src="https://image.tmdb.org/t/p/w500${poster}" align="left">
                                    <h3 class="movie">${judul} (${urutan[j].slice(0, 4)})</h3>
                                    <h3 class="rating">&#9733; ${rating} (${voter})</h3>
                                    <h3 class="deskripsi">${deskripsi}</h3>
                                </div>`
                                body.append(divEl);
                            }
                        }
                    }
                }
            });
        } else {
            while(judul.search("%20") > -1) {
                print(judul)
                judul = judul.replace("%20", " ");
            }
            let divEl = document.createElement("div");
            divEl.classList.add("row");
            divEl.innerHTML = `No film has found with the query of "${judul}".`;
            body.append(divEl);
        }
    })
}
// console.log(dataDump)
for(let x in dataDump) {
    console.log(dataDump[x])
}
input = document.getElementById("judul");
button = document.getElementById("button");
button.addEventListener("click", function () {
    cari(input.value);
});
input.addEventListener("keyup", function (event) {
    // Checking if key pressed is ENTER or not
    // if the key pressed is ENTER
    // click listener on button is called
    if (event.keyCode == 13) {
        button.click();
    }
});