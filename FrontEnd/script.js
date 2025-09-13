//connexion pour obtenir le token
async function login() {
  const loginUrl = "http://127.0.0.1:5678/api/users/login";
  const credentials = {
    email: "sophie.bluel@test.tld",
    password: "S0phie",
  };

  try {
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const data = await response.json();
    const token = data.token;
    console.log("Token :", token);
    localStorage.setItem("token", token);
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
  }
}

login();


//----------------------------------------------------------------------
//fonction de recuperation des oeuvres
async function fetchWorks() {
  const token = localStorage.getItem("token");
  const worksUrl = "http://127.0.0.1:5678/api/works";

  try {
    const response = await fetch(worksUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const works = await response.json();
    console.log("Oeuvres récupérées :", works);
    return works;
  } catch (error) {
    console.error("Erreur lors de la récupération des oeuvres :", error);
    return [];
  }
}

//----------------------------------------------------------------------
//Afficher les oeuvres dans la galerie
function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  works.forEach(work => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

//recupération et affichage
fetchWorks().then(works => {
  displayWorks(works);
});


//----------------------------------------------------------------------
//fonction de recuperation des catégories
async function fetchCategories() {
  const token = localStorage.getItem("token");
  const categoriesUrl = "http://127.0.0.1:5678/api/categories";

  try {
    const response = await fetch(categoriesUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const categories = await response.json();

    // assurer une liste sans doublons avec set
    const categoryIds = new Set();
    const uniqueCategories = categories.filter(cat => {
      if (categoryIds.has(cat.id)) {
        return false;
      } else {
        categoryIds.add(cat.id);
        return true;
      }
    });

    console.log("Catégories uniques :", uniqueCategories);
    return uniqueCategories;

  } catch (error) {
    console.error("Erreur lors de la récupération des categories :", error);
    return [];
  }
}

//----------------------------------------------------------------------
// afficher les catégories + brancher les filtres
function displayCategories(categories, works) {
  const containerFilter = document.querySelector(".container-filter");
  containerFilter.innerHTML = "";

  // fonction pour gérer l'état actif
  function setActive(button) {
    // retire "active-filter" de tous les boutons
    containerFilter.querySelectorAll(".button-filter").forEach(btn => {
      btn.classList.remove("active-filter");
    });
    // ajoute au bouton cliqué
    button.classList.add("active-filter");
  }

  // bouton "Tous"
  const allButton = document.createElement("button");
  allButton.classList.add("button-filter");
  allButton.type = "button";
  allButton.textContent = "Tous"; 
  allButton.addEventListener("click", () => {
    displayWorks(works);
    setActive(allButton);
  });
  containerFilter.appendChild(allButton);

  // boutons pour chaque catégorie
  categories.forEach(category => {
    const button = document.createElement("button");
    button.classList.add("button-filter");
    button.type = "button";
    button.textContent = category.name;

    button.addEventListener("click", () => {
      const filtered = works.filter(work => work.categoryId === category.id);
      displayWorks(filtered);
      setActive(button);
    });

    containerFilter.appendChild(button);
  });

    setActive(allButton);

}

//----------------------------------------------------------------------
// récupération et affichage global
Promise.all([fetchWorks(), fetchCategories()]).then(([works, categories]) => {
  displayWorks(works); // affichage initial
  displayCategories(categories, works); // filtres branchés
});