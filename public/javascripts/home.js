// var myIndex = 0;
// carousel();

// function carousel() {
//   var i;
//   var x = document.getElementsByClassName("mySlides");
//   for (i = 0; i < x.length; i++) {
//     x[i].style.display = "none";  
//   }
//   myIndex++;
//   if (myIndex > x.length) {myIndex = 1}    
//   x[myIndex-1].style.display = "block";  
//   setTimeout(carousel, 2000); // Change image every 2 seconds
// }
// drop down moview
// script.js
document.querySelector('.dropbtn').addEventListener('click', function() {
  const dropdownContent = document.querySelector('.dropdown-content');
  dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
});
// pop -open for city select
function updateCity(cityName) {
  document.getElementById('selectedCity').innerText = cityName;

  // Properly trigger Bootstrap's native closing functionality
  var modalEl = document.getElementById('locationModal');
  var modal = bootstrap.Modal.getInstance(modalEl); 
  modal.hide(); // This properly hides the modal and allows other close buttons to work
}

// Detect location functionality (this can be expanded with geolocation APIs)
document.getElementById('detectLocation').addEventListener('click', function() {
  // Mock detection for demo purposes
  updateCity('Detected City');
});

// Real-time city search filtering
document.getElementById('citySearchInput').addEventListener('input', function() {
  var filter = this.value.toLowerCase();
  var cities = document.querySelectorAll('.popular-cities .city');
  
  cities.forEach(function(city) {
    var cityName = city.getAttribute('data-city').toLowerCase();
    if (cityName.includes(filter)) {
      city.style.display = '';
    } else {
      city.style.display = 'none';
    }
  });
});