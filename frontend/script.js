let currentMovieID = null;

function showMovie(movie) {
  const main = document.getElementById('main');
  const movieEl = document.createElement('div');
  movieEl.classList.add('movie');
  movieEl.innerHTML = `
    <img src="\${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450'}" alt="\${movie.Title}">
    <div class="movie-info">
      <h3>\${movie.Title}</h3>
      <span>\${movie.imdbRating}</span>
    </div>
    <div class="overview">
      <h3>Overview</h3>
      \${movie.Plot}
      <br><button class="know-more" onclick="openReviewModal('\${movie.imdbID}')">Add Review</button>
      <div id="reviews-\${movie.imdbID}" class="reviews-section"></div>
    </div>
  `;
  main.appendChild(movieEl);
  fetchReviews(movie.imdbID);
}

function openReviewModal(id) {
  currentMovieID = id;
  document.getElementById('reviewModal').style.display = 'block';
}

function closeReviewModal() {
  document.getElementById('reviewModal').style.display = 'none';
}

function submitReview() {
  const username = document.getElementById('username').value;
  const comment = document.getElementById('comment').value;
  const rating = document.getElementById('rating').value;

  fetch('http://localhost:5000/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imdbID: currentMovieID,
      username,
      comment,
      rating
    })
  }).then(() => {
    closeReviewModal();
    fetchReviews(currentMovieID);
  });
}

function fetchReviews(imdbID) {
  fetch(\`http://localhost:5000/api/reviews/\${imdbID}\`)
    .then(res => res.json())
    .then(data => {
      const reviewsEl = document.getElementById(\`reviews-\${imdbID}\`);
      reviewsEl.innerHTML = '<h4>User Reviews:</h4>' + data.map(r => `
        <p><strong>\${r.username}</strong> (\${r.rating}/10): \${r.comment}</p>
      `).join('');
    });
}
