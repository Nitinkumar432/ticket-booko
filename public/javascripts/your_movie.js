document.querySelector('.dropbtn').addEventListener('click', function() {
    const dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
  });

  
  // pop -up youtubr
function openModal(trailerUrl) {
    // Extract video ID from the YouTube URL
    const videoId = new URL(trailerUrl).searchParams.get('v');
    const iframeSrc = `https://www.youtube.com/embed/${videoId}`;

    document.getElementById('trailerFrame').src = iframeSrc;
    document.getElementById('myModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('myModal').style.display = 'none';
    document.getElementById('trailerFrame').src = ''; // Stop video when modal is closed
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == document.getElementById('myModal')) {
        closeModal();
    }
}
// search movie
function searchMovies() {
  const input = document.getElementById('movieSearch').value.toLowerCase();
  const movieItems = document.querySelectorAll('.movie-item');
  
  movieItems.forEach(item => {
      // Get the movie details
      const title = item.querySelector('h3').innerText.toLowerCase();
      const genre = item.querySelector('p').innerText.toLowerCase(); // Assuming genre is in the first <p> element
      const description = item.querySelectorAll('.movie-details p')[1].innerText.toLowerCase(); // Assuming description is the second <p> element

      // Check if the input matches any of the details
      if (title.includes(input) || genre.includes(input) || description.includes(input)) {
          item.style.display = 'block';
      } else {
          item.style.display = 'none';
      }
  });
}
