const API_KEY = 'c8535c53';
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;
const BACKEND = window.location.hostname.includes("localhost")
  ? "http://localhost:5000"
  : "https://moviereview-appnew.onrender.com";


const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');
const current = document.getElementById('current');

let currentPage = 1;
let currentQuery = '';
let currentGenre = '';
const genres = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
  'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sport',
  'Thriller', 'War', 'Western'
];

setGenreTags();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  currentQuery = searchTerm;
  currentPage = 1;
  getMovies();
});

document.getElementById('next').addEventListener('click', () => {
  currentPage++;
  getMovies();
});

document.getElementById('prev').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    getMovies();
  }
});

function setGenreTags() {
  tagsEl.innerHTML = '';
  genres.forEach(genre => {
    const tag = document.createElement('div');
    tag.classList.add('tag');
    tag.innerText = genre;
    tag.addEventListener('click', () => {
      currentGenre = genre === currentGenre ? '' : genre;
      getMovies();
      highlightTag();
    });
    tagsEl.appendChild(tag);
  });
}

function highlightTag() {
  const tags = document.querySelectorAll('.tag');
  tags.forEach(tag => {
    tag.classList.remove('highlight');
    if (tag.innerText === currentGenre) {
      tag.classList.add('highlight');
    }
  });
}

function getMovies() {
  main.innerHTML = '';
  const url = `${BASE_URL}&s=${currentQuery || 'Avengers' }&page=${currentPage}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.Response === 'True') {
        fetchDetails(data.Search);
      } else {
        main.innerHTML = `<h2 class="no-results">No results found</h2>`;
      }
    });
}

function fetchDetails(movies) {
  const requests = movies.map(movie =>
    fetch(`${BASE_URL}&i=${movie.imdbID}&plot=full`).then(res => res.json())
  );

  Promise.all(requests).then(fullData => {
    fullData.forEach(movie => {
      if (!currentGenre || (movie.Genre && movie.Genre.includes(currentGenre))) {
        showMovie(movie);
      }
    });
    current.innerText = currentPage;
  });
}


function showMovie(movie) {
  const movieEl = document.createElement('div');
  movieEl.classList.add('movie');

  const reviewSectionId = `reviews-${movie.imdbID}`;

  movieEl.innerHTML = `
    <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450'}" alt="${movie.Title}">
    <div class="movie-info">
      <h3>${movie.Title}</h3>
      <span class="${getRatingColor(movie.imdbRating)}">${movie.imdbRating}</span>
    </div>
    <div class="overview">
      <h3>Overview</h3>
      ${movie.Plot}
      <button class="know-more review-btn" data-id="${movie.imdbID}" data-title="${movie.Title}">Add Review</button>
    </div>

      <div class="review-section" id="${reviewSectionId}"></div>
  `;

  main.appendChild(movieEl);

  
  const reviewBtn = movieEl.querySelector('.review-btn');
  reviewBtn.addEventListener('click', () => {
    const movieIdInput = document.getElementById('movieId');
    movieIdInput.value = movie.imdbID;
    const modalTitle = document.querySelector(".review-modal-content h2");
    modalTitle.textContent = `Submit Your Review for "${movie.Title}"`;
    const modal = document.getElementById('reviewModal');
    modal.style.display = 'block';
  });
  requestAnimationFrame(() => {
    loadReviews(movie.imdbID);
  });
}
function loadReviews(movieId) {
  const container = document.getElementById(`reviews-${movieId}`);
  if (!container) {
    console.warn(`Missing review container for ${movieId}`);
    return;
  }

  container.innerHTML = '<p>Loading reviews...</p>';

  fetch(`${BACKEND}/api/reviews/${movieId}`)
    .then(res => res.json())
    .then(reviews => {
      if (!Array.isArray(reviews) || reviews.length === 0) {
        container.innerHTML = '<p>No reviews yet.</p>';
        return;
      }

      container.innerHTML = ''; 

      reviews.forEach(r => {
        const div = document.createElement('div');
        div.classList.add('review-entry');
        div.innerHTML = `
          <strong>${r.username}</strong> (${r.rating}/10):<br/>
          <p>${r.comment}</p>
          <hr/>
        `;
        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error('Error loading reviews:', err);
      container.innerHTML = '<p style="color:red">Failed to load reviews.</p>';
    });
}

function getRatingColor(vote) {
  if (vote >= 8) return 'green';
  else if (vote >= 5) return 'orange';
  else return 'red';
}
getMovies();
const modal = document.getElementById("reviewModal");
const span = document.querySelector(".close-review");
const formReview = document.getElementById("reviewForm");
let currentReviewMovieId = "";

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("review-btn")) {
    const movieId = e.target.dataset.id;
    currentReviewMovieId = movieId;
    document.getElementById("movieId").value = movieId;
    modal.style.display = "block";
  }
});

span.onclick = () => (modal.style.display = "none");

window.onclick = (e) => {
  if (e.target == modal) modal.style.display = "none";
};

formReview.addEventListener("submit", async (e) => {
  e.preventDefault();
  const movieId = document.getElementById("movieId").value;
  const username = document.getElementById("username").value.trim();
  const rating = document.getElementById("rating").value;
  const comment = document.getElementById("comment").value.trim();

  if (!username || !rating || !comment || !movieId) return;

  try {
    const res = await   fetch(`${BACKEND}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId, username, rating, comment })
    });

    if (!res.ok) throw new Error("Failed to submit review");

    await loadReviews(movieId); 
    modal.style.display = "none";
    formReview.reset();
  } catch (err) {
    console.error("Error submitting review:", err);
    alert("Failed to submit review. Please try again.");
  }
});
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('review-btn')) {
    const imdbID = e.target.dataset.id;
    const modal = document.getElementById('reviewModal');
    const movieIdInput = document.getElementById('movieId');
    movieIdInput.value = imdbID;
    modal.style.display = 'block';
  }
});
document.querySelector('.close-review').addEventListener('click', () => {
  document.getElementById('reviewModal').style.display = 'none';
});
