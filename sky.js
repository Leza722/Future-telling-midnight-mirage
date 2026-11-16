
/* =========================================
   MIDNIGHT MIRAGE — THE NIGHT SKY
   Complete JavaScript
   ========================================= */

// 1. HTML ELEMENTS

const starField = document.getElementById("sky-stars");
const counter = document.getElementById("sky-counter");

const modal = document.getElementById("letter-modal");
const closeButton = document.getElementById("modal-close");
const backdrop = document.getElementById("modal-backdrop");

const modalTitle = document.getElementById("modal-title");
const paperLabel = document.getElementById("paper-label");
const paperText = document.getElementById("paper-text");
const paperDate = document.getElementById("paper-date");

let lastFocusedStar = null;
let letterStars = [];


// 2. FICTIONAL SAMPLE LETTERS

const sampleLetters = [
    {
        text: "Some nights, I wish I could tell my younger self that growing up doesn't mean having everything figured out.",
        date: "",
        sample: true
    },
    {
        text: "Today was difficult. But I saw the moon on my way home, and for a moment the world felt gentle again.",
        date: "",
        sample: true
    },
    {
        text: "I hope the person reading this remembers to be kind to themselves. You're doing better than you think.",
        date: "",
        sample: true
    },
    {
        text: "There are so many things I haven't said. Maybe the stars can hold them until I'm ready.",
        date: "",
        sample: true
    },
    {
        text: "I miss the version of us that laughed at everything. I hope you're happy, wherever you are.",
        date: "",
        sample: true
    }
];


// 3. LOAD SHARED LETTERS

function loadSharedLetters() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("midnightSharedLetters") || "[]"
        );

        if (!Array.isArray(saved)) return [];

        return saved
            .filter(item =>
                item &&
                typeof item.text === "string" &&
                item.text.trim().length > 0
            )
            .map(item => ({
                text: item.text,
                date: item.date || "",
                sample: false
            }));

    } catch (error) {
        console.warn("Could not load letters:", error);
        return [];
    }
}


// 4. REPEATABLE RANDOM NUMBERS

let seed = 28741;

function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
}


// 5. CREATE STAR HALO

function createHalo(star, size) {
    const halo = document.createElement("span");

    halo.className = "proximity-halo";

    if (star.classList.contains("sample")) {
        halo.classList.add("pink-halo");
    }

    halo.style.left = star.style.left;
    halo.style.top = star.style.top;
    halo.style.width = `${size * 3.5}px`;
    halo.style.height = `${size * 3.5}px`;
    halo.style.opacity = "0";

    starField.appendChild(halo);
    star._halo = halo;
}


// 6. CREATE A STAR

function makeStar(x, y, size, decorative, letter, index) {
    const star = document.createElement(
        decorative ? "span" : "button"
    );

    star.className = decorative
        ? "star decorative"
        : "star letter-star";

    if (letter && letter.sample) {
        star.classList.add("sample");
    }

    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.setProperty("--size", `${size}px`);

    star.style.setProperty(
        "--alpha",
        String(0.3 + random() * 0.5)
    );

    star.style.setProperty(
        "--duration",
        `${3 + random() * 4}s`
    );

    star.style.setProperty(
        "--delay",
        `${-random() * 5}s`
    );

    if (decorative) {
        star.setAttribute("aria-hidden", "true");
    } else {
        star.type = "button";

        star.setAttribute(
            "aria-label",
            `${letter.sample ? "Sample story" : "Anonymous letter"} ${index + 1}. Open letter`
        );

        star.title = letter.sample
            ? "Click to read a sample story"
            : "Click to read an anonymous letter";

        star.addEventListener("click", () => {
            openLetter(letter, star);
        });
    }

    starField.appendChild(star);

    if (!decorative) {
        createHalo(star, size);
        letterStars.push(star);
    }

    return star;
}


// 7. CHECK WHETHER A POSITION IS SAFE


function isSafePosition(x, y, size, decorative = false) {
    const field = starField.getBoundingClientRect();

    if (field.width === 0 || field.height === 0) {
        return false;
    }

    const px = field.left + field.width * x / 100;
    const py = field.top + field.height * y / 100;

    const padding = decorative ? 8 : 28;

    const blockers = document.querySelectorAll(
        ".sky-header, .sky-counter, .sky-ending, " +
        ".star-guide, .sky-navigation"
    );

    for (const element of blockers) {
        const rect = element.getBoundingClientRect();

        if (
            px + size / 2 + padding > rect.left &&
            px - size / 2 - padding < rect.right &&
            py + size / 2 + padding > rect.top &&
            py - size / 2 - padding < rect.bottom
        ) {
            return false;
        }
    }

    // Prevent letter stars from overlapping
    if (!decorative) {
        for (const star of letterStars) {
            const rect = star.getBoundingClientRect();

            const sx = rect.left + rect.width / 2;
            const sy = rect.top + rect.height / 2;

            if (
                Math.hypot(px - sx, py - sy) <
                size / 2 + rect.width / 2 + 24
            ) {
                return false;
            }
        }
    }

    return true;
}



// 8. FIND A SAFE POSITION


/* =========================================
   FIND SAFE STAR POSITIONS
   ========================================= */


function findSafePosition(size, decorative = false) {
    const field = starField.getBoundingClientRect();

    if (field.width === 0 || field.height === 0) {
        return null;
    }

    for (let attempt = 0; attempt < 1000; attempt++) {
        const x = 5 + random() * 90;
        const y = 15 + random() * 65;

        if (isSafePosition(x, y, size, decorative)) {
            return [x, y];
        }
    }

    return null;
}






// 10. MOUSE PROXIMITY GLOW

const glowDistance = 160;

function updateStarGlow(mouseX, mouseY) {
    if (modal && !modal.hidden) return;

    letterStars.forEach(star => {
        const rect = star.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distance = Math.hypot(
            mouseX - centerX,
            mouseY - centerY
        );

        const proximity = Math.max(
            0,
            1 - distance / glowDistance
        );

        star.style.setProperty(
            "--proximity",
            proximity.toFixed(3)
        );

        star.classList.toggle(
            "nearby",
            proximity > 0
        );

        if (star._halo) {
            star._halo.style.opacity =
                proximity.toFixed(3);
        }
    });
}

function resetStarGlow() {
    letterStars.forEach(star => {
        star.style.setProperty("--proximity", "0");
        star.classList.remove("nearby");

        if (star._halo) {
            star._halo.style.opacity = "0";
        }
    });
}

document.addEventListener("mousemove", event => {
    updateStarGlow(event.clientX, event.clientY);
});

document.addEventListener("mouseout", event => {
    if (event.relatedTarget === null) {
        resetStarGlow();
    }
});


// 11. OPEN LETTER POPUP

function openLetter(letter, star) {
    if (!modal) return;

    lastFocusedStar = star;

    paperLabel.textContent = letter.sample
        ? "FICTIONAL SAMPLE STORY"
        : "AN ANONYMOUS LETTER";

    modalTitle.textContent = letter.sample
        ? "Dear Midnight..."
        : "Dear Stranger...";

    paperText.textContent = letter.text;

    if (letter.sample) {
        paperDate.textContent =
            "A sample story for this dream world";

    } else if (
        letter.date &&
        !Number.isNaN(new Date(letter.date).getTime())
    ) {
        paperDate.textContent =
            new Date(letter.date).toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

    } else {
        paperDate.textContent = "Sent into the night";
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";

    resetStarGlow();
    closeButton.focus();
}


// 12. CLOSE LETTER POPUP

function closeLetter() {
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    document.body.style.overflow = "";

    if (
        lastFocusedStar &&
        lastFocusedStar.isConnected
    ) {
        lastFocusedStar.focus();
    }
}

if (closeButton) {
    closeButton.addEventListener("click", closeLetter);
}

if (backdrop) {
    backdrop.addEventListener("click", closeLetter);
}

document.addEventListener("keydown", event => {
    if (!modal || modal.hidden) return;

    if (event.key === "Escape") {
        closeLetter();
    }

    if (event.key === "Tab") {
        event.preventDefault();
        closeButton.focus();
    }
});


// 13. FLOATING SNOW

function createFloatingSnow() {
    const sky = document.querySelector(".sky-world");

    if (!sky) return;

    const oldSnow = sky.querySelector(".snow-container");

    if (oldSnow) {
        oldSnow.remove();
    }

    const snowContainer = document.createElement("div");

    snowContainer.className = "snow-container";
    snowContainer.setAttribute("aria-hidden", "true");

    sky.appendChild(snowContainer);

    // Soft, gentle snowfall
    const snowCount = 45;

    for (let i = 0; i < snowCount; i++) {
        const snowflake = document.createElement("span");

        snowflake.className = "snowflake";

        const size = 1.5 + Math.random() * 4;
        const duration = 20 + Math.random() * 20;
        const delay = -Math.random() * duration;
        const drift = -40 + Math.random() * 80;
        const opacity = 0.3 + Math.random() * 0.6;

        snowflake.style.setProperty(
            "--snow-x",
            `${Math.random() * 100}%`
        );

        snowflake.style.setProperty(
            "--snow-size",
            `${size}px`
        );

        snowflake.style.setProperty(
            "--snow-duration",
            `${duration}s`
        );

        snowflake.style.setProperty(
            "--snow-delay",
            `${delay}s`
        );

        snowflake.style.setProperty(
            "--snow-drift",
            `${drift}px`
        );

        snowflake.style.setProperty(
            "--snow-opacity",
            opacity
        );

        snowflake.style.setProperty(
            "--snow-static-y",
            `${Math.random() * 100}%`
        );

        snowContainer.appendChild(snowflake);
    }
}


// 14. INITIALIZE AND RESIZE


/* =========================================
   EXPANDING NIGHT SKY
   ========================================= */

function buildSky() {
    if (!starField) return;

    const skyWorld = document.querySelector(".sky-world");

    if (!skyWorld) return;

    starField.replaceChildren();
    letterStars = [];
    seed = 28741;

    const shared = loadSharedLetters();

    const letters = [
        ...shared,
        ...sampleLetters
    ];

    const totalLetters = letters.length;

    // =====================================
    // 1. AUTOMATIC PAGE HEIGHT
    // =====================================

    // Up to 12 letters: normal page height.
    // Every 8 additional letters adds 350px.

    const extraLetters = Math.max(
        0,
        totalLetters - 12
    );

    const extraSections = Math.ceil(
        extraLetters / 8
    );

    const extraHeight = extraSections * 350;

    const baseHeight = Math.max(
        window.innerHeight,
        850
    );

    const totalHeight = baseHeight + extraHeight;

    skyWorld.style.minHeight = `${totalHeight}px`;

    // =====================================
    // 2. UPDATE LETTER COUNTER
    // =====================================

    if (counter) {
        const number = shared.length;

        counter.textContent = number === 0
            ? "The sky is waiting for its first shared letter ✧"
            : `${number} ${number === 1 ? "letter has" : "letters have"} reached this sky ✧`;
    }

    // =====================================
    // 3. DISTRIBUTE INTERACTIVE STARS
    // =====================================

    letters.forEach((letter, index) => {

        const size = 20 + random() * 18;

        // Divide the sky into vertical sections.
        // This prevents all stars from clustering
        // near the top or bottom.

        const totalBands = Math.max(
            3,
            Math.ceil(totalLetters / 5)
        );

        const bandIndex = index % totalBands;

        const bandStart = bandIndex / totalBands;
        const bandEnd = (bandIndex + 1) / totalBands;

       let position = findSafePosition(size, false);

        // If a section is crowded,
        // search the rest of the sky.
        if (!position) {
            position = findSafePosition(size, false);
        }

        if (!position) {
            console.warn(
                "Could not place letter star:",
                index + 1
            );
            return;
        }

        makeStar(
            position[0],
            position[1],
            size,
            false,
            letter,
            index
        );
    });

    // =====================================
    // 4. SMALL DECORATIVE STARS
    // =====================================

    const decorativeCount = Math.min(
        200,
        90 + extraSections * 18
    );

    for (let i = 0; i < decorativeCount; i++) {

        const size = 1.2 + random() * 3.2;

        const position = findSafePosition(
            size,
            true
        );

        if (!position) continue;

        makeStar(
            position[0],
            position[1],
            size,
            true,
            null,
            i
        );
    }
}

/* =========================================
   INITIALIZE THE NIGHT SKY
   ========================================= */

function initializeSky() {
    if (!starField) {
        console.error("Cannot find #sky-stars in sky.html");
        return;
    }

    buildSky();
    createFloatingSnow();

    console.log(
        "Midnight Mirage initialized:",
        document.querySelectorAll(".star.letter-star").length,
        "interactive stars created"
    );
}


let resizeTimer = null;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
        buildSky();
    }, 200);
});

// Wait until layout is ready before placing stars
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        () => requestAnimationFrame(initializeSky),
        { once: true }
    );
} else {
    requestAnimationFrame(initializeSky);
}

// Recalculate after web fonts finish loading
if (document.fonts) {
    document.fonts.ready.then(() => {
        if (starField) buildSky();
    });
}
