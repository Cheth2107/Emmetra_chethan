document.addEventListener('DOMContentLoaded', () => {
    const analogClock = document.querySelector('.analog');
    const digitalClock = document.querySelector('.digital');
    const hourHand = document.querySelector('.hour');
    const minuteHand = document.querySelector('.minute');
    const secondHand = document.querySelector('.second');
    const digitalTime = document.getElementById('digital-time');
    const analogBtn = document.getElementById('analog-btn');
    const digitalBtn = document.getElementById('digital-btn');
    const startBtn = document.getElementById('start-btn');
    const mainScreen = document.getElementById('main-screen');
    const attemptsBar = document.getElementById('attempts-left');
    const optionsContainer = document.getElementById('options-container');
    const backgroundImageUpload = document.getElementById('background-image-upload');
    const colorPicker = document.getElementById('color-picker');
    const bulbIcon = document.getElementById('bulb-icon');
    const puzzleScreen = document.getElementById('puzzle-screen');
    const puzzleQuestion = document.getElementById('puzzle-question');
    const puzzleOptions = document.getElementById('puzzle-options');
    const submitPuzzleBtn = document.getElementById('submit-puzzle');
    const puzzleFeedback = document.getElementById('puzzle-feedback');
    const attemptsTimer = document.createElement('div');
    

    let isAnalog = true;
    let attemptsLeft = 4;
    let selectedAnswer = null;
    let correctAnswer = null;
    let currentCustomization = null;
    let renewalTimer = null;

    attemptsTimer.id = 'attempts-timer';
    attemptsTimer.className = 'attempts-bar';
    attemptsTimer.style.display = 'none';
    mainScreen.appendChild(attemptsTimer);

    const updateAttemptsBar = () => {
        attemptsBar.textContent = `Attempts Left: ${attemptsLeft}/4`;
    };

    const startRenewalTimer = () => {
        let timeLeft = 120; // 2 minutes
        attemptsTimer.style.display = 'block';
        // Add CSS styles to the attemptsTimer element to create a black box with white content
        attemptsTimer.style.display = 'block';
        attemptsTimer.style.position = 'fixed';
        attemptsTimer.style.top = '10px';
        attemptsTimer.style.left = '50%';
        attemptsTimer.style.transform = 'translateX(-50%)';
        attemptsTimer.style.padding = '10px 20px';
        attemptsTimer.style.backgroundColor = 'black';
        attemptsTimer.style.color = 'white';
        attemptsTimer.style.fontSize = '18px';
        attemptsTimer.style.fontWeight = 'bold';
        attemptsTimer.style.borderRadius = '10px';
        attemptsTimer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        attemptsTimer.style.textAlign = 'center';


        renewalTimer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            attemptsTimer.textContent = `Renewing in: ${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (--timeLeft < 0) {
                clearInterval(renewalTimer);
                attemptsLeft = 4;
                updateAttemptsBar();
                attemptsTimer.style.display = 'none';
            }
        }, 1000);
    };

    const handleCustomization = (type) => {
        if (attemptsLeft <=0) {
            alert('No attempts left. Please wait for renewal.');
            return;
        }

        attemptsLeft -= 1;
        updateAttemptsBar();

        if (type === 'add-background') {
            backgroundImageUpload.click();
            backgroundImageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        analogClock.style.backgroundImage = `url(${event.target.result})`;
                        analogClock.style.backgroundSize = 'cover';
                        analogClock.style.backgroundPosition = 'center';
                    };
                    reader.readAsDataURL(file);
                }
            });
        } else if (type === 'change-wall') {
            colorPicker.style.display = 'block';
            colorPicker.addEventListener('input', (e) => {
                document.querySelector('.clock-container').style.backgroundColor = e.target.value;
                colorPicker.style.display = 'none';
            });
        } else if (type === 'convert-mode') {
            isAnalog = !isAnalog;
            analogClock.style.display = isAnalog ? 'block' : 'none';
            digitalClock.style.display = isAnalog ? 'none' : 'flex';
        } else if (type === 'change-shape') {
            const shapes = ['circle', 'square', 'rectangle'];
            const currentShape = shapes.find(shape => analogClock.classList.contains(shape)) || 'circle';
            const nextShape = shapes[(shapes.indexOf(currentShape) + 1) % shapes.length];
            analogClock.className = `clock analog ${nextShape}`;
        }

        if (attemptsLeft === 0) {
            startRenewalTimer();
        }
    };
    
    const generateQuestion = () => {
        if (attemptsLeft >=0){
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operation = Math.random() > 0.5 ? '+' : '-';
        correctAnswer = operation === '+' ? num1 + num2 : num1 - num2;
        puzzleQuestion.textContent = `What is ${num1} ${operation} ${num2}?`;

        const options = new Set([correctAnswer]);
        while (options.size < 3) {
            options.add(correctAnswer + Math.floor(Math.random() * 5) - 2);
        }

        return Array.from(options).sort(() => Math.random() - 0.5);
    }
    };


    const populateOptions = () => {
        puzzleOptions.innerHTML = '';
        const options = generateQuestion();
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'puzzle-option';
            button.textContent = option;
            button.dataset.answer = option;
            puzzleOptions.appendChild(button);

            button.addEventListener('click', () => {
                document.querySelectorAll('.puzzle-option').forEach(opt => opt.classList.remove('selected'));
                button.classList.add('selected');
                selectedAnswer = parseInt(button.dataset.answer, 10);
            });
        });
    };

    const showPuzzleForCustomization = (customizationType) => {
        currentCustomization = customizationType;
        puzzleScreen.style.display = 'flex';
        populateOptions();
        puzzleFeedback.style.display = 'none';
    };

    submitPuzzleBtn.addEventListener('click', () => {
        if (selectedAnswer === null) {
            puzzleFeedback.textContent = 'Please select an answer.';
            puzzleFeedback.className = 'feedback-message incorrect';
            puzzleFeedback.style.display = 'block';
        } else if (selectedAnswer === correctAnswer) {
            puzzleFeedback.textContent = 'Correct!';
            puzzleFeedback.className = 'feedback-message correct';
            puzzleFeedback.style.display = 'block';
            setTimeout(() => {
                puzzleScreen.style.display = 'none';
                handleCustomization(currentCustomization);
            }, 1000);
        } else {
            puzzleFeedback.textContent = 'Incorrect! Try again.';
            puzzleFeedback.className = 'feedback-message incorrect';
            puzzleFeedback.style.display = 'block';
        }
    });

    // Attach event listeners to customization buttons
    document.getElementById('add-background').addEventListener('click', () => showPuzzleForCustomization('add-background'));
    document.getElementById('change-wall').addEventListener('click', () => showPuzzleForCustomization('change-wall'));
    document.getElementById('convert-mode').addEventListener('click', () => showPuzzleForCustomization('convert-mode'));
    document.getElementById('change-shape').addEventListener('click', () => showPuzzleForCustomization('change-shape'));

    const updateClock = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const hourDeg = (hours % 12 + minutes / 60) * 30;
        const minuteDeg = (minutes + seconds / 60) * 6;
        const secondDeg = seconds * 6;

        hourHand.style.transform = `rotate(${hourDeg}deg)`;
        minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
        secondHand.style.transform = `rotate(${secondDeg}deg)`;

        digitalTime.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    analogBtn.addEventListener('click', () => {
        isAnalog = true;
        analogClock.style.display = 'block';
        digitalClock.style.display = 'none';
    });

    digitalBtn.addEventListener('click', () => {
        isAnalog = false;
        analogClock.style.display = 'none';
        digitalClock.style.display = 'flex';
    });

    startBtn.addEventListener('click', () => {
        mainScreen.style.display = 'block';
        startBtn.style.display = 'none';
        updateAttemptsBar();
        updateClock();
        setInterval(updateClock, 1000);
    });

    bulbIcon.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.body.setAttribute('data-theme', 'light');
            bulbIcon.src = 'https://img.icons8.com/ios-filled/50/ffffff/sun.png';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            bulbIcon.src = 'https://img.icons8.com/ios-filled/50/ffffff/moon.png';
        }
    });
    
});
