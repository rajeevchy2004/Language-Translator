document.addEventListener('DOMContentLoaded', function() {
    const textBtn = document.getElementById('textBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const translateBtn = document.getElementById('translateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const sourceLanguage = document.getElementById('sourceLanguage');
    const targetLanguage = document.getElementById('targetLanguage');
    const status = document.getElementById('status');
    
    let isListening = false;
    let recognition;
    
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = function() {
            isListening = true;
            status.textContent = "Listening... Speak now";
            voiceBtn.style.backgroundColor = "#f44336";
            voiceBtn.textContent = "Stop";
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            inputText.value = transcript;
            isListening = false;
            voiceBtn.style.backgroundColor = "#2196F3";
            voiceBtn.textContent = "Voice";
            status.textContent = "Ready to translate";
            autoTranslate();
        };
        
        recognition.onerror = function(event) {
            isListening = false;
            voiceBtn.style.backgroundColor = "#2196F3";
            voiceBtn.textContent = "Voice";
            status.textContent = "Error occurred in recognition: " + event.error;
        };
        
        recognition.onend = function() {
            if (isListening) {
                recognition.start();
            }
        };
    } else {
        voiceBtn.disabled = true;
        voiceBtn.style.opacity = "0.7";
        status.textContent = "Voice recognition not supported in your browser";
    }
    
    // Voice button click handler
    voiceBtn.addEventListener('click', function() {
        if (!isListening) {
            recognition.lang = sourceLanguage.value;
            recognition.start();
        } else {
            recognition.stop();
            isListening = false;
            voiceBtn.style.backgroundColor = "#2196F3";
            voiceBtn.textContent = "Voice";
            status.textContent = "Ready to translate";
        }
    });
    
    // Translate button click handler
    translateBtn.addEventListener('click', function() {
        autoTranslate();
    });
    
    // Clear button click handler
    clearBtn.addEventListener('click', function() {
        inputText.value = '';
        outputText.value = '';
        status.textContent = "Text cleared";
        setTimeout(() => {
            status.textContent = "Ready to translate";
        }, 1500);
    });
    
    // Language change handler
    targetLanguage.addEventListener('change', function() {
        if (inputText.value.trim() !== '') {
            autoTranslate();
        }
    });
    
    // Auto-translate function using Google Translate API
    function autoTranslate() {
        const text = inputText.value.trim();
        if (text === '') {
            status.textContent = "Please enter some text to translate";
            return;
        }
        
        status.textContent = "Translating...";
        translateBtn.disabled = true;
        translateBtn.style.opacity = "0.7";
        
        const sourceLang = sourceLanguage.value;
        const targetLang = targetLanguage.value;
        
        // Using Google Translate API
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const translatedText = data[0].map(item => item[0]).join('');
                outputText.value = translatedText;
                status.textContent = "Translation complete";
                translateBtn.disabled = false;
                translateBtn.style.opacity = "1";
            })
            .catch(error => {
                console.error('Translation error:', error);
                status.textContent = "Translation failed. Please try again.";
                translateBtn.disabled = false;
                translateBtn.style.opacity = "1";
            });
    }
    
    // Text button click handler (just focuses the input)
    textBtn.addEventListener('click', function() {
        inputText.focus();
    });
    
    // Handle keyboard for better mobile UX
    inputText.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            autoTranslate();
        }
    });
});