/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  checkAuthentication();
  const placeId = getPlaceIdFromURL();
  const token = getCookie('token');
  const reviewForm = document.getElementById('review-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Empêche le rechargement de la page

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch(
          'http://127.0.0.1:5000/api/v1/auth/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
          },
        );

        if (response.ok) {
          const data = await response.json();
          document.cookie = `token=${data.access_token}; path=/`; // Stocke le token
          window.location.href = 'index.html'; // Redirige vers l'accueil
        } else {
          const error = await response.json();
          showError(error.message || 'Login failed. Please try again.');
        }
      } catch (err) {
        showError('Error. Check your connexion.');
        console.error(err);
      }
    });
  }
  if (!placeId) return console.error('No place ID found.');

  // Charger les détails du logement
  fetchPlaceDetails(placeId, token);

  // Gérer le formulaire d’avis
  const form = document.getElementById('review-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const reviewText = document.getElementById('review-text').value;

    if (!reviewText.trim()) return alert('Reviews cannot be empty.');

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/v1/places/${placeId}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: reviewText }),
        },
      );

      if (response.ok) {
        document.getElementById('review-text').value = ''; // reset textarea
        loadReviews(placeId, token); // recharge les avis
      } else {
        alert('Review Error.');
      }
    } catch (err) {
      console.error('Network error :', err);
    }
  });

  // Charger les avis à l’affichage
  loadReviews(placeId, token);
});

// Fonction pour afficher un message d’erreur dans la page
function showError(message) {
  const errorDiv = document.getElementById('login-error');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  } else {
    alert(message);
  }
}

// Fonctions pour vérifier si l'utilisateur est connécté par cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Fonction pour vérifier l'authentification et afficher ou cacher le lien de connexion
function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (!token) {
    loginLink.style.display = 'block';
  } else {
    loginLink.style.display = 'none';
    fetchPlaces(token);
  }
}

// Fonction qui récupère les données des places
async function fetchPlaces(token) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/v1/places`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      displayPlaces(data.places); // ou data selon ton API
    } else {
      console.error('Error loading places');
    }
  } catch (err) {
    console.error('Network error :', err);
  }
}

// Fonction pour afficher les places dynamiquement
function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = '';

  places.forEach((place) => {
    const card = document.createElement('place-details');
    card.classList.add('place-card');
    card.setAttribute('data-price', place.price); // Pour le filtre

    card.innerHTML = `
        <h2>${place.name}</h2>
      <img src="${place.image_url}" alt="${
      place.name
    }" style="width: 300px; height: 300px; object-fit: cover;" />
      <p><strong>Price:</strong> ${place.price}€/nuit</p>
      <p><strong>Description:</strong> ${
        place.description || 'No description.'
      }</p>
      <p><strong>Localisation:</strong> ${place.city || '-'}, ${
      place.country || '-'
    }</p>
    `;

    placesList.appendChild(card);
  });
}

// Fonction filtrer les places par prix
document.getElementById('price-filter').addEventListener('change', () => {
  const selectedPrice = document.getElementById('price-filter').value;
  const cards = document.querySelectorAll('.place-card');

  cards.forEach((card) => {
    const price = parseInt(card.getAttribute('data-price'), 10);
    if (selectedPrice === 'all' || price <= parseInt(selectedPrice)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchPlaceDetails(id, token) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/v1/places/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      displayPlace(data.place);
    }
  } catch (err) {
    console.error('Place loading error :', err);
  }
}

function displayPlace(place) {
  const section = document.getElementById('place-details');
  section.innerHTML = `
    <h2>${place.name}</h2>
    <img src="${place.image_url}" alt="${place.name}" style="width:300px; height:300px; object-fit:cover">
    <p>${place.description}</p>
    <p><strong>Prix:</strong> ${place.price}€/nuit</p>
  `;
}

async function loadReviews(id, token) {
  try {
    const res = await fetch(
      `http://127.0.0.1:5000/api/v1/places/${id}/reviews`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    if (res.ok) {
      const reviews = await res.json();
      displayReviews(reviews);
    }
  } catch (err) {
    console.error('Opinion error :', err);
  }
}

function displayReviews(reviews) {
  const list = document.getElementById('review-list');
  list.innerHTML = '';
  reviews.forEach((review) => {
    const li = document.createElement('li');
    li.textContent = review.content;
    list.appendChild(li);
  });
}
