// Add a small, fixed number of twinkling stars to the background.
const starField = document.querySelector("#stars");
const starFragment = document.createDocumentFragment();

for (let index = 0; index < 38; index += 1) {
    const star = document.createElement("span");
    star.className = "star";
    star.style.setProperty("--x", `${Math.random() * 100}%`);
    star.style.setProperty("--y", `${Math.random() * 100}%`);
    star.style.setProperty("--size", `${1 + Math.random() * 2}px`);
    star.style.setProperty("--duration", `${1.8 + Math.random() * 3.2}s`);
    star.style.setProperty("--delay", `${-Math.random() * 4}s`);
    starFragment.append(star);
}

starField.append(starFragment);

const card = document.querySelector("#greeting-card");
const openCardButton = document.querySelector("#open-card");
const closeCardButton = document.querySelector("#close-card");
const petalField = document.querySelector("#falling-petals");
const backgroundMusic = document.querySelector("#background-music");
backgroundMusic.loop = true;
const typewriterElements = [...card.querySelectorAll("[data-typewriter]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const originalText = typewriterElements.map((element) => element.textContent);
let petalInterval;
let typewriterTimeout;

const playBackgroundMusic = () => {
    if (!backgroundMusic.paused) return;
    if (backgroundMusic.currentTime === 0) backgroundMusic.currentTime = 10;
    const playPromise = backgroundMusic.play();
    if (playPromise) {
        playPromise.catch((error) => {
            console.warn("Không thể phát nhạc:", error);
        });
    }
};

// Keep adding petals while the card is open; each petal removes itself after falling.
const addFallingPetal = () => {
    const petal = document.createElement("span");
    petal.className = "falling-petal";
    petal.style.setProperty("--left", `${Math.random() * 100}%`);
    petal.style.setProperty("--size", `${9 + Math.random() * 10}px`);
    petal.style.setProperty("--duration", `${5 + Math.random() * 4}s`);
    petal.style.setProperty("--delay", `${Math.random() * 0.8}s`);
    petal.style.setProperty("--drift", `${Math.random() * 100 - 50}px`);
    petal.addEventListener("animationend", () => petal.remove(), { once: true });
    petalField.append(petal);
};

const startPetalRain = () => {
    window.clearInterval(petalInterval);
    petalField.replaceChildren();
    if (reducedMotion.matches) return;

    for (let index = 0; index < 8; index += 1) {
        addFallingPetal();
    }
    petalInterval = window.setInterval(addFallingPetal, 500);
};

// Reveal each heading and sentence one character at a time, from left to right.
const startTypewriter = () => {
    window.clearTimeout(typewriterTimeout);
    typewriterElements.forEach((element, index) => {
        element.textContent = reducedMotion.matches ? originalText[index] : "";
        element.setAttribute("aria-label", originalText[index]);
    });

    if (reducedMotion.matches) return;

    let elementIndex = 0;
    let characterIndex = 0;
    const typeNextCharacter = () => {
        if (elementIndex >= typewriterElements.length) return;

        const element = typewriterElements[elementIndex];
        const text = originalText[elementIndex];
        element.textContent = text.slice(0, characterIndex + 1);
        characterIndex += 1;

        if (characterIndex >= text.length) {
            elementIndex += 1;
            characterIndex = 0;
            typewriterTimeout = window.setTimeout(typeNextCharacter, 420);
            return;
        }

        typewriterTimeout = window.setTimeout(typeNextCharacter, 38);
    };

    typeNextCharacter();
};

const openCard = () => {
    card.hidden = false;
    playBackgroundMusic();
    startPetalRain();
    startTypewriter();
    closeCardButton.focus();
};

const closeCard = () => {
    card.hidden = true;
    window.clearInterval(petalInterval);
    window.clearTimeout(typewriterTimeout);
    petalField.replaceChildren();
    openCardButton.focus();
};

openCardButton.addEventListener("click", openCard);
closeCardButton.addEventListener("click", closeCard);
card.addEventListener("click", (event) => {
    if (event.target === card) closeCard();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !card.hidden) closeCard();
});
