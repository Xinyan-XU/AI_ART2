let imageModelURL = 'https://teachablemachine.withgoogle.com/models/4OqCfHj6B/';

let classifier;
let video;
let canvas;
let label = "Take a picture of your surrounding to start the experience";
let results = [];
let isPictureTaken = false;
let capturedImage;
let geolocation = { latitude: null, longitude: null };
let capturedImageDataURL;
let map;
let locationIcon;

let takepic = document.getElementById('takepic');
let retakepic = document.getElementById('retake');
let supermkton = document.getElementById('supermkt');
let gason = document.getElementById('gas');
let trafficon = document.getElementById('traffic');
let subwayon = document.getElementById('subway');

function preload() {
    ml5.setBackend("webgl");
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');

    supermarketSound = loadSound('./sound/supermarket2.mp3');
    supermarketAmbientSound = loadSound('./sound/supermarket.mp3');
    gasStationSound = loadSound('./sound/gasstation2.mp3');
    gasStationAmbientSound = loadSound('./sound/gasstation.mp3');
    trafficLightSound = loadSound('./sound/trafficlight2.mp3');
    trafficLightAmbientSound = loadSound('./sound/trafficlight.mp3');
    subwaySound = loadSound('./sound/subway2.mp3');
    subwayAmbientSound = loadSound('./sound/subway.mp3');
}

function setup() {
    canvas = createCanvas(640, 480);
    canvas.parent('p5-container');
    background(255);

    video = createCapture(VIDEO, { flipped: true });
    video.size(640, 480);
    video.hide();

    takepic.addEventListener('click', function () {
        takePicture();
    });
    retakepic.addEventListener('click', function () {
        retakePicture();
    });
    hideElementById('retake');

    initializeMap();
}

function draw() {
    background(100);

    if (!isPictureTaken) {
        image(video, 0, 0);
    } else {
        image(capturedImage, 0, 0);
        pixelateImage(capturedImage, 20);
        displayResults();
    }

    textSize(20);
    textAlign(CENTER, CENTER);
    textStyle(BOLDITALIC);
    fill(0, 255, 0);
    text(label, width / 2, height / 2);

    if (geolocation.latitude !== null && geolocation.longitude !== null) {
        textSize(30);
        textAlign(CENTER, CENTER);
        text(`${geolocation.latitude.toFixed(10)}, ${geolocation.longitude.toFixed(10)}`, width / 2, height / 2 + 40);
    }
}

// visuals
function takePicture() {
    capturedImage = createImage(video.width, video.height);
    capturedImage.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);
    capturedImage.loadPixels();
    capturedImageDataURL = capturedImage.canvas.toDataURL();
    isPictureTaken = true;

    hideElementById('takepic');
    showElementById('retake');
    getGeolocation();
}

function retakePicture() {
    isPictureTaken = false;
    label = "Take a picture of your surrounding to start the experience";
    results = [];
    geolocation = { latitude: null, longitude: null };

    showElementById('takepic');
    hideElementById('retake');

    supermkton.src = './img/supermkt.png';
    gason.src = './img/gas.png';
    trafficon.src = './img/traffic.png';
    subwayon.src = './img/subway.png';

    stopAllAmbientSounds();
}

function gotResult(output) {
    label = output[0].label;
    results = output;
    playAmbientSound();
}

function displayResults() {
    textSize(30);
    textAlign(CENTER, CENTER);
    textStyle(BOLDITALIC);
    fill(0, 255, 0);

    //  for (let i = 0; i < results.length; i++) {
    //     text(results[i].label, 10, 100 + i * 35);
    //     text(results[i].confidence, 10, 100 + i * 35 + 15);
    // }
}

function pixelateImage(img, gridSize) {
    img.loadPixels();

    for (let y = 0; y < img.height; y += gridSize) {
        for (let x = 0; x < img.width; x += gridSize) {
            let index = 4 * (x + y * img.width);
            let r = img.pixels[index + 0];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];
            let a = img.pixels[index + 3];

            for (let dy = 0; dy < gridSize; dy++) {
                for (let dx = 0; dx < gridSize; dx++) {
                    let pxIndex = 4 * ((x + dx) + (y + dy) * img.width);
                    img.pixels[pxIndex + 0] = r;
                    img.pixels[pxIndex + 1] = g;
                    img.pixels[pxIndex + 2] = b;
                    img.pixels[pxIndex + 3] = a;
                }
            }
        }
    }
    img.updatePixels();
}

// sound
function playAmbientSound() {
    if (label == "Supermarket" && !supermarketAmbientSound.isPlaying()) {
        setTimeout(() => {
            supermarketSound.play();
        }, 3000);
        supermarketAmbientSound.setVolume(0.5);
        supermarketAmbientSound.play();
        supermkton.src = './img/supermkt_on.png';
    } else if (label == "GasStation" && !gasStationAmbientSound.isPlaying()) {
        setTimeout(() => {
            gasStationSound.play();
        }, 3000);
        gasStationAmbientSound.setVolume(0.5);
        gasStationAmbientSound.play();
        gason.src = './img/gas_on.png';
    } else if (label == "TrafficLight" && !trafficLightAmbientSound.isPlaying()) {
        setTimeout(() => {
            trafficLightSound.play();
        }, 3000);
        trafficLightAmbientSound.setVolume(0.5);
        trafficLightAmbientSound.play();
        trafficon.src = './img/traffic_on.png';
    } else if (label == "Subway" && !subwayAmbientSound.isPlaying()) {
        setTimeout(() => {
            subwaySound.play();
        }, 3000);
        subwayAmbientSound.setVolume(0.5);
        subwayAmbientSound.play();
        subwayon.src = './img/subway_on.png';

    }
}

// geolocations
function stopAllAmbientSounds() {
    supermarketAmbientSound.stop();
    gasStationAmbientSound.stop();
    trafficLightAmbientSound.stop();
    subwayAmbientSound.stop();
    supermarketSound.stop();
    gasStationSound.stop();
    trafficLightSound.stop();
    subwaySound.stop();
}

function getGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            geolocation.latitude = position.coords.latitude;
            geolocation.longitude = position.coords.longitude;
            classifier.classify(capturedImage, gotResult);
            addMarkerToMap();
        }, (error) => {
            console.error('Error', error);
            classifier.classify(capturedImage, gotResult);
            addMarkerToMap();
        });
    } else {
        console.error('Geolocation is not supported by this browser. Please allow Geolocation in the browser.');
        classifier.classify(capturedImage, gotResult);
        addMarkerToMap();
    }
}

function initializeMap() {
    map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    locationIcon = L.icon({
        iconUrl: './img/location3.png',
        iconSize: [100, 100],
        iconAnchor: [50, 100],
        popupAnchor: [0, -70]
    });
}

function addMarkerToMap() {
    let marker = L.marker([geolocation.latitude, geolocation.longitude], { icon: locationIcon }).addTo(map);
    let imgElement = document.createElement('img');
    imgElement.src = capturedImageDataURL;
    imgElement.width = 200;
    marker.bindPopup(imgElement).openPopup();
    map.setView([geolocation.latitude, geolocation.longitude], 15);
}

function hideElementById(id) {
    document.getElementById(id).style.display = 'none';
}

function showElementById(id) {
    document.getElementById(id).style.display = 'block';
}