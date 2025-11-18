<<<<<<< HEAD
// Global music state
let isGlobalMusicPlaying = false;
let currentGlobalSong = 1;

function toggleGlobalMusic() {
    const btn = document.getElementById('globalPlayStopBtn');
    const icon = document.getElementById('musicIcon');
    const text = document.getElementById('musicText');
    
    if (isGlobalMusicPlaying) {
        // Pause music (remember position)
        pauseCurrentMusic();
        isGlobalMusicPlaying = false;
        icon.textContent = '🎵';
        text.textContent = 'Play Music';
        btn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
    } else {
        // Resume or start music
        resumeOrStartMusic();
        isGlobalMusicPlaying = true;
        icon.textContent = '⏸️';
        text.textContent = 'Pause Music';
        btn.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e8e)';
    }
}

function pauseCurrentMusic() {
    if (window.currentAudio) {
        window.currentAudio.pause();
        // Don't reset currentTime to preserve position
        console.log(`Music paused at ${window.currentAudio.currentTime}s`);
        
        // Update song item display
        if (window.currentSongItem) {
            window.currentSongItem.classList.remove('playing');
            window.currentSongItem.setAttribute('data-playing', 'paused');
        }
        
        // Keep the song title but indicate it's paused
        const currentInfo = document.getElementById('currentSongTitle').textContent;
        if (currentInfo.includes('♪')) {
            updateCurrentSongInfo(currentInfo.replace('♪', '⏸'));
        }
    }
}

function resumeOrStartMusic() {
    if (window.currentAudio && window.currentAudio.paused) {
        // Resume existing audio from where it was paused
        console.log(`Resuming music from ${window.currentAudio.currentTime}s`);
        window.currentAudio.play().then(() => {
            // Update song item display
            if (window.currentSongItem) {
                window.currentSongItem.classList.add('playing');
                window.currentSongItem.setAttribute('data-playing', 'true');
            }
            
            // Update song info display
            const currentInfo = document.getElementById('currentSongTitle').textContent;
            if (currentInfo.includes('⏸')) {
                updateCurrentSongInfo(currentInfo.replace('⏸', '♪'));
            }
            
            // Restart progress tracking
            clearProgressTracking();
            initializeProgressTracking();
        }).catch(error => {
            console.error('Error resuming music:', error);
        });
    } else {
        // Start new music
        playSong(currentGlobalSong);
    }
}

function startGlobalMusic() {
    // Start with the first song
    playSong(currentGlobalSong);
}

function updateCurrentSongInfo(songInfo) {
    const songInfoElement = document.getElementById('currentSongTitle');
    if (songInfoElement) {
        songInfoElement.textContent = songInfo;
    }
}

function nextSong() {
    const totalSongs = 5; // Update this if you add more songs
    if (currentGlobalSong < totalSongs) {
        currentGlobalSong++;
    } else {
        currentGlobalSong = 1; // Loop back to first song
    }
    
    if (isGlobalMusicPlaying || window.currentAudio) {
        playSong(currentGlobalSong);
    }
    
    updateNavigationButtons();
}

function previousSong() {
    const totalSongs = 5; // Update this if you add more songs
    if (currentGlobalSong > 1) {
        currentGlobalSong--;
    } else {
        currentGlobalSong = totalSongs; // Loop to last song
    }
    
    if (isGlobalMusicPlaying || window.currentAudio) {
        playSong(currentGlobalSong);
    }
    
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const totalSongs = 5;
    
    // Enable/disable buttons based on position (optional - remove if you want looping)
    // For now, keep buttons always enabled since we're looping
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
}

function autoPlayNextSong() {
    // Only auto-play if music was actually playing (not if user manually stopped)
    if (isGlobalMusicPlaying) {
        const totalSongs = 5; // Update this if you add more songs
        
        // Move to next song
        if (currentGlobalSong < totalSongs) {
            currentGlobalSong++;
        } else {
            currentGlobalSong = 1; // Loop back to first song
        }
        
        // Small delay for smoother transition
        setTimeout(() => {
            console.log(`Auto-playing next song: ${currentGlobalSong}`);
            playSong(currentGlobalSong);
        }, 500);
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateProgressBar() {
    if (window.currentAudio) {
        const currentTime = window.currentAudio.currentTime;
        const duration = window.currentAudio.duration;
        
        const progressFill = document.getElementById('progressFill');
        const currentTimeDisplay = document.getElementById('currentTime');
        const totalTimeDisplay = document.getElementById('totalTime');
        
        if (progressFill && currentTimeDisplay && totalTimeDisplay) {
            const progress = (currentTime / duration) * 100;
            progressFill.style.width = `${progress}%`;
            
            currentTimeDisplay.textContent = formatTime(currentTime);
            totalTimeDisplay.textContent = formatTime(duration);
        }
    }
}

function seekToPosition(event) {
    if (window.currentAudio) {
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const progressBarWidth = rect.width;
        const clickPosition = clickX / progressBarWidth;
        
        const newTime = clickPosition * window.currentAudio.duration;
        window.currentAudio.currentTime = newTime;
        
        updateProgressBar();
    }
}

function initializeProgressTracking() {
    if (window.currentAudio) {
        // Update progress bar every 100ms
        window.progressInterval = setInterval(updateProgressBar, 100);
        
        // Update duration when metadata is loaded
        window.currentAudio.addEventListener('loadedmetadata', () => {
            updateProgressBar();
        });
        
        // Clear interval when song ends
        window.currentAudio.addEventListener('ended', () => {
            if (window.progressInterval) {
                clearInterval(window.progressInterval);
                window.progressInterval = null;
            }
            resetProgressBar();
        });
    }
}

function resetProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const currentTimeDisplay = document.getElementById('currentTime');
    const totalTimeDisplay = document.getElementById('totalTime');
    
    if (progressFill) progressFill.style.width = '0%';
    if (currentTimeDisplay) currentTimeDisplay.textContent = '0:00';
    if (totalTimeDisplay) totalTimeDisplay.textContent = '0:00';
}

function clearProgressTracking() {
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
        window.progressInterval = null;
    }
}

// Override the existing playSong function to update global controls
const originalPlaySong = window.playSong || function() {};

function hideAllMessages() {
    const messages = [
        'surpriseMessage',
        'memoryMessage', 
        'wishMessage',
        'gratitudeMessage',
        'journeyMessage',
        'futureMessage',
        'playlistMessage'
    ];
    
    messages.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                element.style.display = 'none';
            }, 300); // Wait for fade out animation
        }
    });
    
    // Remove active state from all buttons
    const buttons = document.querySelectorAll('.surprise-btn, .memory-btn, .wish-btn, .gratitude-btn, .journey-btn, .future-btn, .playlist-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
}

function setActiveButton(buttonClass) {
    const button = document.querySelector(`.${buttonClass}`);
    if (button) {
        button.classList.add('active');
    }
}

function closeAllMessages() {
    hideAllMessages();
}

function showSurprise() {
    hideAllMessages();
    setActiveButton('surprise-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("surpriseMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        createSparkles();
    }, 350);
}

function showMemories() {
    hideAllMessages();
    setActiveButton('memory-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("memoryMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        createFloatingPhotos();
    }, 350);
}

function showWishes() {
    hideAllMessages();
    setActiveButton('wish-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("wishMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        createShootingStars();
    }, 350);
}

function showGratitude() {
    hideAllMessages();
    setActiveButton('gratitude-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("gratitudeMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        createGratitudeAnimation();
    }, 350);
}

function showJourney() {
    hideAllMessages();
    setActiveButton('journey-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("journeyMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        animateTimeline();
    }, 350);
}

function showFuture() {
    hideAllMessages();
    setActiveButton('future-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("futureMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        animateWishList();
    }, 350);
}

function showPlaylist() {
    hideAllMessages();
    setActiveButton('playlist-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("playlistMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        createMusicNotes();
    }, 350);
}

function playSong(songNumber) {
    // Only stop if playing a different song, otherwise just resume current
    const songs = [
        { title: "Malay Ko", file: "malayKo.mp3", message: "🎵 For the regret, longing and hoping for a chance in love. 🎶" },
        { title: "Burnout", file: "burnout.mp3", message: "🎶 Every note brings back beautiful moments we shared! 🌟" },
        { title: "Hirap Kalimutan", file: "hirapKalimutan.mp3", message: "🎶 The soundtrack to our amazing bond! 🤝" },
        { title: "Shot Puno", file: "shotPuno.mp3", message: "🎵 A melody of gratitude for your friendship! 💝" },
        { title: "Ikaw At Ako", file: "ikawAtaAko.mp3", message: "🎵 Here's to your bright future ahead! 🚀" }
    ];
    
    const song = songs[songNumber - 1];
    
    // If same song and audio exists, just resume
    // Use a dedicated index variable (window.currentAudioSongIndex) so we compare
    // against the actual audio object instead of the mutable global currentGlobalSong.
    if (window.currentAudio && window.currentAudioSongIndex === songNumber && window.currentAudio.paused) {
        console.log(`Resuming ${song.title} from ${window.currentAudio.currentTime}s`);
        window.currentAudio.play().catch(error => {
            console.error('Error resuming music:', error);
        });
        return;
    }
    
    // Stop all currently playing audio for new song
    stopAllMusic();
    
    const songItem = document.querySelector(`.song-item:nth-child(${songNumber})`);
    
    // Create audio element with improved settings
    const audio = new Audio();
    audio.src = `assets/music/${song.file}`;
    audio.preload = 'auto';
    audio.volume = document.getElementById('volumeSlider').value / 100;
    
    // Store reference to currently playing audio and its song index
    window.currentAudio = audio;
    window.currentAudioSongIndex = songNumber;
    window.currentSongItem = songItem;
    
    // Set up event listeners with better debugging
    audio.addEventListener('loadstart', () => {
        console.log(`Loading ${song.title}... (${song.file})`);
    });
    
    audio.addEventListener('canplay', () => {
        console.log(`${song.title} is ready to play`);
    });
    
    audio.addEventListener('loadeddata', () => {
        console.log(`${song.title} data loaded successfully`);
    });
    
    audio.addEventListener('error', (e) => {
        console.error(`Error loading ${song.file}:`, e);
        console.error('Error details:', {
            error: e.target.error,
            src: e.target.src,
            networkState: e.target.networkState,
            readyState: e.target.readyState
        });
        if (songItem) {
            songItem.classList.remove('playing');
            songItem.setAttribute('data-playing', 'false');
        }
    });
    
    audio.addEventListener('ended', () => {
        if (songItem) {
            songItem.classList.remove('playing');
            songItem.setAttribute('data-playing', 'false');
        }

        // Ensure progress tracking is cleared and UI reset
        if (window.progressInterval) {
            clearInterval(window.progressInterval);
            window.progressInterval = null;
        }
        resetProgressBar();

        // Clear references to the ended audio so a stale audio object
        // cannot be accidentally resumed by subsequent logic.
        window.currentAudio = null;
        window.currentAudioSongIndex = null;
        window.currentSongItem = null;

        // Auto-play next song (small delay for smoother transition)
        setTimeout(() => {
            autoPlayNextSong();
        }, 250);
    });
    
    // Try to play the audio with better error handling
    console.log(`Attempting to play: ${song.title} (${audio.src})`);
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log(`Successfully playing: ${song.title}`);
            if (songItem) {
                songItem.classList.add('playing');
                songItem.setAttribute('data-playing', 'true');
            }
            
            // Update global music controls
            updateCurrentSongInfo(`♪ ${song.title}`);
            isGlobalMusicPlaying = true;
            currentGlobalSong = songNumber;
            const btn = document.getElementById('globalPlayStopBtn');
            const icon = document.getElementById('musicIcon');
            const text = document.getElementById('musicText');
            if (btn && icon && text) {
                icon.textContent = '⏸️';
                text.textContent = 'Pause Music';
                btn.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e8e)';
            }
            
            // Update navigation buttons
            updateNavigationButtons();
            
            // Initialize progress tracking
            clearProgressTracking(); // Clear any existing intervals
            initializeProgressTracking();
            
            createMusicWaves();
            createDancingNotes();
            
        }).catch((error) => {
            console.error(`Could not play ${song.file}:`, error);
            if (error.name === 'NotAllowedError') {
                console.log(`${song.title} needs user interaction to play.`);
            } else {
                console.error(`Error playing ${song.title}:`, error);
            }
        });
    }
}

function stopAllMusic() {
    // Clear progress tracking
    clearProgressTracking();
    resetProgressBar();
    
    // Stop currently playing audio and reset position
    if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio.currentTime = 0; // Reset to beginning
        window.currentAudio = null; // Clear reference for complete stop
        window.currentAudioSongIndex = null;
    }
    
    // Remove playing class from all song items
    const allSongItems = document.querySelectorAll('.song-item');
    allSongItems.forEach(item => {
        item.classList.remove('playing');
        item.setAttribute('data-playing', 'false');
    });
    
    window.currentSongItem = null;
    
    // Update global music controls to stopped state
    isGlobalMusicPlaying = false;
    updateCurrentSongInfo('No song playing');
    const btn = document.getElementById('globalPlayStopBtn');
    const icon = document.getElementById('musicIcon');
    const text = document.getElementById('musicText');
    if (btn && icon && text) {
        icon.textContent = '🎵';
        text.textContent = 'Play Music';
        btn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
    }
}

function setVolume(volume) {
    if (window.currentAudio) {
        window.currentAudio.volume = volume / 100;
    }
}

function findTreasure(treasureNumber) {
    const treasures = [
        {
            title: "Secret Message",
            content: "🗝️ Here's a secret: You are one of the most genuine and wonderful people I know. Never change! ✨"
        },
        {
            title: "Special Quote",
            content: "💎 \"Friendship is the only cement that will ever hold the world together.\" - You've been that cement in my life! 🌍"
        },
        {
            title: "Digital Hug",
            content: '<div class="digital-hug">🤗</div><p>Sending you the biggest, warmest virtual hug! Feel the love! 💕</p>'
        },
        {
            title: "Surprise Fact",
            content: "🌟 Did you know? You've made me smile exactly 10,000 times over the years (yes, I counted in my heart)! 😊"
        }
    ];
    
    const treasure = treasures[treasureNumber - 1];
    const display = document.getElementById("treasureDisplay");
    
    display.innerHTML = `
        <h4>${treasure.title}</h4>
        ${treasure.content}
    `;
    
    display.classList.add('show');
    createTreasureEffect();
}

function createGratitudeAnimation() {
    const hearts = ['💖', '💝', '💕', '💗', '💙', '💚', '💛', '🧡', '💜'];
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.position = 'absolute';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.top = Math.random() * 100 + '%';
            heart.style.fontSize = Math.random() * 15 + 20 + 'px';
            heart.style.animation = 'float 3s ease-in-out forwards';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '999';
            
            document.body.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 3000);
        }, i * 200);
    }
}

function animateTimeline() {
    const items = document.querySelectorAll('.timeline-item');
    const stats = document.querySelectorAll('.stat-item');
    
    // Animate timeline items with staggered effect
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.animationDelay = `${index * 0.3}s`;
            item.style.opacity = '1';
            
            // Add a subtle bounce effect
            item.addEventListener('animationend', () => {
                item.style.transform = 'translateY(0)';
            });
            
            // Create floating elements for each timeline item
            createTimelineEffect(item, index);
        }, index * 300);
    });
    
    // Animate stats with counting effect
    setTimeout(() => {
        stats.forEach((stat, index) => {
            setTimeout(() => {
                const number = stat.querySelector('.stat-number');
                if (number.textContent !== '∞' && number.textContent !== '100%') {
                    animateCounter(number, parseInt(number.textContent) || 0);
                } else {
                    stat.style.animation = 'bounce 0.6s ease';
                }
            }, index * 200);
        });
    }, items.length * 300);
    
    // Add journey completion celebration
    setTimeout(() => {
        createJourneyCompletionEffect();
    }, (items.length * 300) + 2000);
}

function createTimelineEffect(item, index) {
    const emojis = ['✨', '🌟', '💫', '⭐', '🎆', '🎉', '💝', '🌈'];
    const emoji = emojis[index % emojis.length];
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const effect = document.createElement('div');
            effect.innerHTML = emoji;
            effect.style.position = 'absolute';
            
            const rect = item.getBoundingClientRect();
            effect.style.left = (rect.left + Math.random() * rect.width) + 'px';
            effect.style.top = (rect.top + Math.random() * rect.height) + 'px';
            effect.style.fontSize = '1.5rem';
            effect.style.animation = 'timelineSparkle 2s ease-out forwards';
            effect.style.pointerEvents = 'none';
            effect.style.zIndex = '999';
            
            // Add timeline sparkle animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes timelineSparkle {
                    0% { 
                        opacity: 0; 
                        transform: translateY(0) scale(0.5) rotate(0deg); 
                    }
                    50% { 
                        opacity: 1; 
                        transform: translateY(-20px) scale(1) rotate(180deg); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translateY(-40px) scale(0.5) rotate(360deg); 
                    }
                }
                
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                }
            `;
            if (!document.querySelector('#timelineSparkleStyle')) {
                style.id = 'timelineSparkleStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(effect);
            
            setTimeout(() => {
                if (effect.parentNode) {
                    effect.parentNode.removeChild(effect);
                }
            }, 2000);
        }, i * 300);
    }
}

function animateCounter(element, target) {
    let current = 0;
    const increment = Math.ceil(target / 30);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
            element.style.animation = 'bounce 0.6s ease';
        }
        element.textContent = current;
    }, 50);
}

function createJourneyCompletionEffect() {
    // Create a celebration burst
    const celebrationEmojis = ['🎉', '🎊', '🥳', '🎈', '🎆', '✨', '🌟', '💫', '🎭', '🎪'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.innerHTML = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
            emoji.style.position = 'fixed';
            emoji.style.left = Math.random() * 100 + '%';
            emoji.style.top = '-50px';
            emoji.style.fontSize = Math.random() * 20 + 25 + 'px';
            emoji.style.animation = 'celebrationFall 3s ease-in forwards';
            emoji.style.pointerEvents = 'none';
            emoji.style.zIndex = '1000';
            
            // Add celebration fall animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes celebrationFall {
                    0% { 
                        transform: translateY(-50px) rotate(0deg); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateY(calc(100vh + 50px)) rotate(720deg); 
                        opacity: 0.7; 
                    }
                }
            `;
            if (!document.querySelector('#celebrationFallStyle')) {
                style.id = 'celebrationFallStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(emoji);
            
            setTimeout(() => {
                if (emoji.parentNode) {
                    emoji.parentNode.removeChild(emoji);
                }
            }, 3000);
        }, i * 150);
    }
    
    // Show a completion message - centered
    setTimeout(() => {
        const messageEl = document.createElement('div');
        messageEl.innerHTML = "🎉 What an incredible journey we've shared! Thank you for being such an amazing part of my life story! 💝";
        messageEl.style.position = 'fixed';
        messageEl.style.top = '50%';
        messageEl.style.left = '50%';
        messageEl.style.transform = 'translate(-50%, -50%)';
        messageEl.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        messageEl.style.color = 'white';
        messageEl.style.padding = '20px 30px';
        messageEl.style.borderRadius = '15px';
        messageEl.style.fontSize = '1.2rem';
        messageEl.style.textAlign = 'center';
        messageEl.style.zIndex = '1500';
        messageEl.style.maxWidth = '80%';
        messageEl.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        messageEl.style.animation = 'centerFadeIn 4s ease-in-out forwards';
        
        // Add center fade animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes centerFadeIn {
                0% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.8); 
                }
                20% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1); 
                }
                80% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1); 
                }
                100% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.9); 
                }
            }
        `;
        if (!document.querySelector('#centerFadeInStyle')) {
            style.id = 'centerFadeInStyle';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 10000);
    }, 1000);
}

function animateWishList() {
    const wishes = document.querySelectorAll('.wish-item');
    wishes.forEach((wish, index) => {
        wish.style.opacity = '0';
        wish.style.transform = 'translateX(-50px)';
        
        setTimeout(() => {
            wish.style.transition = 'all 0.5s ease';
            wish.style.opacity = '1';
            wish.style.transform = 'translateX(0)';
        }, index * 200);
    });
}

function createMusicNotes() {
    const notes = ['🎵', '🎶', '🎼', '🎤', '🎸', '🎺', '🎷', '🎹'];
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const note = document.createElement('div');
            note.innerHTML = notes[Math.floor(Math.random() * notes.length)];
            note.style.position = 'absolute';
            note.style.left = Math.random() * 100 + '%';
            note.style.top = Math.random() * 100 + '%';
            note.style.fontSize = Math.random() * 10 + 20 + 'px';
            note.style.animation = 'float 2s ease-in-out forwards';
            note.style.pointerEvents = 'none';
            note.style.zIndex = '999';
            
            document.body.appendChild(note);
            
            setTimeout(() => {
                if (note.parentNode) {
                    note.parentNode.removeChild(note);
                }
            }, 2000);
        }, i * 150);
    }
}

function createDancingNotes() {
    const notes = ['🎵', '🎶', '🎼', '♪', '♫', '♬'];
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const note = document.createElement('div');
            note.innerHTML = notes[Math.floor(Math.random() * notes.length)];
            note.style.position = 'fixed';
            note.style.left = Math.random() * 100 + '%';
            note.style.top = '100%';
            note.style.fontSize = Math.random() * 15 + 20 + 'px';
            note.style.animation = 'danceUp 3s ease-out forwards';
            note.style.pointerEvents = 'none';
            note.style.zIndex = '999';
            note.style.color = `hsl(${Math.random() * 360}, 70%, 70%)`;
            
            // Add dancing animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes danceUp {
                    0% { 
                        transform: translateY(0) rotate(0deg) scale(1); 
                        opacity: 1; 
                    }
                    25% { 
                        transform: translateY(-25vh) rotate(90deg) scale(1.2); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: translateY(-50vh) rotate(180deg) scale(0.8); 
                        opacity: 0.8; 
                    }
                    75% { 
                        transform: translateY(-75vh) rotate(270deg) scale(1.1); 
                        opacity: 0.6; 
                    }
                    100% { 
                        transform: translateY(-100vh) rotate(360deg) scale(0.5); 
                        opacity: 0; 
                    }
                }
            `;
            if (!document.querySelector('#danceUpStyle')) {
                style.id = 'danceUpStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(note);
            
            setTimeout(() => {
                if (note.parentNode) {
                    note.parentNode.removeChild(note);
                }
            }, 3000);
        }, i * 300);
    }
}

// Enhanced music waves with more variety
function createMusicWaves() {
    const waves = ['〰️', '〜', '～', '⚡', '💫'];
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const wave = document.createElement('div');
            wave.innerHTML = waves[Math.floor(Math.random() * waves.length)];
            wave.style.position = 'absolute';
            wave.style.left = Math.random() * 100 + '%';
            wave.style.top = Math.random() * 100 + '%';
            wave.style.fontSize = Math.random() * 15 + 20 + 'px';
            wave.style.animation = 'musicWave 2s ease-in-out forwards';
            wave.style.pointerEvents = 'none';
            wave.style.zIndex = '999';
            wave.style.color = `hsl(${Math.random() * 360}, 60%, 80%)`;
            
            // Add music wave animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes musicWave {
                    0% { 
                        transform: translateX(0) scale(1) rotate(0deg); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: translateX(${Math.random() * 200 - 100}px) scale(1.5) rotate(180deg); 
                        opacity: 0.8; 
                    }
                    100% { 
                        transform: translateX(${Math.random() * 300 - 150}px) scale(0.5) rotate(360deg); 
                        opacity: 0; 
                    }
                }
            `;
            if (!document.querySelector('#musicWaveStyle')) {
                style.id = 'musicWaveStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(wave);
            
            setTimeout(() => {
                if (wave.parentNode) {
                    wave.parentNode.removeChild(wave);
                }
            }, 2000);
        }, i * 200);
    }
}

function createTreasureEffect() {
    const gems = ['💎', '💍', '👑', '🏆', '⭐', '✨', '🌟'];
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const gem = document.createElement('div');
            gem.innerHTML = gems[Math.floor(Math.random() * gems.length)];
            gem.style.position = 'absolute';
            gem.style.left = Math.random() * 100 + '%';
            gem.style.top = Math.random() * 100 + '%';
            gem.style.fontSize = Math.random() * 15 + 20 + 'px';
            gem.style.animation = 'sparkle 2s ease-out forwards';
            gem.style.pointerEvents = 'none';
            gem.style.zIndex = '1000';
            
            document.body.appendChild(gem);
            
            setTimeout(() => {
                if (gem.parentNode) {
                    gem.parentNode.removeChild(gem);
                }
            }, 2000);
        }, i * 150);
    }
}

function showWelcomeOverlay() {
    // Create welcome overlay
    const overlay = document.createElement('div');
    overlay.id = 'welcomeOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0, 0, 0, 0.9)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '3000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease-in-out';
    
    // Create welcome message content
    const content = document.createElement('div');
    content.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    content.style.color = 'white';
    content.style.padding = '40px';
    content.style.borderRadius = '20px';
    content.style.textAlign = 'center';
    content.style.maxWidth = '500px';
    content.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.4)';
    content.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    content.style.backdropFilter = 'blur(10px)';
    
    content.innerHTML = `
        <h2 style="margin-bottom: 20px; font-size: 2rem; font-weight: 700;">🎵 Welcome to Our Memory Lane 🎵</h2>
        <p style="margin-bottom: 30px; font-size: 1.1rem; line-height: 1.6;">songs that remind me of all the beautiful moments we've shared.</p>
        <button id="welcomePlayButton" style="
            background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
            transition: all 0.3s ease;
            outline: none;
        ">▶️ Start the Memory Playlist</button>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Fade in the overlay
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);
    
    // Add hover effect to play button
    const playButton = content.querySelector('#welcomePlayButton');
    playButton.addEventListener('mouseenter', () => {
        playButton.style.transform = 'scale(1.05)';
        playButton.style.boxShadow = '0 10px 25px rgba(255, 107, 107, 0.6)';
    });
    
    playButton.addEventListener('mouseleave', () => {
        playButton.style.transform = 'scale(1)';
        playButton.style.boxShadow = '0 8px 20px rgba(255, 107, 107, 0.4)';
    });
    
    // Handle play button click
    playButton.addEventListener('click', () => {
        startMemoryPlaylist();
        closeWelcomeOverlay();
    });
}

function closeWelcomeOverlay() {
    const overlay = document.getElementById('welcomeOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 500);
    }
}

function startMemoryPlaylist() {
    // Show the playlist message first, then wait for it to fully appear before starting music
    showPlaylist();
    
    // Wait longer before starting the song to avoid message overlap
    setTimeout(() => {
        playSong(1);
    }, 800);
}

function createFloatingMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.innerHTML = message;
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translateX(-50%)';
    messageEl.style.background = 'rgba(0, 0, 0, 0.85)';
    messageEl.style.color = 'white';
    messageEl.style.padding = '15px 25px';
    messageEl.style.borderRadius = '15px';
    messageEl.style.fontSize = '1rem';
    messageEl.style.textAlign = 'center';
    messageEl.style.zIndex = '1500';
    messageEl.style.maxWidth = '80%';
    messageEl.style.animation = 'slideDownFade 3s ease-in-out forwards';
    
    // Add slide down fade animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDownFade {
            0% { 
                opacity: 0; 
                transform: translateX(-50%) translateY(-20px) scale(0.9); 
            }
            20% { 
                opacity: 1; 
                transform: translateX(-50%) translateY(0) scale(1); 
            }
            80% { 
                opacity: 1; 
                transform: translateX(-50%) translateY(0) scale(1); 
            }
            100% { 
                opacity: 0; 
                transform: translateX(-50%) translateY(-10px) scale(0.95); 
            }
        }
    `;
    if (!document.querySelector('#slideDownFadeStyle')) {
        style.id = 'slideDownFadeStyle';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 3000);
}

function revealCard(cardNumber) {
    const card = document.querySelector(`.message-card:nth-child(${cardNumber})`);
    card.classList.toggle('flipped');
    
    // Add a little celebration effect
    createMiniSparkles(card);
}

function heartClick(heart) {
    // Create multiple floating hearts
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const floatingHeart = document.createElement('div');
            floatingHeart.innerHTML = ['💖', '💝', '💕', '💗'][Math.floor(Math.random() * 4)];
            floatingHeart.style.position = 'fixed';
            
            const rect = heart.getBoundingClientRect();
            floatingHeart.style.left = (rect.left + Math.random() * 20) + 'px';
            floatingHeart.style.top = (rect.top + Math.random() * 20) + 'px';
            floatingHeart.style.fontSize = '1.5rem';
            floatingHeart.style.animation = 'floatUp 2s ease-out forwards';
            floatingHeart.style.pointerEvents = 'none';
            floatingHeart.style.zIndex = '1000';
            
            document.body.appendChild(floatingHeart);
            
            setTimeout(() => {
                if (floatingHeart.parentNode) {
                    floatingHeart.parentNode.removeChild(floatingHeart);
                }
            }, 2000);
        }, i * 200);
    }
}

function createSparkles() {
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.position = 'absolute';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.fontSize = Math.random() * 20 + 15 + 'px';
            sparkle.style.animation = 'sparkle 2s ease-out forwards';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '1000';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 2000);
        }, i * 150);
    }
}

function createFloatingPhotos() {
    const emojis = ['📷', '🎭', '🎪', '🎨', '🎵', '🌟'];
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const photo = document.createElement('div');
            photo.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
            photo.style.position = 'absolute';
            photo.style.left = Math.random() * 100 + '%';
            photo.style.top = Math.random() * 100 + '%';
            photo.style.fontSize = Math.random() * 15 + 20 + 'px';
            photo.style.animation = 'float 3s ease-in-out forwards';
            photo.style.pointerEvents = 'none';
            photo.style.zIndex = '999';
            
            document.body.appendChild(photo);
            
            setTimeout(() => {
                if (photo.parentNode) {
                    photo.parentNode.removeChild(photo);
                }
            }, 3000);
        }, i * 200);
    }
}

function createShootingStars() {
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.innerHTML = '⭐';
            star.style.position = 'absolute';
            star.style.left = '-50px';
            star.style.top = Math.random() * 50 + 20 + '%';
            star.style.fontSize = Math.random() * 10 + 15 + 'px';
            star.style.animation = 'shootingStar 2s linear forwards';
            star.style.pointerEvents = 'none';
            star.style.zIndex = '999';
            
            // Add shooting star animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes shootingStar {
                    0% { 
                        transform: translateX(0) rotate(0deg); 
                        opacity: 0; 
                    }
                    20% { 
                        opacity: 1; 
                    }
                    80% { 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateX(calc(100vw + 100px)) rotate(360deg); 
                        opacity: 0; 
                    }
                }
            `;
            if (!document.querySelector('#shootingStarStyle')) {
                style.id = 'shootingStarStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(star);
            
            setTimeout(() => {
                if (star.parentNode) {
                    star.parentNode.removeChild(star);
                }
            }, 2000);
        }, i * 300);
    }
}

function createMiniSparkles(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.position = 'fixed';
            sparkle.style.left = (rect.left + rect.width/2 + (Math.random() - 0.5) * 100) + 'px';
            sparkle.style.top = (rect.top + rect.height/2 + (Math.random() - 0.5) * 100) + 'px';
            sparkle.style.fontSize = '15px';
            sparkle.style.animation = 'sparkle 1.5s ease-out forwards';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '1001';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1500);
        }, i * 100);
    }
}

// Add some subtle interactions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation buttons
    updateNavigationButtons();
    
    // Show persistent welcome overlay with play button
    setTimeout(() => {
        showWelcomeOverlay();
    }, 1000); // Small delay to ensure page is fully loaded
    
    // Add click ripple effect to button
    const button = document.querySelector('.surprise-btn');
    
    if (button) {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.position = 'absolute';
            ripple.style.width = size + 'px';
            ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.background = 'rgba(255,255,255,0.5)';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    }

    // Add some extra interactive effects
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        heart.addEventListener('click', function() {
            // Create a floating heart effect
            const floatingHeart = document.createElement('div');
            floatingHeart.innerHTML = '💖';
            floatingHeart.style.position = 'absolute';
            floatingHeart.style.left = heart.getBoundingClientRect().left + 'px';
            floatingHeart.style.top = heart.getBoundingClientRect().top + 'px';
            floatingHeart.style.fontSize = '1.5rem';
            floatingHeart.style.animation = 'floatUp 2s ease-out forwards';
            floatingHeart.style.pointerEvents = 'none';
            floatingHeart.style.zIndex = '1000';
            
            // Add floating animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes floatUp {
                    0% { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translateY(-100px) scale(1.5); 
                    }
                }
            `;
            if (!document.querySelector('#floatUpStyle')) {
                style.id = 'floatUpStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(floatingHeart);
            
            setTimeout(() => {
                if (floatingHeart.parentNode) {
                    floatingHeart.parentNode.removeChild(floatingHeart);
                }
            }, 2000);
        });
    });
=======
// Global music state
let isGlobalMusicPlaying = false;
let currentGlobalSong = 1;

function toggleGlobalMusic() {
    const btn = document.getElementById('globalPlayStopBtn');
    const icon = document.getElementById('musicIcon');
    const text = document.getElementById('musicText');
    
    if (isGlobalMusicPlaying) {
        // Pause music (remember position)
        pauseCurrentMusic();
        isGlobalMusicPlaying = false;
        icon.textContent = '🎵';
        text.textContent = 'Play Music';
        btn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
    } else {
        // Resume or start music
        resumeOrStartMusic();
        isGlobalMusicPlaying = true;
        icon.textContent = '⏸️';
        text.textContent = 'Pause Music';
        btn.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e8e)';
    }
}

function pauseCurrentMusic() {
    if (window.currentAudio) {
        window.currentAudio.pause();
        // Don't reset currentTime to preserve position
        console.log(`Music paused at ${window.currentAudio.currentTime}s`);
        
        // Update song item display
        if (window.currentSongItem) {
            window.currentSongItem.classList.remove('playing');
            window.currentSongItem.setAttribute('data-playing', 'paused');
        }
        
        // Keep the song title but indicate it's paused
        const currentInfo = document.getElementById('currentSongTitle').textContent;
        if (currentInfo.includes('♪')) {
            updateCurrentSongInfo(currentInfo.replace('♪', '⏸'));
        }
    }
}

function resumeOrStartMusic() {
    if (window.currentAudio && window.currentAudio.paused) {
        // Resume existing audio from where it was paused
        console.log(`Resuming music from ${window.currentAudio.currentTime}s`);
        window.currentAudio.play().then(() => {
            // Update song item display
            if (window.currentSongItem) {
                window.currentSongItem.classList.add('playing');
                window.currentSongItem.setAttribute('data-playing', 'true');
            }
            
            // Update song info display
            const currentInfo = document.getElementById('currentSongTitle').textContent;
            if (currentInfo.includes('⏸')) {
                updateCurrentSongInfo(currentInfo.replace('⏸', '♪'));
            }
            
            // Restart progress tracking
            clearProgressTracking();
            initializeProgressTracking();
        }).catch(error => {
            console.error('Error resuming music:', error);
        });
    } else {
        // Start new music
        playSong(currentGlobalSong);
    }
}

function startGlobalMusic() {
    // Start with the first song
    playSong(currentGlobalSong);
}

function updateCurrentSongInfo(songInfo) {
    const songInfoElement = document.getElementById('currentSongTitle');
    if (songInfoElement) {
        songInfoElement.textContent = songInfo;
    }
}

function nextSong() {
    const totalSongs = 5; // Update this if you add more songs
    if (currentGlobalSong < totalSongs) {
        currentGlobalSong++;
    } else {
        currentGlobalSong = 1; // Loop back to first song
    }
    
    if (isGlobalMusicPlaying || window.currentAudio) {
        playSong(currentGlobalSong);
    }
    
    updateNavigationButtons();
}

function previousSong() {
    const totalSongs = 5; // Update this if you add more songs
    if (currentGlobalSong > 1) {
        currentGlobalSong--;
    } else {
        currentGlobalSong = totalSongs; // Loop to last song
    }
    
    if (isGlobalMusicPlaying || window.currentAudio) {
        playSong(currentGlobalSong);
    }
    
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const totalSongs = 5;
    
    // Enable/disable buttons based on position (optional - remove if you want looping)
    // For now, keep buttons always enabled since we're looping
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
}

function autoPlayNextSong() {
    // Only auto-play if music was actually playing (not if user manually stopped)
    if (isGlobalMusicPlaying) {
        const totalSongs = 5; // Update this if you add more songs
        
        // Move to next song
        if (currentGlobalSong < totalSongs) {
            currentGlobalSong++;
        } else {
            currentGlobalSong = 1; // Loop back to first song
        }
        
        // Small delay for smoother transition
        setTimeout(() => {
            console.log(`Auto-playing next song: ${currentGlobalSong}`);
            playSong(currentGlobalSong);
        }, 500);
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateProgressBar() {
    if (window.currentAudio) {
        const currentTime = window.currentAudio.currentTime;
        const duration = window.currentAudio.duration;
        
        const progressFill = document.getElementById('progressFill');
        const currentTimeDisplay = document.getElementById('currentTime');
        const totalTimeDisplay = document.getElementById('totalTime');
        
        if (progressFill && currentTimeDisplay && totalTimeDisplay) {
            const progress = (currentTime / duration) * 100;
            progressFill.style.width = `${progress}%`;
            
            currentTimeDisplay.textContent = formatTime(currentTime);
            totalTimeDisplay.textContent = formatTime(duration);
        }
    }
}

function seekToPosition(event) {
    if (window.currentAudio) {
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const progressBarWidth = rect.width;
        const clickPosition = clickX / progressBarWidth;
        
        const newTime = clickPosition * window.currentAudio.duration;
        window.currentAudio.currentTime = newTime;
        
        updateProgressBar();
    }
}

function initializeProgressTracking() {
    if (window.currentAudio) {
        // Update progress bar every 100ms
        window.progressInterval = setInterval(updateProgressBar, 100);
        
        // Update duration when metadata is loaded
        window.currentAudio.addEventListener('loadedmetadata', () => {
            updateProgressBar();
        });
        
        // Clear interval when song ends
        window.currentAudio.addEventListener('ended', () => {
            if (window.progressInterval) {
                clearInterval(window.progressInterval);
                window.progressInterval = null;
            }
            resetProgressBar();
        });
    }
}

function resetProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const currentTimeDisplay = document.getElementById('currentTime');
    const totalTimeDisplay = document.getElementById('totalTime');
    
    if (progressFill) progressFill.style.width = '0%';
    if (currentTimeDisplay) currentTimeDisplay.textContent = '0:00';
    if (totalTimeDisplay) totalTimeDisplay.textContent = '0:00';
}

function clearProgressTracking() {
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
        window.progressInterval = null;
    }
}

// Override the existing playSong function to update global controls
const originalPlaySong = window.playSong || function() {};

function hideAllMessages() {
    const messages = [
        'surpriseMessage',
        'memoryMessage', 
        'wishMessage',
        'gratitudeMessage',
        'journeyMessage',
        'futureMessage',
        'playlistMessage'
    ];
    
    messages.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                element.style.display = 'none';
            }, 300); // Wait for fade out animation
        }
    });
    
    // Remove active state from all buttons
    const buttons = document.querySelectorAll('.surprise-btn, .memory-btn, .wish-btn, .gratitude-btn, .journey-btn, .future-btn, .playlist-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
}

function setActiveButton(buttonClass) {
    const button = document.querySelector(`.${buttonClass}`);
    if (button) {
        button.classList.add('active');
    }
}

function closeAllMessages() {
    hideAllMessages();
}

function showSurprise() {
    hideAllMessages();
    setActiveButton('surprise-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("surpriseMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        createSparkles();
    }, 350);
}

function showMemories() {
    hideAllMessages();
    setActiveButton('memory-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("memoryMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        createFloatingPhotos();
    }, 350);
}

function showWishes() {
    hideAllMessages();
    setActiveButton('wish-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("wishMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        createShootingStars();
    }, 350);
}

function showGratitude() {
    hideAllMessages();
    setActiveButton('gratitude-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("gratitudeMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        createGratitudeAnimation();
    }, 350);
}

function showJourney() {
    hideAllMessages();
    setActiveButton('journey-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("journeyMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        animateTimeline();
    }, 350);
}

function showFuture() {
    hideAllMessages();
    setActiveButton('future-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("futureMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        animateWishList();
    }, 350);
}

function showPlaylist() {
    hideAllMessages();
    setActiveButton('playlist-btn');
    
    setTimeout(() => {
        const msg = document.getElementById("playlistMessage");
        msg.style.display = 'block';
        setTimeout(() => {
            msg.classList.add('show');
        }, 50);
        createMusicNotes();
    }, 350);
}

function playSong(songNumber) {
    // Only stop if playing a different song, otherwise just resume current
    const songs = [
        { title: "Malay Ko", file: "malayKo.mp3", message: "🎵 For the regret, longing and hoping for a chance in love. 🎶" },
        { title: "Burnout", file: "burnout.mp3", message: "🎶 Every note brings back beautiful moments we shared! 🌟" },
        { title: "Hirap Kalimutan", file: "hirapKalimutan.mp3", message: "🎶 The soundtrack to our amazing bond! 🤝" },
        { title: "Shot Puno", file: "shotPuno.mp3", message: "🎵 A melody of gratitude for your friendship! 💝" },
        { title: "Ikaw At Ako", file: "ikawAtaAko.mp3", message: "🎵 Here's to your bright future ahead! 🚀" }
    ];
    
    const song = songs[songNumber - 1];
    
    // If same song and audio exists, just resume
    // Use a dedicated index variable (window.currentAudioSongIndex) so we compare
    // against the actual audio object instead of the mutable global currentGlobalSong.
    if (window.currentAudio && window.currentAudioSongIndex === songNumber && window.currentAudio.paused) {
        console.log(`Resuming ${song.title} from ${window.currentAudio.currentTime}s`);
        window.currentAudio.play().catch(error => {
            console.error('Error resuming music:', error);
        });
        return;
    }
    
    // Stop all currently playing audio for new song
    stopAllMusic();
    
    const songItem = document.querySelector(`.song-item:nth-child(${songNumber})`);
    
    // Create audio element with improved settings
    const audio = new Audio();
    audio.src = `assets/music/${song.file}`;
    audio.preload = 'auto';
    audio.volume = document.getElementById('volumeSlider').value / 100;
    
    // Store reference to currently playing audio and its song index
    window.currentAudio = audio;
    window.currentAudioSongIndex = songNumber;
    window.currentSongItem = songItem;
    
    // Set up event listeners with better debugging
    audio.addEventListener('loadstart', () => {
        console.log(`Loading ${song.title}... (${song.file})`);
    });
    
    audio.addEventListener('canplay', () => {
        console.log(`${song.title} is ready to play`);
    });
    
    audio.addEventListener('loadeddata', () => {
        console.log(`${song.title} data loaded successfully`);
    });
    
    audio.addEventListener('error', (e) => {
        console.error(`Error loading ${song.file}:`, e);
        console.error('Error details:', {
            error: e.target.error,
            src: e.target.src,
            networkState: e.target.networkState,
            readyState: e.target.readyState
        });
        if (songItem) {
            songItem.classList.remove('playing');
            songItem.setAttribute('data-playing', 'false');
        }
    });
    
    audio.addEventListener('ended', () => {
        if (songItem) {
            songItem.classList.remove('playing');
            songItem.setAttribute('data-playing', 'false');
        }
        
        // Auto-play next song
        autoPlayNextSong();
    });
    
    // Try to play the audio with better error handling
    console.log(`Attempting to play: ${song.title} (${audio.src})`);
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log(`Successfully playing: ${song.title}`);
            if (songItem) {
                songItem.classList.add('playing');
                songItem.setAttribute('data-playing', 'true');
            }
            
            // Update global music controls
            updateCurrentSongInfo(`♪ ${song.title}`);
            isGlobalMusicPlaying = true;
            currentGlobalSong = songNumber;
            const btn = document.getElementById('globalPlayStopBtn');
            const icon = document.getElementById('musicIcon');
            const text = document.getElementById('musicText');
            if (btn && icon && text) {
                icon.textContent = '⏸️';
                text.textContent = 'Pause Music';
                btn.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e8e)';
            }
            
            // Update navigation buttons
            updateNavigationButtons();
            
            // Initialize progress tracking
            clearProgressTracking(); // Clear any existing intervals
            initializeProgressTracking();
            
            createMusicWaves();
            createDancingNotes();
            
        }).catch((error) => {
            console.error(`Could not play ${song.file}:`, error);
            if (error.name === 'NotAllowedError') {
                console.log(`${song.title} needs user interaction to play.`);
            } else {
                console.error(`Error playing ${song.title}:`, error);
            }
        });
    }
}

function stopAllMusic() {
    // Clear progress tracking
    clearProgressTracking();
    resetProgressBar();
    
    // Stop currently playing audio and reset position
    if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio.currentTime = 0; // Reset to beginning
        window.currentAudio = null; // Clear reference for complete stop
        window.currentAudioSongIndex = null;
    }
    
    // Remove playing class from all song items
    const allSongItems = document.querySelectorAll('.song-item');
    allSongItems.forEach(item => {
        item.classList.remove('playing');
        item.setAttribute('data-playing', 'false');
    });
    
    window.currentSongItem = null;
    
    // Update global music controls to stopped state
    isGlobalMusicPlaying = false;
    updateCurrentSongInfo('No song playing');
    const btn = document.getElementById('globalPlayStopBtn');
    const icon = document.getElementById('musicIcon');
    const text = document.getElementById('musicText');
    if (btn && icon && text) {
        icon.textContent = '🎵';
        text.textContent = 'Play Music';
        btn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
    }
}

function setVolume(volume) {
    if (window.currentAudio) {
        window.currentAudio.volume = volume / 100;
    }
}

function findTreasure(treasureNumber) {
    const treasures = [
        {
            title: "Secret Message",
            content: "🗝️ Here's a secret: You are one of the most genuine and wonderful people I know. Never change! ✨"
        },
        {
            title: "Special Quote",
            content: "💎 \"Friendship is the only cement that will ever hold the world together.\" - You've been that cement in my life! 🌍"
        },
        {
            title: "Digital Hug",
            content: '<div class="digital-hug">🤗</div><p>Sending you the biggest, warmest virtual hug! Feel the love! 💕</p>'
        },
        {
            title: "Surprise Fact",
            content: "🌟 Did you know? You've made me smile exactly 10,000 times over the years (yes, I counted in my heart)! 😊"
        }
    ];
    
    const treasure = treasures[treasureNumber - 1];
    const display = document.getElementById("treasureDisplay");
    
    display.innerHTML = `
        <h4>${treasure.title}</h4>
        ${treasure.content}
    `;
    
    display.classList.add('show');
    createTreasureEffect();
}

function createGratitudeAnimation() {
    const hearts = ['💖', '💝', '💕', '💗', '💙', '💚', '💛', '🧡', '💜'];
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.position = 'absolute';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.top = Math.random() * 100 + '%';
            heart.style.fontSize = Math.random() * 15 + 20 + 'px';
            heart.style.animation = 'float 3s ease-in-out forwards';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '999';
            
            document.body.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 3000);
        }, i * 200);
    }
}

function animateTimeline() {
    const items = document.querySelectorAll('.timeline-item');
    const stats = document.querySelectorAll('.stat-item');
    
    // Animate timeline items with staggered effect
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.animationDelay = `${index * 0.3}s`;
            item.style.opacity = '1';
            
            // Add a subtle bounce effect
            item.addEventListener('animationend', () => {
                item.style.transform = 'translateY(0)';
            });
            
            // Create floating elements for each timeline item
            createTimelineEffect(item, index);
        }, index * 300);
    });
    
    // Animate stats with counting effect
    setTimeout(() => {
        stats.forEach((stat, index) => {
            setTimeout(() => {
                const number = stat.querySelector('.stat-number');
                if (number.textContent !== '∞' && number.textContent !== '100%') {
                    animateCounter(number, parseInt(number.textContent) || 0);
                } else {
                    stat.style.animation = 'bounce 0.6s ease';
                }
            }, index * 200);
        });
    }, items.length * 300);
    
    // Add journey completion celebration
    setTimeout(() => {
        createJourneyCompletionEffect();
    }, (items.length * 300) + 2000);
}

function createTimelineEffect(item, index) {
    const emojis = ['✨', '🌟', '💫', '⭐', '🎆', '🎉', '💝', '🌈'];
    const emoji = emojis[index % emojis.length];
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const effect = document.createElement('div');
            effect.innerHTML = emoji;
            effect.style.position = 'absolute';
            
            const rect = item.getBoundingClientRect();
            effect.style.left = (rect.left + Math.random() * rect.width) + 'px';
            effect.style.top = (rect.top + Math.random() * rect.height) + 'px';
            effect.style.fontSize = '1.5rem';
            effect.style.animation = 'timelineSparkle 2s ease-out forwards';
            effect.style.pointerEvents = 'none';
            effect.style.zIndex = '999';
            
            // Add timeline sparkle animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes timelineSparkle {
                    0% { 
                        opacity: 0; 
                        transform: translateY(0) scale(0.5) rotate(0deg); 
                    }
                    50% { 
                        opacity: 1; 
                        transform: translateY(-20px) scale(1) rotate(180deg); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translateY(-40px) scale(0.5) rotate(360deg); 
                    }
                }
                
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                }
            `;
            if (!document.querySelector('#timelineSparkleStyle')) {
                style.id = 'timelineSparkleStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(effect);
            
            setTimeout(() => {
                if (effect.parentNode) {
                    effect.parentNode.removeChild(effect);
                }
            }, 2000);
        }, i * 300);
    }
}

function animateCounter(element, target) {
    let current = 0;
    const increment = Math.ceil(target / 30);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
            element.style.animation = 'bounce 0.6s ease';
        }
        element.textContent = current;
    }, 50);
}

function createJourneyCompletionEffect() {
    // Create a celebration burst
    const celebrationEmojis = ['🎉', '🎊', '🥳', '🎈', '🎆', '✨', '🌟', '💫', '🎭', '🎪'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.innerHTML = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
            emoji.style.position = 'fixed';
            emoji.style.left = Math.random() * 100 + '%';
            emoji.style.top = '-50px';
            emoji.style.fontSize = Math.random() * 20 + 25 + 'px';
            emoji.style.animation = 'celebrationFall 3s ease-in forwards';
            emoji.style.pointerEvents = 'none';
            emoji.style.zIndex = '1000';
            
            // Add celebration fall animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes celebrationFall {
                    0% { 
                        transform: translateY(-50px) rotate(0deg); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateY(calc(100vh + 50px)) rotate(720deg); 
                        opacity: 0.7; 
                    }
                }
            `;
            if (!document.querySelector('#celebrationFallStyle')) {
                style.id = 'celebrationFallStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(emoji);
            
            setTimeout(() => {
                if (emoji.parentNode) {
                    emoji.parentNode.removeChild(emoji);
                }
            }, 3000);
        }, i * 150);
    }
    
    // Show a completion message - centered
    setTimeout(() => {
        const messageEl = document.createElement('div');
        messageEl.innerHTML = "🎉 What an incredible journey we've shared! Thank you for being such an amazing part of my life story! 💝";
        messageEl.style.position = 'fixed';
        messageEl.style.top = '50%';
        messageEl.style.left = '50%';
        messageEl.style.transform = 'translate(-50%, -50%)';
        messageEl.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        messageEl.style.color = 'white';
        messageEl.style.padding = '20px 30px';
        messageEl.style.borderRadius = '15px';
        messageEl.style.fontSize = '1.2rem';
        messageEl.style.textAlign = 'center';
        messageEl.style.zIndex = '1500';
        messageEl.style.maxWidth = '80%';
        messageEl.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        messageEl.style.animation = 'centerFadeIn 4s ease-in-out forwards';
        
        // Add center fade animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes centerFadeIn {
                0% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.8); 
                }
                20% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1); 
                }
                80% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1); 
                }
                100% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.9); 
                }
            }
        `;
        if (!document.querySelector('#centerFadeInStyle')) {
            style.id = 'centerFadeInStyle';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 10000);
    }, 1000);
}

function animateWishList() {
    const wishes = document.querySelectorAll('.wish-item');
    wishes.forEach((wish, index) => {
        wish.style.opacity = '0';
        wish.style.transform = 'translateX(-50px)';
        
        setTimeout(() => {
            wish.style.transition = 'all 0.5s ease';
            wish.style.opacity = '1';
            wish.style.transform = 'translateX(0)';
        }, index * 200);
    });
}

function createMusicNotes() {
    const notes = ['🎵', '🎶', '🎼', '🎤', '🎸', '🎺', '🎷', '🎹'];
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const note = document.createElement('div');
            note.innerHTML = notes[Math.floor(Math.random() * notes.length)];
            note.style.position = 'absolute';
            note.style.left = Math.random() * 100 + '%';
            note.style.top = Math.random() * 100 + '%';
            note.style.fontSize = Math.random() * 10 + 20 + 'px';
            note.style.animation = 'float 2s ease-in-out forwards';
            note.style.pointerEvents = 'none';
            note.style.zIndex = '999';
            
            document.body.appendChild(note);
            
            setTimeout(() => {
                if (note.parentNode) {
                    note.parentNode.removeChild(note);
                }
            }, 2000);
        }, i * 150);
    }
}

function createDancingNotes() {
    const notes = ['🎵', '🎶', '🎼', '♪', '♫', '♬'];
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const note = document.createElement('div');
            note.innerHTML = notes[Math.floor(Math.random() * notes.length)];
            note.style.position = 'fixed';
            note.style.left = Math.random() * 100 + '%';
            note.style.top = '100%';
            note.style.fontSize = Math.random() * 15 + 20 + 'px';
            note.style.animation = 'danceUp 3s ease-out forwards';
            note.style.pointerEvents = 'none';
            note.style.zIndex = '999';
            note.style.color = `hsl(${Math.random() * 360}, 70%, 70%)`;
            
            // Add dancing animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes danceUp {
                    0% { 
                        transform: translateY(0) rotate(0deg) scale(1); 
                        opacity: 1; 
                    }
                    25% { 
                        transform: translateY(-25vh) rotate(90deg) scale(1.2); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: translateY(-50vh) rotate(180deg) scale(0.8); 
                        opacity: 0.8; 
                    }
                    75% { 
                        transform: translateY(-75vh) rotate(270deg) scale(1.1); 
                        opacity: 0.6; 
                    }
                    100% { 
                        transform: translateY(-100vh) rotate(360deg) scale(0.5); 
                        opacity: 0; 
                    }
                }
            `;
            if (!document.querySelector('#danceUpStyle')) {
                style.id = 'danceUpStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(note);
            
            setTimeout(() => {
                if (note.parentNode) {
                    note.parentNode.removeChild(note);
                }
            }, 3000);
        }, i * 300);
    }
}

// Enhanced music waves with more variety
function createMusicWaves() {
    const waves = ['〰️', '〜', '～', '⚡', '💫'];
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const wave = document.createElement('div');
            wave.innerHTML = waves[Math.floor(Math.random() * waves.length)];
            wave.style.position = 'absolute';
            wave.style.left = Math.random() * 100 + '%';
            wave.style.top = Math.random() * 100 + '%';
            wave.style.fontSize = Math.random() * 15 + 20 + 'px';
            wave.style.animation = 'musicWave 2s ease-in-out forwards';
            wave.style.pointerEvents = 'none';
            wave.style.zIndex = '999';
            wave.style.color = `hsl(${Math.random() * 360}, 60%, 80%)`;
            
            // Add music wave animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes musicWave {
                    0% { 
                        transform: translateX(0) scale(1) rotate(0deg); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: translateX(${Math.random() * 200 - 100}px) scale(1.5) rotate(180deg); 
                        opacity: 0.8; 
                    }
                    100% { 
                        transform: translateX(${Math.random() * 300 - 150}px) scale(0.5) rotate(360deg); 
                        opacity: 0; 
                    }
                }
            `;
            if (!document.querySelector('#musicWaveStyle')) {
                style.id = 'musicWaveStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(wave);
            
            setTimeout(() => {
                if (wave.parentNode) {
                    wave.parentNode.removeChild(wave);
                }
            }, 2000);
        }, i * 200);
    }
}

function createTreasureEffect() {
    const gems = ['💎', '💍', '👑', '🏆', '⭐', '✨', '🌟'];
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const gem = document.createElement('div');
            gem.innerHTML = gems[Math.floor(Math.random() * gems.length)];
            gem.style.position = 'absolute';
            gem.style.left = Math.random() * 100 + '%';
            gem.style.top = Math.random() * 100 + '%';
            gem.style.fontSize = Math.random() * 15 + 20 + 'px';
            gem.style.animation = 'sparkle 2s ease-out forwards';
            gem.style.pointerEvents = 'none';
            gem.style.zIndex = '1000';
            
            document.body.appendChild(gem);
            
            setTimeout(() => {
                if (gem.parentNode) {
                    gem.parentNode.removeChild(gem);
                }
            }, 2000);
        }, i * 150);
    }
}

function showWelcomeOverlay() {
    // Create welcome overlay
    const overlay = document.createElement('div');
    overlay.id = 'welcomeOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0, 0, 0, 0.9)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '3000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease-in-out';
    
    // Create welcome message content
    const content = document.createElement('div');
    content.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    content.style.color = 'white';
    content.style.padding = '40px';
    content.style.borderRadius = '20px';
    content.style.textAlign = 'center';
    content.style.maxWidth = '500px';
    content.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.4)';
    content.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    content.style.backdropFilter = 'blur(10px)';
    
    content.innerHTML = `
        <h2 style="margin-bottom: 20px; font-size: 2rem; font-weight: 700;">🎵 Welcome to Our Memory Lane 🎵</h2>
        <p style="margin-bottom: 30px; font-size: 1.1rem; line-height: 1.6;">songs that remind me of all the beautiful moments we've shared.</p>
        <button id="welcomePlayButton" style="
            background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
            transition: all 0.3s ease;
            outline: none;
        ">▶️ Start the Memory Playlist</button>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Fade in the overlay
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);
    
    // Add hover effect to play button
    const playButton = content.querySelector('#welcomePlayButton');
    playButton.addEventListener('mouseenter', () => {
        playButton.style.transform = 'scale(1.05)';
        playButton.style.boxShadow = '0 10px 25px rgba(255, 107, 107, 0.6)';
    });
    
    playButton.addEventListener('mouseleave', () => {
        playButton.style.transform = 'scale(1)';
        playButton.style.boxShadow = '0 8px 20px rgba(255, 107, 107, 0.4)';
    });
    
    // Handle play button click
    playButton.addEventListener('click', () => {
        startMemoryPlaylist();
        closeWelcomeOverlay();
    });
}

function closeWelcomeOverlay() {
    const overlay = document.getElementById('welcomeOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 500);
    }
}

function startMemoryPlaylist() {
    // Show the playlist message first, then wait for it to fully appear before starting music
    showPlaylist();
    
    // Wait longer before starting the song to avoid message overlap
    setTimeout(() => {
        playSong(1);
    }, 800);
}

function createFloatingMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.innerHTML = message;
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translateX(-50%)';
    messageEl.style.background = 'rgba(0, 0, 0, 0.85)';
    messageEl.style.color = 'white';
    messageEl.style.padding = '15px 25px';
    messageEl.style.borderRadius = '15px';
    messageEl.style.fontSize = '1rem';
    messageEl.style.textAlign = 'center';
    messageEl.style.zIndex = '1500';
    messageEl.style.maxWidth = '80%';
    messageEl.style.animation = 'slideDownFade 3s ease-in-out forwards';
    
    // Add slide down fade animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDownFade {
            0% { 
                opacity: 0; 
                transform: translateX(-50%) translateY(-20px) scale(0.9); 
            }
            20% { 
                opacity: 1; 
                transform: translateX(-50%) translateY(0) scale(1); 
            }
            80% { 
                opacity: 1; 
                transform: translateX(-50%) translateY(0) scale(1); 
            }
            100% { 
                opacity: 0; 
                transform: translateX(-50%) translateY(-10px) scale(0.95); 
            }
        }
    `;
    if (!document.querySelector('#slideDownFadeStyle')) {
        style.id = 'slideDownFadeStyle';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 3000);
}

function revealCard(cardNumber) {
    const card = document.querySelector(`.message-card:nth-child(${cardNumber})`);
    card.classList.toggle('flipped');
    
    // Add a little celebration effect
    createMiniSparkles(card);
}

function heartClick(heart) {
    // Create multiple floating hearts
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const floatingHeart = document.createElement('div');
            floatingHeart.innerHTML = ['💖', '💝', '💕', '💗'][Math.floor(Math.random() * 4)];
            floatingHeart.style.position = 'fixed';
            
            const rect = heart.getBoundingClientRect();
            floatingHeart.style.left = (rect.left + Math.random() * 20) + 'px';
            floatingHeart.style.top = (rect.top + Math.random() * 20) + 'px';
            floatingHeart.style.fontSize = '1.5rem';
            floatingHeart.style.animation = 'floatUp 2s ease-out forwards';
            floatingHeart.style.pointerEvents = 'none';
            floatingHeart.style.zIndex = '1000';
            
            document.body.appendChild(floatingHeart);
            
            setTimeout(() => {
                if (floatingHeart.parentNode) {
                    floatingHeart.parentNode.removeChild(floatingHeart);
                }
            }, 2000);
        }, i * 200);
    }
}

function createSparkles() {
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.position = 'absolute';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.fontSize = Math.random() * 20 + 15 + 'px';
            sparkle.style.animation = 'sparkle 2s ease-out forwards';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '1000';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 2000);
        }, i * 150);
    }
}

function createFloatingPhotos() {
    const emojis = ['📷', '🎭', '🎪', '🎨', '🎵', '🌟'];
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const photo = document.createElement('div');
            photo.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
            photo.style.position = 'absolute';
            photo.style.left = Math.random() * 100 + '%';
            photo.style.top = Math.random() * 100 + '%';
            photo.style.fontSize = Math.random() * 15 + 20 + 'px';
            photo.style.animation = 'float 3s ease-in-out forwards';
            photo.style.pointerEvents = 'none';
            photo.style.zIndex = '999';
            
            document.body.appendChild(photo);
            
            setTimeout(() => {
                if (photo.parentNode) {
                    photo.parentNode.removeChild(photo);
                }
            }, 3000);
        }, i * 200);
    }
}

function createShootingStars() {
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.innerHTML = '⭐';
            star.style.position = 'absolute';
            star.style.left = '-50px';
            star.style.top = Math.random() * 50 + 20 + '%';
            star.style.fontSize = Math.random() * 10 + 15 + 'px';
            star.style.animation = 'shootingStar 2s linear forwards';
            star.style.pointerEvents = 'none';
            star.style.zIndex = '999';
            
            // Add shooting star animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes shootingStar {
                    0% { 
                        transform: translateX(0) rotate(0deg); 
                        opacity: 0; 
                    }
                    20% { 
                        opacity: 1; 
                    }
                    80% { 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateX(calc(100vw + 100px)) rotate(360deg); 
                        opacity: 0; 
                    }
                }
            `;
            if (!document.querySelector('#shootingStarStyle')) {
                style.id = 'shootingStarStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(star);
            
            setTimeout(() => {
                if (star.parentNode) {
                    star.parentNode.removeChild(star);
                }
            }, 2000);
        }, i * 300);
    }
}

function createMiniSparkles(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.position = 'fixed';
            sparkle.style.left = (rect.left + rect.width/2 + (Math.random() - 0.5) * 100) + 'px';
            sparkle.style.top = (rect.top + rect.height/2 + (Math.random() - 0.5) * 100) + 'px';
            sparkle.style.fontSize = '15px';
            sparkle.style.animation = 'sparkle 1.5s ease-out forwards';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '1001';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1500);
        }, i * 100);
    }
}

// Add some subtle interactions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation buttons
    updateNavigationButtons();
    
    // Show persistent welcome overlay with play button
    setTimeout(() => {
        showWelcomeOverlay();
    }, 1000); // Small delay to ensure page is fully loaded
    
    // Add click ripple effect to button
    const button = document.querySelector('.surprise-btn');
    
    if (button) {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.position = 'absolute';
            ripple.style.width = size + 'px';
            ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.background = 'rgba(255,255,255,0.5)';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    }

    // Add some extra interactive effects
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        heart.addEventListener('click', function() {
            // Create a floating heart effect
            const floatingHeart = document.createElement('div');
            floatingHeart.innerHTML = '💖';
            floatingHeart.style.position = 'absolute';
            floatingHeart.style.left = heart.getBoundingClientRect().left + 'px';
            floatingHeart.style.top = heart.getBoundingClientRect().top + 'px';
            floatingHeart.style.fontSize = '1.5rem';
            floatingHeart.style.animation = 'floatUp 2s ease-out forwards';
            floatingHeart.style.pointerEvents = 'none';
            floatingHeart.style.zIndex = '1000';
            
            // Add floating animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes floatUp {
                    0% { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translateY(-100px) scale(1.5); 
                    }
                }
            `;
            if (!document.querySelector('#floatUpStyle')) {
                style.id = 'floatUpStyle';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(floatingHeart);
            
            setTimeout(() => {
                if (floatingHeart.parentNode) {
                    floatingHeart.parentNode.removeChild(floatingHeart);
                }
            }, 2000);
        });
    });
>>>>>>> 952c6fbc9b1fbdf248f8f4fdf70a90ad87a55e10
});