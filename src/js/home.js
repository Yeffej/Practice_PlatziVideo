//Selectores :    
// const $modal = $(".modal")
// const $home = $(".home") selctores con jquery

const $modal = document.getElementById("modal")
const $modalIMG = $modal.querySelector("img")
const $modalTitle = $modal.querySelector("h1")
const $modalDescription = $modal.querySelector("p")
const $drama = document.getElementById("drama")
const $actionContainer = document.getElementById("action")
const $animation = document.getElementById("animation")
const $overlay = document.querySelector("#overlay")
const $hideModal = document.getElementById("hide-modal")
const $feautiringContainer = document.getElementById("featuring")
const $form = document.getElementById("form")
const $home = document.getElementById("home")
const API = 'https://yts.mx/api/v2/list_movies.json?'
const randomAPI = "https://randomuser.me/api/"
const FriendsPlaylist = document.querySelectorAll(".playlistFriends-item")
const containers = [$actionContainer, $drama, $animation]
const $bgButton = document.getElementById("bg-button") 
const $mediaquery = window.matchMedia("screen and (max-width: 767px)")
const $homeSideBar = document.getElementsByClassName("home-sidebar")[0]
let isViewportOnMedia = $mediaquery.matches

function featuringTemplate(searchedMovie) {
  return (`<div class="featuring">
    <div class="featuring-image">
      <img src="${searchedMovie.medium_cover_image}" width="70" height="100" alt="">
    </div>
    <div class="featuring-content">
      <p class="featuring-title">Pelicula encontrada</p>
      <p class="featuring-album">${searchedMovie.title}</p>
    </div>
  </div>
  <div class="featuringOverlay"></div>
  `)
}
function SetAttributes($element, attributes) {
  for (attribute in attributes) {
    $element.setAttribute(attribute, attributes[attribute])
  }
}
function searchedMovie() {
  const dataForm = new FormData($form)
  const data = dataForm.get("searchingFor")
  const movieData = new Promise((resolve, reject)=> {
    const movieSuccess = fetch(`${API}?limit=1&query_term=${data}`)
    resolve(movieSuccess)
    reject(e)      
  }) 
  return movieData
}
function HideSearchMovie() {
  const $featuringOverlay = document.querySelector(".featuringOverlay")
  if(event.target === $featuringOverlay) {
    $feautiringContainer.style.animation = "fadeOut 1s forwards"
    const detectAnimation = ()=> {
      $home.classList.remove("search-active")
      $home.removeEventListener("click", HideSearchMovie)
      $feautiringContainer.removeEventListener("animationend", detectAnimation)
      $feautiringContainer.firstElementChild.style.display = "none"
      $featuringOverlay.style.display = "none"
    }
    $feautiringContainer.addEventListener("animationend", detectAnimation)
  }
}

$form.addEventListener("submit", (event)=> {
    event.preventDefault()
    $home.classList.add("search-active")
    const $loader = document.createElement("img")
    SetAttributes($loader, {
      src: "src/images/loader.gif",
      width: "60",
      height: "60",
    })
    while($feautiringContainer.children.length > 0) {
      $feautiringContainer.removeChild($feautiringContainer.firstChild)
    }
    $feautiringContainer.append($loader)
    $feautiringContainer.style.animation = "none"
    $feautiringContainer.style.display = "grid"
    $home.addEventListener("click", HideSearchMovie)
    searchedMovie()
      .then((movie)=> {  
        return movie.json()
      })
      .then(({data: {movies: movies}})=> {
        const htmlString = featuringTemplate(movies[0])
        $feautiringContainer.innerHTML = htmlString
        $feautiringContainer.style.animation = "fadeIn 1s forwards"
        // if (movies.length == 0){
        //   debugger
        //   throw Error("Lo sentimos, la busqueda que ha realizado es inexistente")
        // }else {
        //   throw Error("Lo sentimos,  al parecer ha habido un problema con la conexion del servidor")
        // }
      })
      .catch((e)=> {
        if(e.message === "Cannot read property '0' of undefined") {
          alert("Lo sentimos, la busqueda que ha realizado es inexistente")
        }else {
          alert("Lo sentimos,  al parecer ha habido un problema con la conexion del servidor")
        }
        $feautiringContainer.firstElementChild.style.display = "none"
        $home.classList.remove("search-active")

      })
})
function template(movies) {
  return (`<div class="primaryPlaylistItem" data-id="${movies.id}">
      <div class="primaryPlaylistItem-image">
        <img src="${movies.medium_cover_image}">
      </div>
      <h4 class="primaryPlaylistItem-title">
        ${movies.title}
      </h4>
    </div>`)
}
function showModal(element, movielist) {
  $overlay.classList.add("active")
  $modal.style.animation = "modalIn .8s forwards"
  
  const hiddingModal = function() {
    $modal.style.animation = "modalOut .8s forwards"
    $overlay.classList.remove("active")
    $hideModal.removeEventListener("click", hiddingModal)
  }
  $hideModal.addEventListener("click", hiddingModal)
  $overlay.addEventListener("click", hiddingModal)
  
  const {id} = element.dataset
  const dataMovie = movielist.find((movie)=> movie.id === parseInt(id, 10))
  $modalIMG.setAttribute("src", dataMovie.medium_cover_image)
  $modalTitle.textContent = dataMovie.title
  $modalDescription.textContent = dataMovie.description_full
  
}
function addEventClick(element, typeOfMovies) {
  element.addEventListener("click", ()=> {
    showModal(element, typeOfMovies)
  })
}

function pushTheMovies(typeOfMovies,  container) {
  const printMovies = typeOfMovies.forEach((movie) => {
    const HTMLstringAction = template(movie)
    const html = document.implementation.createHTMLDocument()
    html.body.innerHTML = HTMLstringAction
    const mainElement = html.body.children[0]
    container.append(mainElement)
    const image = mainElement.querySelector("img")
    image.addEventListener("load", () => {
      event.target.classList.add("fadeIn")
    })
    addEventClick(mainElement, typeOfMovies)
  })
} 

function PeopleTemplate(RandomPerson) {
  return(`<a href="#">
  <img src="${RandomPerson.picture.thumbnail}" alt="echame la culpa" />
  <span>
    ${RandomPerson.name.first} ${RandomPerson.name.last}
  </span>
</a>`)
}
function renderRandomPeople(People) {
  const AddPeopleTemplate = (htmlString, i) => {
    FriendsPlaylist[i].removeChild(FriendsPlaylist[i].firstElementChild)
    FriendsPlaylist[i].innerHTML = htmlString
    
  }
  const Person = People.forEach((person, index) => {
    const htmlString = PeopleTemplate(person)
    AddPeopleTemplate(htmlString, index)
  })
}

async function getmovies() {
  async function getData(url) {
    const response = await fetch(url)
    const data = await response.json()
    return data
  }
  async function ConfirmationStorage(list) {
    if(localStorage.getItem(`${list}List`)) {
      const movies = JSON.parse(localStorage.getItem(`${list}List`))
      return movies
    }else {
      const {data: { movies: movies } } = await getData(API + `genre=${list}`)
      localStorage.setItem(`${list}List`, JSON.stringify(movies))
      return movies
    }
  }

    const actionList = await ConfirmationStorage("action")
    const animationList = await ConfirmationStorage("animation")
    const dramaList = await ConfirmationStorage("drama")
    $actionContainer.removeChild($actionContainer.firstElementChild)
    $drama.removeChild($drama.firstElementChild)
    $animation.removeChild($animation.firstElementChild)
    pushTheMovies(actionList, $actionContainer)
    pushTheMovies(animationList, $animation)
    pushTheMovies(dramaList, $drama)
    
    async function PeopleStorage() {
      let peopleList
      if(localStorage.getItem("People")) {
        peopleList = JSON.parse(localStorage.getItem("People"))
      }else {
        peopleList = await getData(randomAPI + "?results=8")
        localStorage.setItem("People", JSON.stringify(peopleList))
      }
      return peopleList
    }


    const {results: People} = await PeopleStorage()
    renderRandomPeople(People)
}

getmovies()

function Reload() {
  for(let i = 0; i < 3; i++){
  
    while (containers[i].childElementCount > 0) {
      containers[i].removeChild(containers[i].firstElementChild)
    
    }
   
  }
  const $loader = document.createElement("img")
  SetAttributes($loader, {
    src: "src/images/loader.gif",
    width: "70",
    height: "70",
  })
  for(const container of containers) {
    container.appendChild($loader.cloneNode())
  }

  localStorage.clear()
  getmovies()
}

function checkOutBgButton() {
  if (isViewportOnMedia) {
      $bgButton.style.display = "fixed"
      $bgButton.addEventListener("click", bgButttonActions)
      console.log("Into")
  }else {
      $bgButton.style.display = null
      $bgButton.removeEventListener("click", bgButttonActions)
      console.log("out")
  }

}
checkOutBgButton()

$mediaquery.addListener(()=> {
  console.log("OK")
  if(isViewportOnMedia){
    isViewportOnMedia = false
  }else{
    isViewportOnMedia = true
  }
  checkOutBgButton()
})



function bgButttonActions() {
  if ($homeSideBar.style.display !== "none") {
    $homeSideBar.style.display = "none"
    $home.classList.add("sidebar-Desactive")
  } else {
    $homeSideBar.style.display = null
    $home.classList.remove("sidebar-Desactive")
  }
}