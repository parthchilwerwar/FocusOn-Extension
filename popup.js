document.addEventListener('DOMContentLoaded', function () {
    const timeInput = document.getElementById('timeInput');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const timerDisplay = document.getElementById('timerDisplay');

    function updateUI(focusOn, timeRemaining) {
        if (focusOn) {
            startButton.style.display = 'none';
            stopButton.style.display = 'block';
            timeInput.disabled = true;
            updateTimerDisplay(timeRemaining);
        } else {
            startButton.style.display = 'block';
            stopButton.style.display = 'none';
            timeInput.disabled = false;
            timerDisplay.textContent = '';
        }
    }

    function updateTimerDisplay(timeRemaining) {
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Limit input to a maximum of 9999999
    timeInput.addEventListener('input', function() {
        if (this.value > 9999999) {
            this.value = 9999999;
        }
    });

    chrome.runtime.sendMessage({ command: 'checkFocusStatus' }, function(response) {
        updateUI(response.focusOn, response.timeRemaining);
    });

    startButton.addEventListener('click', function () {
        const duration = parseInt(timeInput.value, 10);

        if (isNaN(duration) || duration <= 0) {
            alert('Please enter a valid positive number for the duration.');
            return;
        }

        const durationInMs = duration * 60 * 1000;

        chrome.runtime.sendMessage({ command: 'startFocusOn', duration: durationInMs }, function(response) {
            if (response.success) {
                updateUI(true, durationInMs);
            }
        });
    });

    stopButton.addEventListener('click', function () {
        chrome.runtime.sendMessage({ command: 'stopFocusOn' }, function(response) {
            if (response.success) {
                updateUI(false, 0);
            }
        });
    });

    setInterval(() => {
        chrome.runtime.sendMessage({ command: 'checkFocusStatus' }, function(response) {
            if (response.focusOn) {
                updateTimerDisplay(response.timeRemaining);
            }
        });
    }, 1000);
});
