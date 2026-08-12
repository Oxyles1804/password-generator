const passwordInput = document.getElementById("password");
const generateButton = document.getElementById("generate-button");
const copyButton = document.getElementById("copy-button");
const lengthInput = document.getElementById("length");
const lengthValue = document.getElementById("length-value");

const strengthText = document.getElementById("strength-text");
const strengthFill = document.getElementById("strength-fill");

const lowercaseCheckbox = document.getElementById("lowercase");
const uppercaseCheckbox = document.getElementById("uppercase");
const numbersCheckbox = document.getElementById("numbers");
const symbolsCheckbox = document.getElementById("symbols");

const testPasswordInput = document.getElementById("test-password");
const testStrengthText = document.getElementById("test-strength-text");
const testStrengthFill = document.getElementById("test-strength-fill");

const feedbackList = document.getElementById("feedback-list");

const CHARACTERS = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};


generateButton.addEventListener("click", generatePassword);
copyButton.addEventListener("click", copyPassword);

lengthInput.addEventListener("input", updateLength);
lengthInput.addEventListener("input", generatePassword);

lowercaseCheckbox.addEventListener("change", generatePassword);
uppercaseCheckbox.addEventListener("change", generatePassword);
numbersCheckbox.addEventListener("change", generatePassword);
symbolsCheckbox.addEventListener("change", generatePassword);

testPasswordInput.addEventListener("input", updateTestStrength);


function getRandomCharacter(characters) {

    const max =
        Math.floor(0x100000000 / characters.length)
        * characters.length;

    const randomArray = new Uint32Array(1);

    do {
        crypto.getRandomValues(randomArray);
    } while (randomArray[0] >= max);

    const index = randomArray[0] % characters.length;

    return characters[index];
}


function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const randomArray = new Uint32Array(1);

        crypto.getRandomValues(randomArray);

        const j = randomArray[0] % (i + 1);

        [array[i], array[j]] = [array[j], array[i]];
    }

}


function getSelectedCharacters() {

    let characters = "";

    if (lowercaseCheckbox.checked) {
        characters += CHARACTERS.lowercase;
    }

    if (uppercaseCheckbox.checked) {
        characters += CHARACTERS.uppercase;
    }

    if (numbersCheckbox.checked) {
        characters += CHARACTERS.numbers;
    }

    if (symbolsCheckbox.checked) {
        characters += CHARACTERS.symbols;
    }

    return characters;
}


function getRequiredCharacters() {

    let requiredCharacters = [];

    if (lowercaseCheckbox.checked) {
        requiredCharacters.push(
            getRandomCharacter(CHARACTERS.lowercase)
        );
    }

    if (uppercaseCheckbox.checked) {
        requiredCharacters.push(
            getRandomCharacter(CHARACTERS.uppercase)
        );
    }

    if (numbersCheckbox.checked) {
        requiredCharacters.push(
            getRandomCharacter(CHARACTERS.numbers)
        );
    }

    if (symbolsCheckbox.checked) {
        requiredCharacters.push(
            getRandomCharacter(CHARACTERS.symbols)
        );
    }

    return requiredCharacters;
}


function generatePassword() {

    const length = Number(lengthInput.value);

    if (length < 4 || length > 64) {
        alert("La longueur doit être comprise entre 4 et 64.");
        return;
    }

    const characters = getSelectedCharacters();

    if (characters.length === 0) {
        alert("Sélectionnez au moins une option.");
        return;
    }

    let passwordCharacters = getRequiredCharacters();

    if (length < passwordCharacters.length) {
        alert("La longueur est trop courte pour les options sélectionnées.");
        return;
    }

    while (passwordCharacters.length < length) {

        passwordCharacters.push(
            getRandomCharacter(characters)
        );

    }

    shuffle(passwordCharacters);

    const password = passwordCharacters.join("");

    passwordInput.value = password;

    updateStrength(password);
}


async function copyPassword() {

    if (passwordInput.value === "") {
        return;
    }

    await navigator.clipboard.writeText(passwordInput.value);

    copyButton.textContent = "Copié !";

    setTimeout(() => {
        copyButton.textContent = "Copier";
    }, 1000);

}

function updateLength() {

    lengthValue.textContent = lengthInput.value;

}


function calculateStrength(password) {

    let score = 0;

    if (password.length >= 8) {
        score++;
    }

    if (password.length >= 12) {
        score++;
    }

    if (/[a-z]/.test(password)) {
        score++;
    }

    if (/[A-Z]/.test(password)) {
        score++;
    }

    if (/[0-9]/.test(password)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
    }

    if (hasRepeatedCharacters(password)) {
        score--;
    }

    if (hasSequentialCharacters(password)) {
        score--;
    }

    return Math.max(score, 0);
}

function updateStrength(password) {

    const info = getStrengthInfo(password);

    strengthText.textContent = info.text;
    strengthText.style.color = info.color;

    strengthFill.style.width = `${info.percentage}%`;
    strengthFill.style.backgroundColor = info.color;
}


function hasRepeatedCharacters(password) {

    for (let i = 0; i < password.length - 2; i++) {

        if (
            password[i] === password[i + 1] &&
            password[i] === password[i + 2]
        ) {
            return true;
        }

    }

    return false;
}


function hasSequentialCharacters(password) {

    const sequence = password.toLowerCase();

    for (let i = 0; i < sequence.length - 2; i++) {

        const first = sequence.charCodeAt(i);
        const second = sequence.charCodeAt(i + 1);
        const third = sequence.charCodeAt(i + 2);

        if (
            second === first + 1 &&
            third === second + 1
        ) {
            return true;
        }

        if (
            second === first - 1 &&
            third === second - 1
        ) {
            return true;
        }
    }

    return false;
}



function updateTestStrength() {

    const password = testPasswordInput.value;

    if (password === "") {

        testStrengthText.textContent = "-";
        testStrengthText.style.color = "";

        testStrengthFill.style.width = "0%";

        feedbackList.innerHTML = "";

        return;
    }

    const info = getStrengthInfo(password);

    testStrengthText.textContent = info.text;
    testStrengthText.style.color = info.color;

    testStrengthFill.style.width = `${info.percentage}%`;
    testStrengthFill.style.backgroundColor = info.color;

    const feedback = analyzePassword(password);

    feedbackList.innerHTML = "";

    feedback.forEach(message => {

        const item = document.createElement("li");

        item.textContent = message;

        feedbackList.appendChild(item);

    });
}


function getStrengthInfo(password) {

    const score = calculateStrength(password);

    if (score <= 2) {

        return {
            score: score,
            text: "Faible",
            percentage: 25,
            color: "#ef4444"
        };

    } else if (score <= 4) {

        return {
            score: score,
            text: "Moyenne",
            percentage: 50,
            color: "#f97316"
        };

    } else if (score === 5) {

        return {
            score: score,
            text: "Forte",
            percentage: 75,
            color: "#eab308"
        };

    } else {

        return {
            score: score,
            text: "Très forte",
            percentage: 100,
            color: "#22c55e"
        };
    }
}


function analyzePassword(password) {

    const feedback = [];

    if (password.length < 8) {
        feedback.push("❌ Le mot de passe est trop court.");
    } else {
        feedback.push("✓ Bonne longueur.");
    }

    if (/[a-z]/.test(password)) {
        feedback.push("✓ Contient des minuscules.");
    } else {
        feedback.push("❌ Ajoutez des lettres minuscules.");
    }

    if (/[A-Z]/.test(password)) {
        feedback.push("✓ Contient des majuscules.");
    } else {
        feedback.push("❌ Ajoutez des lettres majuscules.");
    }

    if (/[0-9]/.test(password)) {
        feedback.push("✓ Contient des chiffres.");
    } else {
        feedback.push("❌ Ajoutez des chiffres.");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        feedback.push("✓ Contient des caractères spéciaux.");
    } else {
        feedback.push("❌ Ajoutez des caractères spéciaux.");
    }

    if (hasRepeatedCharacters(password)) {
        feedback.push("❌ Évitez les caractères répétés.");
    }

    if (hasSequentialCharacters(password)) {
        feedback.push("❌ Évitez les suites de caractères.");
    }

    return feedback;
}