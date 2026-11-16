
let particles = [];

// PART 1: CREATE PARTICLES

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("sketch-container");

    for (let i = 0; i < 70; i++) {
        particles.push({
            x: random(width),
            y: random(height * 0.75),
            size: random(2, 6),
            speed: random(0.2, 0.8),
            opacity: random(100, 230)
        });
    }
}

// PART 2: ANIMATE PARTICLES

function draw() {
    clear();
    noStroke();

    for (let particle of particles) {
        fill(255, 245, 220, particle.opacity);

        circle(
            particle.x,
            particle.y,
            particle.size
        );

        particle.x -= particle.speed;

        if (particle.x < 0) {
            particle.x = width;
            particle.y = random(height * 0.75);
        }
    }
}

// PART 3: RESIZE CANVAS

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// PART 4: ANIMATE CITY BACKGROUND

const cityImage = new Image();
cityImage.src = "assets/images/city-background.png";

let cityOffset = 0;
let citySpeed = 0.6;

function animateCity() {
    const city = document.querySelector(".city");

    if (
        city &&
        cityImage.complete &&
        cityImage.naturalWidth > 0
    ) {
        const sceneHeight = city.clientHeight;

        const displayedWidth =
            cityImage.naturalWidth *
            (sceneHeight / cityImage.naturalHeight);

        cityOffset =
            (cityOffset + citySpeed) % displayedWidth;

        city.style.backgroundPosition =
            `${-cityOffset}px center`;
    }

    requestAnimationFrame(animateCity);
}

// START CITY ANIMATION
animateCity();
