document.addEventListener('DOMContentLoaded', function () {
  var timeInput = document.getElementById('timeInput');
  var startButton = document.getElementById('startButton');

  startButton.addEventListener('click', function () {
    var duration = parseInt(timeInput.value, 10);


    if (isNaN(duration) || duration <= 0) {
      alert('Please enter a valid positive number for the duration.');
      return;
    }

  
    duration = duration * 60 * 1000;

    
    chrome.runtime.sendMessage({ command: 'startFocusOn', duration: duration });

    
    startFocusSession(duration);
  });

  function startFocusSession(duration) {
    console.log('Focus session started for ' + duration + ' milliseconds.');

    setTimeout(function () {
      console.log('Focus session ended.');

      alert('Focus session ended!'); 
    }, duration);
  }
});