// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoibGVpbGFtZWsiLCJhIjoiY21rZWdjdnlmMDc5YTNwcHFrZnczNThpaCJ9.UZKbkcoXpDtNXE7Uc3pF6A'; //*** ADD PUBLIC ACCESS TOKEN HERE ***

// Initialize map
const map = new mapboxgl.Map({
    container: 'my-map',
    style: 'mapbox://styles/leilamek/cmkyjk42k007z01qr6o6284c7',
    center: [-79.359, 43.725],
    zoom: 9.68,
    minZoom: 9.68
});

/*--------------------------------------------------------------------
MAP CONTROLS
--------------------------------------------------------------------*/

// Add search control to map overlay
// Requires plugin as source in HTML body
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        countries: "ca" // Try searching for places inside and outside of canada to test the geocoder
    })
);

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

/*--------------------------------------------------------------------
ADD GEOJSON FILE
--------------------------------------------------------------------*/
// Add data source and draw initial visiualization of layer
map.on('load', () => {

    map.addSource('Toronto_DA', {
        'type': 'geojson',
        'data': 'https://raw.githubusercontent.com/leilamek/Lab-3-ggr472/main/Data/Toronto%20DA%20Geomerty%20(Simplified).geojson'
    });

    //Defined initial map view displaying population density with popden button highligted at initial map load

    map.addLayer({
        'id': 'Toronto_DA-fill',
        'type': 'fill',
        'source': 'Toronto_DA',
        'paint': {
            'fill-color': [
                'step',
                ['get', 'Population_Density'],
                '#feebe2',
                24133.34, '#fbb4b9',
                48266.68, '#f768a1',
                72400.02, '#c51b8a',
                96533.36, '#7a0177'
            ],
            'fill-opacity': 0.7,
            'fill-outline-color': '#e06db6'
        }
    });

    setMap('popden', document.querySelector('.var-button'));
});

/*--------------------------------------------------------------------
ADD POP-UP ON CLICK EVENT
--------------------------------------------------------------------*/
map.on('mouseenter', 'Toronto_DA-fill', () => {
map.getCanvas().style.cursor = 'pointer'; // Switch cursor to pointer when mouse is over provterr-fill layer
});

map.on('mouseleave', 'Toronto_DA-fill', () => {
map.getCanvas().style.cursor = ''; // Switch cursor back when mouse leaves provterr-fill layer
map.setFilter("Toronto_DA-hl", ['==', ['get', 'DAUID'], '']); // Reset filter for highlighted layer after mouse leaves feature
});

//click on map to display variable values for the selected dissemination-area (DA) including its DAUID, pop density, apartment and single-family dwellings total occupied

map.on('click', 'Toronto_DA-fill', (e) => {
new mapboxgl.Popup() // Declare new popup object on each click
.setLngLat(e.lngLat) // Use method to set coordinates of popup based on mouse click location
.setHTML("<b>DAUID:</b> " + e.features[0].properties.DAUID + "<br>" +
"<b>Population Density: </b> " + e.features[0].properties.Population_Density + "<br>"+
"<b>Apartments/Condos: </b> " + e.features[0].properties.Apartments + "<br>" +
"<b>Detached/Single: </b> " + e.features[0].properties.Single_House)
 // Use click event properties to write text for popup
 .addTo(map); // Show popup on map
 });

/*--------------------------------------------------------------------
ADD RESET MAP EXTENT BUTTON
--------------------------------------------------------------------*/
//Add reset map extent button. Sets map zoom and coordinates back to original extent users see when opening web-page
document.getElementById('reset-map').addEventListener('click', () => {
    map.flyTo({
        center: [-79.359, 43.725],
        zoom: 9.68,
        bearing: 0,                
        pitch: 0    
    });
});

/*--------------------------------------------------------------------
ADDED MAP LEGEND FUNCTIONALITY AND UPDATES BASED ON VARIABLE BUTTON SELECTED
--------------------------------------------------------------------*/

function setMap(variable, button) {

    let expression;

    if (variable === 'popden') {

        expression = [
    'step',
    ['get', 'Population_Density'],
    '#feebe2',
    24133.34, '#fbb4b9',
    48266.68, '#f768a1',
    72400.02, '#c51b8a',
    96533.36, '#7a0177'
];

    }

    if (variable === 'apartment') {

        expression = [
    'step',
    ['get', 'Apartments'],
    '#f1eef6',
    1173, '#d7b5d8',
    2346, '#df65b0',
    3519, '#dd1c77',
    4692, '#980043'
];

    }

    if (variable === 'single') {

       expression = [
    'step',
    ['get', 'Single_House'],
    '#edf8fb',
    188, '#b3cde3',
    376, '#8c96c6',
    564, '#8856a7',
    752, '#810f7c'
];

}

    map.setPaintProperty(
        'Toronto_DA-fill',
        'fill-color',
        expression
    );

updateLegend(variable);

//Highlighting the active variable button
    if (button) {
        const buttons = document.querySelectorAll('.var-button');

        buttons.forEach(btn => btn.classList.remove('active'));

        button.classList.add('active');
    }
}

function updateLegend(variable) {

    const legend = document.getElementById('legend');
    legend.innerHTML = ""; // clear previous legend

    // Added a dynamic title to correspond to selected legend variable
    const title = document.createElement('div');
    title.style.marginTop = '10px';
    title.style.marginBottom = '10px';

//Dynamic titles: added sub-heading providing more details on selected variable. Reduced text displayed on variable button
    if (variable === 'popden') {
        title.innerText = "Population Density (people / km²)";
    } else if (variable === 'apartment') {
        title.innerText = "Total occupied apartment and condo dwelling types";
    } else if (variable === 'single') {
        title.innerText = "Total occupied single-family dwelling types";
    }

    legend.appendChild(title);

    // Define colors and labels for legend
    let labels, colors;

    if (variable === 'popden') {
        labels = ['< 24k','24k – 48k','48k – 72k','72k – 96k','> 96k'];
        colors = ['#feebe2','#fbb4b9','#f768a1','#c51b8a','#7a0177'];
    } else if (variable === 'apartment') {
        labels = ['< 1100','1100 – 2300','2300 – 3500','3500 – 4600','> 4600'];
        colors = ['#f1eef6','#d7b5d8','#df65b0','#dd1c77','#980043'];
    } else if (variable === 'single') {
        labels = ['< 180','180 – 375','375 – 560','560 – 750','> 750'];
        colors = ['#edf8fb','#b3cde3','#8c96c6','#8856a7','#810f7c'];
    }

    // Add color boxes and labels
    for (let i = 0; i < labels.length; i++) {
        const item = document.createElement('div');

        const key = document.createElement('span');
        key.style.backgroundColor = colors[i];
        key.className = 'legend-key';

        const value = document.createElement('span');
        value.innerHTML = labels[i];

        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
    }
}