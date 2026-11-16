
/* =========================================
   MIDNIGHT MIRAGE - DREAM PAGE
   Firebase version
========================================= */

/* =========================================
   PART 1: SOFT FALLING SNOWFLAKES
========================================= */

let snowflakes = [];

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("snow-container");

    for (let i = 0; i < 90; i++) {
        snowflakes.push({
            x: random(width),
            y: random(height),
            size: random(2, 6),
            speed: random(0.2, 0.7),
            drift: random(-0.2, 0.2),
            opacity: random(90, 210)
        });
    }
}

function draw() {
    clear();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    noStroke();

    for (let flake of snowflakes) {
        fill(255, 245, 225, flake.opacity);
        circle(flake.x, flake.y, flake.size);

        flake.y += flake.speed;
        flake.x += flake.drift;

        if (flake.y > height) {
            flake.y = -10;
            flake.x = random(width);
        }

        if (flake.x > width) flake.x = 0;
        if (flake.x < 0) flake.x = width;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

/* =========================================
   PART 2: GET HTML ELEMENTS
========================================= */

const writeButton = document.getElementById("write-button");
const letterOverlay = document.getElementById("writing-space");
const closeButton = document.getElementById("close-letter");
const thoughtInput = document.getElementById("thought-input");
const saveButton = document.getElementById("save-thought");
const letterStatus = document.getElementById("letter-status");

const privacyOptions = document.querySelectorAll(
    'input[name="privacy"]'
);

const privateOption = document.querySelector(
    'input[name="privacy"][value="private"]'
);

const publicOption = document.querySelector(
    'input[name="privacy"][value="public"]'
);

/* =========================================
   PART 3: PRIVATE SEAL ELEMENTS
========================================= */

const privateSealScene = document.getElementById(
    "private-seal-scene"
);

const letterScene = document.querySelector(
    ".letter-scene"
);

const writeAnotherButton = document.getElementById(
    "write-another-letter"
);

/* =========================================
   PART 4: ANIMATION SETTINGS
========================================= */

const OPEN_ANIMATION_TIME = 2900;
const SEND_ANIMATION_TIME = 3400;
const SEAL_ANIMATION_TIME = 4300;

let isSending = false;
let isSealing = false;
let isLetterOpen = false;
let isUploading = false;

let openTimer = null;
let sealTimer = null;

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

/* =========================================
   PART 5: RESET PRIVATE SEAL
========================================= */

function resetPrivateSeal() {
    clearTimeout(sealTimer);

    isSealing = false;

    if (privateSealScene) {
        privateSealScene.classList.remove(
            "playing",
            "finished"
        );
        privateSealScene.hidden = true;
    }

    if (letterScene) {
        letterScene.classList.remove("private-folding");
        letterScene.style.visibility = "";
        letterScene.style.pointerEvents = "";
    }

    closeButton.disabled = false;
}

/* =========================================
   PART 6: OPEN THE LETTER
========================================= */

function openLetter() {
    if (isSending || isSealing || isLetterOpen || isUploading) {
        return;
    }

    isLetterOpen = true;
    resetPrivateSeal();

    letterOverlay.hidden = false;
    letterOverlay.classList.remove("opening", "sending");

    void letterOverlay.offsetWidth;

    thoughtInput.disabled = true;
    saveButton.disabled = true;

    privateOption.checked = true;
    saveButton.textContent = "Keep My Letter ✦";
    letterStatus.textContent = "";

    document.body.style.overflow = "";
    document.body.style.overflow = "hidden";

    letterOverlay.classList.add("opening");

    clearTimeout(openTimer);

    openTimer = setTimeout(function () {
        if (isLetterOpen && !isSending && !isSealing) {
            thoughtInput.disabled = false;
            saveButton.disabled = false;
            thoughtInput.focus();
        }
    }, reducedMotion ? 50 : OPEN_ANIMATION_TIME);
}

writeButton.addEventListener("click", openLetter);

/* =========================================
   PART 7: CLOSE THE LETTER
========================================= */

function closeLetter() {
    if (isSending || isSealing || isUploading) {
        return;
    }

    clearTimeout(openTimer);
    clearTimeout(sealTimer);

    isLetterOpen = false;
    letterOverlay.hidden = true;

    letterOverlay.classList.remove(
        "opening",
        "sending"
    );

    resetPrivateSeal();

    document.body.style.overflow = "";
    writeButton.focus();
}

closeButton.addEventListener("click", closeLetter);

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        isLetterOpen &&
        !isSending &&
        !isSealing &&
        !isUploading
    ) {
        closeLetter();
    }
});

/* =========================================
   PART 8: PRIVACY OPTIONS
========================================= */

privacyOptions.forEach(function (option) {
    option.addEventListener("change", function () {
        if (publicOption.checked) {
            saveButton.textContent =
                "Send to the Night Sky ✦";
        } else {
            saveButton.textContent =
                "Keep My Letter ✦";
        }

        letterStatus.textContent = "";
    });
});

/* =========================================
   PART 9: SAVE PRIVATE LETTER
========================================= */

function savePrivateLetter(thought) {
    try {
        const storedLetters = JSON.parse(
            localStorage.getItem(
                "midnightPrivateLetters"
            ) || "[]"
        );

        if (!Array.isArray(storedLetters)) {
            throw new Error("Invalid saved data");
        }

        storedLetters.push({
            text: thought,
            date: new Date().toISOString()
        });

        localStorage.setItem(
            "midnightPrivateLetters",
            JSON.stringify(storedLetters)
        );

        thoughtInput.value = "";
        return true;

    } catch (error) {
        console.error(
            "Unable to save private letter:",
            error
        );

        letterStatus.textContent =
            "Could not save your letter. Please copy your text and try again.";

        return false;
    }
}

/* =========================================
   PART 10: FIREBASE CONFIGURATION
========================================= */

const firebaseConfig = {
    apiKey: "AIzaSyC7sfGNbNyrAxHJcOfkWLXPRX2XCJzOmAE",
    authDomain: "midnight-mirage-7f838.firebaseapp.com",
    projectId: "midnight-mirage-7f838",
    storageBucket: "midnight-mirage-7f838.firebasestorage.app",
    messagingSenderId: "837544249785",
    appId: "1:837544249785:web:9f24808b2b9eff04350e68",
    measurementId: "G-6BC0GKLSSN"
};

/* =========================================
   PART 11: SAVE SHARED LETTER TO FIREBASE
========================================= */

async function saveSharedLetter(thought) {
    try {
        const { initializeApp, getApps, getApp } =
            await import(
                "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js"
            );

        const {
            getFirestore,
            collection,
            addDoc,
            serverTimestamp
        } = await import(
            "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js"
        );

        const app = getApps().length
            ? getApp()
            : initializeApp(firebaseConfig);

        const db = getFirestore(app);

        await addDoc(
            collection(db, "publicLetters"),
            {
                text: thought,
                createdAt: serverTimestamp()
            }
        );

        return true;

    } catch (error) {
        console.error(
            "Firebase upload failed:",
            error
        );

        letterStatus.textContent =
            "Could not send your letter. Please check your connection and try again.";

        return false;
    }
}

/* =========================================
   PART 12: PRIVATE LETTER SEAL ANIMATION
========================================= */

function sealPrivateLetter() {
    if (isSealing || isSending) {
        return;
    }

    if (!privateSealScene || !letterScene) {
        letterStatus.textContent =
            "Your letter was saved privately in this browser ✦";
        return;
    }

    isSealing = true;

    clearTimeout(openTimer);

    thoughtInput.disabled = true;
    saveButton.disabled = true;
    closeButton.disabled = true;

    privateSealScene.hidden = false;

    privateSealScene.classList.remove(
        "playing",
        "finished"
    );

    letterScene.classList.add("private-folding");

    void privateSealScene.offsetWidth;

    privateSealScene.classList.add("playing");

    setTimeout(function () {
        if (isSealing) {
            letterScene.style.visibility = "hidden";
            letterScene.style.pointerEvents = "none";
        }
    }, reducedMotion ? 0 : 650);

    sealTimer = setTimeout(function () {
        privateSealScene.classList.add("finished");

        isSealing = false;
        closeButton.disabled = false;

        if (writeAnotherButton) {
            writeAnotherButton.focus();
        }
    }, reducedMotion ? 100 : SEAL_ANIMATION_TIME);
}

/* =========================================
   PART 13: WRITE ANOTHER LETTER
========================================= */

function writeAnotherLetter() {
    if (isSending || isSealing || isUploading) {
        return;
    }

    clearTimeout(openTimer);
    clearTimeout(sealTimer);

    resetPrivateSeal();

    letterOverlay.classList.remove(
        "opening",
        "sending"
    );

    thoughtInput.value = "";
    privateOption.checked = true;

    saveButton.textContent = "Keep My Letter ✦";
    letterStatus.textContent = "";

    thoughtInput.disabled = true;
    saveButton.disabled = true;

    void letterOverlay.offsetWidth;

    letterOverlay.classList.add("opening");

    openTimer = setTimeout(function () {
        if (isLetterOpen && !isSending && !isSealing) {
            thoughtInput.disabled = false;
            saveButton.disabled = false;
            thoughtInput.focus();
        }
    }, reducedMotion ? 50 : OPEN_ANIMATION_TIME);
}

if (writeAnotherButton) {
    writeAnotherButton.addEventListener(
        "click",
        writeAnotherLetter
    );
}

/* =========================================
   PART 14: PAPER AIRPLANE TRANSITION
========================================= */

function sendLetterToSky() {
    if (isSending || isSealing) {
        return;
    }

    isSending = true;

    thoughtInput.disabled = true;
    saveButton.disabled = true;
    closeButton.disabled = true;

    letterOverlay.classList.remove("sending");

    void letterOverlay.offsetWidth;

    // Keep the original paper airplane animation.
    letterOverlay.classList.add("sending");

    setTimeout(function () {
        window.location.href = "sky.html";
    }, reducedMotion ? 300 : SEND_ANIMATION_TIME);
}

/* =========================================
   PART 15: SAVE OR SHARE BUTTON
========================================= */

saveButton.addEventListener("click", async function () {
    if (
        isSending ||
        isSealing ||
        isUploading ||
        saveButton.disabled
    ) {
        return;
    }

    const thought = thoughtInput.value.trim();

    if (thought === "") {
        letterStatus.textContent =
            "Write a little something first ✦";

        thoughtInput.focus();
        return;
    }

    // OPTION 1: KEEP PRIVATE
    if (privateOption.checked) {
        const saved = savePrivateLetter(thought);

        if (!saved) {
            return;
        }

        sealPrivateLetter();
        return;
    }

    // OPTION 2: SHARE ANONYMOUSLY
    if (publicOption.checked) {
        if (thought.length > 1000) {
            letterStatus.textContent =
                "Please keep your letter within 1000 characters.";
            return;
        }

        const confirmed = window.confirm(
            "Release this thought into the night sky?\n\n" +
            "Your name will not appear.\n\n" +
            "Your letter will be publicly visible to everyone visiting the night sky."
        );

        if (!confirmed) {
            return;
        }

        isUploading = true;
        saveButton.disabled = true;
        closeButton.disabled = true;

        privacyOptions.forEach(function (option) {
            option.disabled = true;
        });

        letterStatus.textContent =
            "Sending your letter to the night sky...";

        const saved = await saveSharedLetter(thought);

        isUploading = false;

        if (!saved) {
            saveButton.disabled = false;
            closeButton.disabled = false;

            privacyOptions.forEach(function (option) {
                option.disabled = false;
            });

            return;
        }

        letterStatus.textContent =
            "Your letter has reached the night sky ✦";

        sendLetterToSky();
    }
});
