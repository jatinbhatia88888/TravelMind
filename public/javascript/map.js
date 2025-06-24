
      // Initialize the map
      var map = L.map('map').setView([28.6139, 77.2090], 10); // Default to New Delhi
  
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
  
      var marker; // Global marker variable
  
          var url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent("jaipur")}`;
  
          fetch(url).then(response => response.json())
          .then(data => {
              if (data.length > 0) {
                  var lat = data[0].lat;
                  var lon = data[0].lon;
                  var location = [lat, lon];
  
                  if (marker) map.removeLayer(marker);
  
                  
                  marker = L.marker(location).addTo(map).bindPopup(`Location: ${data[0].display_name} <br/> <b>You will leave here <b>`)
                      .openPopup();

                  map.setView(location, 15);
              } else {
                  alert("Location not found!");
              }
          })
          .catch(error => console.error("Error fetching geocode data:", error));
      
