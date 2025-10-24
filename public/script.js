// Function to fetch and display recipes
function fetchRecipes(query = "") {
  const url = query ? `/search?name=${encodeURIComponent(query)}` : `/search`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => displayRecipes(data.meals))
    .catch(() => {
      document.getElementById("result").innerHTML = "<p>Error fetching recipes.</p>";
    });
}

// Handle search click
document.getElementById("searchBtn").addEventListener("click", function () {
  const query = document.getElementById("search").value.trim();
  fetchRecipes(query);
});

// Also allow pressing Enter key
document.getElementById("search").addEventListener("keyup", function (e) {
  if (e.key === "Enter") document.getElementById("searchBtn").click();
});

// Display recipe cards
function displayRecipes(recipes) {
  const container = document.getElementById("result");
  container.innerHTML = "";

  if (!recipes || recipes.length === 0) {
    container.innerHTML = "<p>No recipes found! Try something else 🍽️</p>";
    return;
  }

  recipes.forEach(meal => {
    const card = document.createElement("div");
    card.classList.add("recipe");
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
      <p>${meal.strCategory || "Unknown"} | ${meal.strArea || ""}</p>
      <button>View Recipe</button>
    `;
    card.querySelector("button").addEventListener("click", () => openModal(meal));
    container.appendChild(card);
  });
}

// Show modal
function openModal(meal) {
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${ingredient} - ${measure}`);
    }
  }

  modalBody.innerHTML = `
    <h2>${meal.strMeal}</h2>
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
    
    <h3>Ingredients</h3>
    <ul>${ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
    
    <h3>Instructions</h3>
    <p>${meal.strInstructions}</p>
  `;

  modal.style.display = "flex";
}

// Close modal
document.getElementById("close").onclick = () => {
  document.getElementById("modal").style.display = "none";
};

window.onclick = (e) => {
  if (e.target == document.getElementById("modal")) {
    document.getElementById("modal").style.display = "none";
  }
};

// Fetch all recipes initially
window.onload = () => fetchRecipes();
