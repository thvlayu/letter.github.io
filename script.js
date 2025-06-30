document.addEventListener('DOMContentLoaded', () => {
    window.macHasBeenClickedAndMoved = false; // Flag for click interaction

    const mainViewWrapper = document.getElementById('main-view-wrapper');
    const macintoshContainer = document.getElementById('macintosh-container');
    // const screenContentWrapper = document.getElementById('screen-content-wrapper'); // Already commented out
    const questionMarksContainer = document.getElementById('question-marks-container');
    const questionMarks = document.querySelectorAll('.question-mark');
    const macImage = document.getElementById("macintosh-image"); // Defined for wider scope
    const screenContainer = document.querySelector('.screen-container');
    
    // Desktop UI elements
    const desktopUI = document.getElementById('desktop-ui');
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    const iconContextMenu = document.getElementById('icon-context-menu');
    const desktopContextMenu = document.getElementById('desktop-context-menu');
    const bgImageInput = document.getElementById('background-image-input');
    const sessionTimeEl = document.getElementById('session-time');
    const logOffBtn = document.getElementById('log-off-btn');
    const dateTimeEl = document.getElementById('date-time');
    const crtToggleBtn = document.getElementById('crt-toggle');

    // Music Player Elements
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const nextTrackBtn = document.getElementById('next-track-btn');
    const prevTrackBtn = document.getElementById('prev-track-btn');
    const seekSlider = document.getElementById('seek-slider');
    const currentTimeEl = document.getElementById('current-time');
    const totalDurationEl = document.getElementById('total-duration');
    const trackTitleEl = document.querySelector('#music-window .track-title');
    const trackArtistEl = document.querySelector('#music-window .track-artist');
    const albumArtEl = document.querySelector('#music-window .album-art');
    const musicWindow = document.getElementById('music-window');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const musicQueueList = document.querySelector('.music-queue-list');
    const settingsBtn = document.querySelector('.settings-btn');
    const musicMainView = document.querySelector('.music-main-view');
    const musicSettingsView = document.querySelector('.music-settings-view');
    const backToPlayerBtn = document.querySelector('.back-to-player-btn');
    const addMusicBtn = document.querySelector('.add-music-btn');
    const musicFileInput = document.getElementById('music-file-input');

    // Terminal Elements
    const terminalContent = document.getElementById('terminal-content');
    let terminalInput; // Will be dynamically assigned

    // --- System Settings Elements ---
    const systemSettingsEntry = document.getElementById('system-settings-entry');
    const sendLetterBtn = document.getElementById('send-letter-btn');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const recipientInput = document.querySelector('.recipient-input');
    const letterEditor = document.querySelector('.letter-editor');

    // --- Supabase Setup ---
    // IMPORTANT: Replace with your actual Supabase project URL and anon key
    const SUPABASE_URL = 'https://gjypexdjcvhjboozatok.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqeXBleGRqY3ZoamJvb3phdG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjEyODQsImV4cCI6MjA2NjgzNzI4NH0.N-tU8lG8uihs5I-50JRtzLnhrZtza5GQcCbW7pFIpiE';
    let supabase = null;
    try {
        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.error("Supabase client not loaded.");
        }
    } catch (error) {
        console.error("Error initializing Supabase client:", error);
    }

    if (!supabase || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        console.warn("Supabase is not configured. Letter sharing will be disabled.");
    }

    // --- Virtual File System ---
    const virtualFileSystem = {
        '~': {
            type: 'dir',
            children: {
                'README.txt': { type: 'file', content: 'Welcome to my Web-OS! Type "help" for a list of commands.' },
                'Projects': {
                    type: 'dir',
                    children: {
                        'website.js': { type: 'file', content: 'console.log("hello world!");' }
                    }
                }
            }
        }
    };
    let currentDirectory = virtualFileSystem['~'];
    let currentPath = '~';

    let sessionStartTime = null;
    let sessionInterval = null;
    let activeIcon = null; // To track which icon was right-clicked

    let smoother = null;
    let macTimeline = null;
    let crtOnDelay = null;
    let scrollUpDelay = null;
    let fontInterval = null;
    const fonts = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'TestTiemposFine-Light', 'fantasy', 'monospace', 'cursive'];
    let currentFontIndices = [0, 1, 2]; // Initial distinct indices for 3 question marks

    // --- Music Player Logic ---
    let playlist = []; // Playlist will be populated dynamically
    let currentTrackIndex = 0;
    let isPlaying = false;
    let dragStartIndex;

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    async function processFile(file) {
        const jsmediatags = window.jsmediatags;
        return new Promise((resolve) => {
            const fileName = file.name || 'Unknown File';
            jsmediatags.read(file, {
                onSuccess: function(tag) {
                    const { title, artist, picture } = tag.tags;
                    let art = 'https://placehold.co/120x120/000000/FFF?text=Music';
                    if (picture) {
                        const base64String = arrayBufferToBase64(picture.data);
                        art = `data:${picture.format};base64,${base64String}`;
                    }
                    
                    playlist.push({
                        title: title || fileName.replace(/\.[^/.]+$/, ""),
                        artist: artist || 'Unknown Artist',
                        src: URL.createObjectURL(file), // Use blob URL
                        art: art
                    });
                    resolve();
                },
                onError: function(error) {
                    console.error(`Error reading tags for ${fileName}:`, error);
                    playlist.push({
                        title: fileName.replace(/\.[^/.]+$/, ""),
                        artist: 'Unknown Artist',
                        src: URL.createObjectURL(file),
                        art: 'https://placehold.co/120x120/000000/FFF?text=Music'
                    });
                    resolve();
                }
            });
        });
    }

    async function addFilesToPlaylist(files) {
        const wasEmpty = playlist.length === 0;
        const promises = Array.from(files).map(file => processFile(file));
        await Promise.all(promises);
        
        if (wasEmpty && playlist.length > 0) {
            currentTrackIndex = 0;
            loadTrack(currentTrackIndex);
        }
        renderQueue();
    }

    async function initializePlaylist() {
        const defaultMusicFile = 'Assets/music/Sayfalse, TRXVELER, DJ ALIM - DARE.mp3';
        const jsmediatags = window.jsmediatags;

        if (!jsmediatags) {
            console.error("jsmediatags not loaded!");
            loadTrack(0); // Show default empty state
            return;
        }
        
        try {
            const response = await fetch(defaultMusicFile);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const fileBlob = await response.blob();
            // Manually add name property for processFile function
            fileBlob.name = 'Sayfalse, TRXVELER, DJ ALIM - DARE.mp3';
            await processFile(fileBlob);

        } catch (e) {
            console.error('Failed to load default music file:', e);
        }

        loadTrack(0);
    }

    function renderQueue() {
        if (!musicQueueList) return;
        musicQueueList.innerHTML = '';
        playlist.forEach((track, index) => {
            const li = document.createElement('li');
            li.textContent = `${track.artist} - ${track.title}`;
            li.dataset.index = index;
            li.draggable = true;
            if (index === currentTrackIndex) {
                li.classList.add('playing');
            }
            musicQueueList.appendChild(li);
        });
        addQueueEventListeners();
    }

    function loadTrack(trackIndex) {
        if (!audioPlayer || !playlist[trackIndex]) {
            // If playlist is empty or track not found, reset player UI
            if (trackTitleEl) trackTitleEl.textContent = "No Song Playing";
            if (trackArtistEl) trackArtistEl.textContent = "...";
            if (albumArtEl) albumArtEl.style.backgroundImage = `url('https://placehold.co/120x120/000000/FFF?text=Music')`;
            if (audioPlayer) audioPlayer.src = "";
            updateTimeDisplay();
            return;
        }
        const track = playlist[trackIndex];
        audioPlayer.src = track.src;
        if (trackTitleEl) trackTitleEl.textContent = track.title;
        if (trackArtistEl) trackArtistEl.textContent = track.artist;
        if (albumArtEl) albumArtEl.style.backgroundImage = `url('${track.art}')`;

        audioPlayer.load();
        audioPlayer.addEventListener('loadedmetadata', () => {
             if (seekSlider) seekSlider.max = audioPlayer.duration;
             updateTimeDisplay();
        });
        renderQueue(); // Re-render queue to highlight the current track
    }

    function playPauseTrack() {
        if (!audioPlayer || !audioPlayer.src) return;
        if (isPlaying) {
            audioPlayer.pause();
            if (playPauseBtn) playPauseBtn.textContent = '▶️';
        } else {
            audioPlayer.play().catch(e => console.error("Audio play failed.", e));
            if (playPauseBtn) playPauseBtn.textContent = '⏸️';
        }
        isPlaying = !isPlaying;
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) audioPlayer.play();
    }
    
    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) audioPlayer.play();
    }

    function updateSeekSlider() {
        if (!audioPlayer || !seekSlider) return;
        seekSlider.value = audioPlayer.currentTime || 0;
        updateTimeDisplay();
    }

    function seekTo() {
        if (!audioPlayer || !seekSlider) return;
        audioPlayer.currentTime = seekSlider.value;
    }
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateTimeDisplay() {
        if (!audioPlayer || !currentTimeEl || !totalDurationEl) return;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        totalDurationEl.textContent = formatTime(audioPlayer.duration || 0);
    }
    
    if (playPauseBtn) playPauseBtn.addEventListener('click', playPauseTrack);
    if (nextTrackBtn) nextTrackBtn.addEventListener('click', nextTrack);
    if (prevTrackBtn) prevTrackBtn.addEventListener('click', prevTrack);
    if (seekSlider) seekSlider.addEventListener('input', seekTo);
    if (audioPlayer) {
        audioPlayer.addEventListener('timeupdate', updateSeekSlider);
        audioPlayer.addEventListener('ended', nextTrack);
    }

    function updateDateTime() {
        if (!dateTimeEl) return;
        const now = new Date();
        const day = now.toLocaleDateString('en-US', { weekday: 'short' });
        const date = now.getDate();
        const month = now.toLocaleDateString('en-US', { month: 'short' });
        const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
        dateTimeEl.textContent = `${day} ${date} ${month} ${time}`;
    }

    if (crtToggleBtn && screenContainer) {
        crtToggleBtn.addEventListener('click', () => {
            screenContainer.classList.toggle('crt-off');
            crtToggleBtn.classList.toggle('disabled', screenContainer.classList.contains('crt-off'));
            if(crtEffectToggle) crtEffectToggle.checked = !screenContainer.classList.contains('crt-off');
        });
    }

    if (sendLetterBtn) {
        sendLetterBtn.addEventListener('click', async () => {
            if (sendLetterBtn.classList.contains('sent') || sendLetterBtn.disabled) return;

            // Case 1: 'To' field has a recipient. Standard send behavior.
            if (recipientInput.value.trim() !== '') {
                sendLetterBtn.classList.add('sent');
                setTimeout(() => {
                    sendLetterBtn.classList.remove('sent');
                }, 2000);
                console.log(`Sending letter to ${recipientInput.value}`);
                // In the future, you could add logic here to handle sending to a registered user.
                return;
            }

            // Case 2: 'To' field is empty. Create a shareable link via Supabase.
            if (!supabase || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
                alert('This feature is not configured. Please set up Supabase credentials.');
                return;
            }

            const letterContent = letterEditor.value;
            if (!letterContent.trim()) {
                alert('Please write a letter first!');
                return;
            }

            sendLetterBtn.disabled = true;
            sendLetterBtn.querySelector('.send-text').textContent = 'Saving...';
            copyLinkBtn.classList.remove('show');

            try {
                const { data, error } = await supabase
                    .from('letters')
                    .insert([{ content: letterContent }])
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    const shareableLink = `${window.location.origin}${window.location.pathname}?id=${data.id}`;
                    
                    copyLinkBtn.style.display = 'inline-block';
                    setTimeout(() => copyLinkBtn.classList.add('show'), 10);

                    copyLinkBtn.onclick = () => {
                        navigator.clipboard.writeText(shareableLink).then(() => {
                            copyLinkBtn.title = 'Copied!';
                            setTimeout(() => { copyLinkBtn.title = 'Copy link'; }, 2000);
                        }).catch(err => {
                            console.error('Failed to copy link:', err);
                            alert('Failed to copy link.');
                        });
                    };

                    sendLetterBtn.classList.add('sent');
                    sendLetterBtn.querySelector('.send-text').textContent = 'Sent';
                }

            } catch (error) {
                console.error('Error saving letter:', error.message);
                alert('Could not save the letter. Please check the console and your Supabase setup.');
                sendLetterBtn.querySelector('.send-text').textContent = 'Send'; // Reset button text
            } finally {
                // Re-enable the button after a delay, unless it was successful
                if (!sendLetterBtn.classList.contains('sent')) {
                    sendLetterBtn.disabled = false;
                }
            }
        });
    }

    function changeQuestionMarkFonts() {
        if (questionMarks.length === 0 || fonts.length === 0) return;

        const numFonts = fonts.length;
        const numQM = questionMarks.length;

        // Advance indices for each question mark
        for (let i = 0; i < numQM; i++) {
            currentFontIndices[i] = (currentFontIndices[i] + 1) % numFonts;
        }

        // Ensure distinctness if we have enough fonts and question marks to care
        if (numQM > 1 && numFonts >= numQM) {
            for (let i = 0; i < numQM; i++) {
                for (let j = i + 1; j < numQM; j++) {
                    // While font for qm i is same as font for qm j, advance qm j's font
                    while (currentFontIndices[i] === currentFontIndices[j]) {
                        currentFontIndices[j] = (currentFontIndices[j] + 1) % numFonts;
                    }
                }
            }
        }

        questionMarks.forEach((qm, index) => {
            if (currentFontIndices[index] !== undefined) {
                qm.style.fontFamily = fonts[currentFontIndices[index]];
            }
        });
    }

    function startQuestionMarkAnimation() {
        if (questionMarksContainer && gsap) {
            // Set initial distinct fonts
            if (questionMarks.length > 0 && fonts.length > 0) {
                 // Ensure initial indices are valid and distinct
                const numFonts = fonts.length;
                const numQM = questionMarks.length;
                if (numQM > 0 && numFonts > 0) {
                    currentFontIndices = Array.from({ length: numQM }, (_, i) => i % numFonts);
                     // Basic distinctness for initial setup if numQM > 1 and numFonts >= numQM
                    if (numQM > 1 && numFonts >= numQM) {
                        for (let i = 0; i < numQM; i++) {
                            for (let j = i + 1; j < numQM; j++) {
                                while (currentFontIndices[i] === currentFontIndices[j]) {
                                    currentFontIndices[j] = (currentFontIndices[j] + 1) % numFonts;
                                }
                            }
                        }
                    }
                    questionMarks.forEach((qm, index) => {
                        if (currentFontIndices[index] !== undefined) {
                             qm.style.fontFamily = fonts[currentFontIndices[index]];
                        }
                    });
                }
            }

            gsap.to(questionMarksContainer, { opacity: 1, duration: 2, delay: 2 });
            if (fontInterval) clearInterval(fontInterval);
            fontInterval = setInterval(changeQuestionMarkFonts, 700); // Change font every 0.7 seconds
        } else {
            console.warn("GSAP or question mark container not found for animation.");
        }
    }

    function stopQuestionMarkAnimationAndHide() {
        if (fontInterval) clearInterval(fontInterval);
        if (questionMarksContainer && gsap) {
            gsap.to(questionMarksContainer, { 
                opacity: 0, 
                duration: 1, 
                onComplete: () => {
                    if (questionMarksContainer) questionMarksContainer.style.display = 'none';
                } 
            });
        }
    }

    // NEW: Click handler for question marks
    function handleQuestionMarkClick() {
        if (window.macHasBeenClickedAndMoved || !gsap) return; // Prevent re-animation or if gsap not loaded
        window.macHasBeenClickedAndMoved = true;

        stopQuestionMarkAnimationAndHide();

        if (smoother) {
            smoother.kill();
            smoother = null;
        }
        if (macTimeline) {
            macTimeline.kill();
            macTimeline = null;
        }
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());

        document.body.style.overflowY = 'auto';
        // document.body.style.overflowX = 'hidden'; // Retained by CSS

        if (macImage) {
            gsap.to(macImage, {
                scale: 1,
                clearProps: "transformOrigin,scale", // Clear props affected by scroll animation
                duration: 0.2,
                ease: "power1.out"
            });
        }
        
        if (macintoshContainer) {
            // Reset container's own transform state before applying new one
            gsap.set(macintoshContainer, { x: 0, y: 0, scale: 1 }); 
            gsap.to(macintoshContainer, {
                x: "-25vw", // Move its center 25% of viewport width to the left
                duration: 1.2,
                ease: "power2.inOut",
                onComplete: () => {
                    console.log("Macintosh moved to the left.");
                    // Placeholder for any actions after move, e.g., loading new content
                }
            });
        }
    }

    // Add click listeners to question marks
    questionMarks.forEach(qm => {
        qm.addEventListener('click', handleQuestionMarkClick);
    });

    // All modal functions, auth functions, and their event listeners/calls removed.

    function initScrollAnimations() {
        if (window.gsap && window.ScrollTrigger && window.ScrollSmoother) {
            gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

            if (smoother) smoother.kill();
            if (macTimeline) macTimeline.kill();
            if (crtOnDelay) crtOnDelay.kill();
            if (scrollUpDelay) scrollUpDelay.kill();
            ScrollTrigger.getAll().forEach(st => st.kill());

            document.body.style.overflowY = ''; 
            // document.body.classList.remove('neutral-bg-for-static'); // This class seems to be removed already or was part of theme logic

            if (mainViewWrapper) mainViewWrapper.classList.remove('animation-off-layout');

            gsap.set(macintoshContainer, { x: 0, y: 0, scale: 1, opacity: 1 }); // Reset specific transforms
            if (macImage) { // Use the macImage const
                gsap.set(macImage, { scale: 1, transformOrigin: '50% 34.8%' }); // Initial state for scroll animation
            }
            // gsap.set(screenContentWrapper, { opacity: 0, scale: 0.8, x: "50%" }); // screenContentWrapper related logic removed

            if(macintoshContainer) macintoshContainer.style.display = 'flex'; // Ensure visibility

            smoother = ScrollSmoother.create({
            wrapper: "#smooth-wrapper",
            content: "#smooth-content",
                smooth: 1.5,
                effects: true, 
                normalizeScroll: true,
                ignoreMobileResize: true
            });

            macTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: "#macintosh-container",
                    start: "top top",
                    end: "+=50%",
                    scrub: 1,
                    pin: true,
                    onLeave: () => {
                        // When zoom-in completes, wait 5s then turn on CRT.
                        if(crtOnDelay) crtOnDelay.kill(); // kill previous to avoid stacking
                        crtOnDelay = gsap.delayedCall(5, () => {
                            if (screenContainer) screenContainer.classList.add('crt-on');
                            if(desktopUI) {
                                gsap.to(desktopUI, { autoAlpha: 1, duration: 1 });
                                if(smoother) smoother.paused(true); // Lock scrolling
                                sessionStartTime = new Date();
                                if(sessionInterval) clearInterval(sessionInterval);
                                sessionInterval = setInterval(() => {
                                    const elapsed = Math.round((new Date() - sessionStartTime) / 1000);
                                    if(sessionTimeEl) sessionTimeEl.textContent = `${elapsed}s`;
                                }, 1000);
                                updateDateTime();
                                setInterval(updateDateTime, 30000); // Update time every 30s
                            }
                        });
                    },
                    onEnterBack: () => {
                        // Logic removed as scroll is locked
                    }
                }
            });

            macTimeline
                .to(macImage, {
                    scale: 3.6,
                    transformOrigin: '50% 34.8%',
                    ease: "power1.inOut"
                })
                // Start screen container animation when macImage tween is 50% complete.
                .to('.screen-container', {
                    autoAlpha: 1, // Handles opacity and visibility
                    duration: 1, // Fade in over 1 second
                    ease: "power1.inOut"
                }, "<50%");

            // Fade out question marks on first scroll, if not clicked
            ScrollTrigger.create({
                trigger: "#smooth-wrapper",
                start: "top top-=1", // Trigger 1px from the top
                once: true,          // Ensures it runs only once
                onEnter: () => {
                    if (!window.macHasBeenClickedAndMoved) {
                        stopQuestionMarkAnimationAndHide();
                    }
                }
            });

            // MODIFIED global scroll listener to respect the click flag
            const scrollListenerKey = 'globalScrollRestricter'; // For easier removal/management
            if (window[scrollListenerKey]) { // Remove previous if any, good for hot-reloads/re-init
                window.removeEventListener('scroll', window[scrollListenerKey], { passive: true });
            }
            window[scrollListenerKey] = () => {
                if (!window.macHasBeenClickedAndMoved) { // Check the flag
                const maxScroll = window.innerHeight * 0.5;
                if (window.scrollY > maxScroll) {
                    window.scrollTo(0, maxScroll);
                }
                }
            };
            window.addEventListener('scroll', window[scrollListenerKey], { passive: true });
            
            ScrollTrigger.refresh(); 
        } else {
            console.warn("GSAP, ScrollTrigger, or ScrollSmoother not available for scroll animation.");
            if (macintoshContainer) macintoshContainer.style.display = 'flex';
            // screenContentWrapper related logic removed
            document.body.style.overflowY = 'auto';
        }
    }

    if (window.gsap && window.ScrollTrigger && window.ScrollSmoother) {
        initScrollAnimations();
        initializePlaylist(); // Load music playlist
    } else {
        console.warn("GSAP/ScrollTrigger/ScrollSmoother not available on initial load for scroll animations.");
        if (macintoshContainer) macintoshContainer.style.display = 'flex';
        // screenContentWrapper related logic removed
         document.body.style.overflowY = 'auto';
         initializePlaylist(); // Load music playlist
    }
    startQuestionMarkAnimation();

    // --- Window Management ---
    function openWindow(windowId) {
        const targetWindow = document.getElementById(windowId);
        if (!targetWindow) return;

        if (windowId === 'terminal-window') {
            initTerminal();
        }

        // If it was minimized, remove the tab
        if (targetWindow.classList.contains('is-minimized')) {
            targetWindow.classList.remove('is-minimized');
            const staticMenu = document.getElementById('static-menu');
            const appTab = staticMenu ? staticMenu.querySelector(`.minimized-app[data-target="${windowId}"]`) : null;
            if (appTab) appTab.remove();
        }

        const isFullscreen = targetWindow.classList.contains('is-fullscreen');
        const hasBeenMoved = targetWindow.style.top !== '' && targetWindow.style.left !== '';

        const fromVars = { 
            display: 'none', 
            autoAlpha: 0, 
            scale: 0.9 
        };
        
        // Default is centered. For fullscreen, GSAP will use the current transform (0,0), which is correct.
        // If the window has been moved, don't re-center it.
        if (!isFullscreen && !hasBeenMoved) {
            fromVars.xPercent = -50;
            fromVars.yPercent = -50;
        }

        gsap.fromTo(targetWindow, fromVars, { 
            display: 'flex', 
            autoAlpha: 1, 
            scale: 1, 
            duration: 0.3, 
            ease: 'power2.out',
            // Ensure final transform is correct. GSAP carries over x/yPercent from `from` vars if not specified in `to`.
            xPercent: isFullscreen ? 0 : (hasBeenMoved ? 0 : -50),
            yPercent: isFullscreen ? 0 : (hasBeenMoved ? 0 : -50)
        });
    }

    function closeWindow(windowElement) {
        if (windowElement.id === 'music-window' && audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            isPlaying = false;
            if (playPauseBtn) playPauseBtn.textContent = '▶️';
        }

        // Also remove from minimized bar if it exists
        const staticMenu = document.getElementById('static-menu');
        const appTab = staticMenu ? staticMenu.querySelector(`.minimized-app[data-target="${windowElement.id}"]`) : null;
        if (appTab) appTab.remove();

        // Animate the window closing first
        gsap.to(windowElement, { 
            autoAlpha: 0, 
            scale: 0.9, 
            duration: 0.3, 
            onComplete: () => { 
                windowElement.style.display = 'none'; 
                
                const resetProps = {
                    clearProps: "top,left,xPercent,yPercent",
                    scale: 1
                };

                if (windowElement.classList.contains('is-fullscreen')) {
                    windowElement.classList.remove('is-fullscreen');
                    // Revert to default size/shape; CSS will handle the rest
                    resetProps.width = '80%';
                    resetProps.height = '70%';
                    resetProps.borderRadius = '10px';
                }

                gsap.set(windowElement, resetProps);
            }
        });
    }

    function minimizeWindow(windowElement) {
        if (windowElement.classList.contains('is-minimized')) return;
        windowElement.classList.add('is-minimized');

        const staticMenu = document.getElementById('static-menu');
        if (!staticMenu) return;

        // Create tab in top bar
        const appTab = document.createElement('li');
        appTab.className = 'minimized-app';
        appTab.textContent = windowElement.querySelector('.title').textContent;
        appTab.dataset.target = windowElement.id;
        appTab.addEventListener('click', () => openWindow(windowElement.id));

        const existingMinimized = staticMenu.querySelectorAll('.minimized-app');
        if (existingMinimized.length > 0) {
            existingMinimized[existingMinimized.length - 1].after(appTab);
        } else if (staticMenu.children.length > 0) {
            staticMenu.children[0].after(appTab); // after "System Setting"
        } else {
            staticMenu.appendChild(appTab);
        }
        
        gsap.to(windowElement, { autoAlpha: 0, scale: 0.9, duration: 0.3, onComplete: () => { windowElement.style.display = 'none'; }});
    }

    function toggleFullscreen(windowElement) {
        if (!windowElement) return;

        // If it's minimized, restore it first before making it fullscreen
        if (windowElement.classList.contains('is-minimized')) {
            openWindow(windowElement.id);
        }

        const isFullscreen = windowElement.classList.contains('is-fullscreen');
        const duration = 0.2; // Fast fade

        // 1. Fade out the window
        gsap.to(windowElement, {
            autoAlpha: 0,
            duration: duration,
            ease: 'power1.in',
            onComplete: () => {
                // 2. After fade-out, change properties instantly
                if (isFullscreen) {
                    // It WAS fullscreen, now restore it
                    windowElement.classList.remove('is-fullscreen');
                    gsap.set(windowElement, {
                        top: '50%',
                        left: '50%',
                        width: '80%',
                        height: '70%',
                        borderRadius: '10px',
                        xPercent: -50,
                        yPercent: -50,
                    });
                } else {
                    // It was NOT fullscreen, now make it so
                    windowElement.classList.add('is-fullscreen');
                    gsap.set(windowElement, {
                        top: '22px',
                        left: '0px',
                        width: '100%',
                        height: 'calc(100% - 22px)',
                        borderRadius: '0px',
                        xPercent: 0,
                        yPercent: 0,
                    });
                }

                // 3. Fade the window back in with new properties
                gsap.to(windowElement, {
                    autoAlpha: 1,
                    duration: duration,
                    ease: 'power1.out'
                });
            }
        });
    }

    // Add listeners to all window action buttons
    document.querySelectorAll('.window').forEach(win => {
        win.querySelector('.close-btn')?.addEventListener('click', (e) => closeWindow(e.currentTarget.closest('.window')));
        win.querySelector('.minimize-btn')?.addEventListener('click', (e) => minimizeWindow(e.currentTarget.closest('.window')));
        win.querySelector('.fullscreen-btn')?.addEventListener('click', (e) => toggleFullscreen(e.currentTarget.closest('.window')));
        makeDraggable(win);
    });

    // --- Draggable Window Logic ---
    function makeDraggable(windowElement) {
        const titleBar = windowElement.querySelector('.title-bar');
        if (!titleBar) return;

        let isDragging = false;
        let startX, startY, startTop, startLeft;

        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.closest('button') || windowElement.classList.contains('is-fullscreen')) {
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = windowElement.getBoundingClientRect();
            const parentRect = windowElement.offsetParent.getBoundingClientRect();
            
            startTop = rect.top - parentRect.top;
            startLeft = rect.left - parentRect.left;

            gsap.set(windowElement, {
                xPercent: 0,
                yPercent: 0,
                top: startTop,
                left: startLeft,
            });

            document.querySelectorAll('.window').forEach(win => {
                if (win.style.zIndex > 1) win.style.zIndex = '2';
            });
            windowElement.style.zIndex = '3';

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp, { once: true });
        });

        function onMouseMove(e) {
            if (!isDragging) return;
            e.preventDefault(); 

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = startLeft + dx;
            let newTop = startTop + dy;

            const parent = windowElement.offsetParent;
            if (parent) {
                const parentWidth = parent.offsetWidth;
                const parentHeight = parent.offsetHeight;
                const windowWidth = windowElement.offsetWidth;
                const titleBarHeight = titleBar.offsetHeight;

                // Constrain top/bottom so title bar is always visible
                newTop = Math.max(0, Math.min(newTop, parentHeight - titleBarHeight));

                // Constrain left/right so at least a small part of the window is visible to be dragged back
                const minVisibleWidth = 40; // pixels
                newLeft = Math.max(-(windowWidth - minVisibleWidth), Math.min(newLeft, parentWidth - minVisibleWidth));
            }

            gsap.set(windowElement, {
                top: newTop,
                left: newLeft
            });
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
        }
    }

    // --- Context Menu Logic ---
    function handleIconContextMenuAction(action) {
        if (!activeIcon) return;

        switch(action) {
            case 'open':
                openWindow(activeIcon.dataset.target);
                break;
            case 'create-shortcut':
            case 'pin':
            case 'properties':
                alert(`Action '${action}' is not implemented yet.`);
                break;
        }
        iconContextMenu.style.display = 'none'; // Hide menu after action
    }

    function handleDesktopContextMenuAction(action) {
        switch(action) {
            case 'change-background':
                bgImageInput.click();
                break;
        }
        desktopContextMenu.style.display = 'none'; // Hide menu after action
    }

    // Add listeners to all desktop icons
    desktopIcons.forEach(icon => {
        // Left-click to open
        icon.addEventListener('click', () => {
            openWindow(icon.dataset.target);
        });

        // Right-click for context menu
        icon.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();

            activeIcon = e.currentTarget; // Set the active icon

            desktopContextMenu.style.display = 'none';

            const screenRect = e.currentTarget.closest('.screen-content').getBoundingClientRect();
            const x = e.clientX - screenRect.left;
            const y = e.clientY - screenRect.top;

            iconContextMenu.style.left = `${x}px`;
            iconContextMenu.style.top = `${y}px`;
            iconContextMenu.style.display = 'block';
        });
    });

    if (iconContextMenu) {
        iconContextMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI' && e.target.dataset.action) {
                handleIconContextMenuAction(e.target.dataset.action);
            }
        });
    }

    if (desktopUI && desktopContextMenu) {
        desktopUI.addEventListener('contextmenu', (e) => {
            // Prevent showing desktop menu if an icon was clicked
            if (e.target.closest('.desktop-icon')) return;

            e.preventDefault();
            iconContextMenu.style.display = 'none';

            const screenRect = e.currentTarget.closest('.screen-content').getBoundingClientRect();
            const x = e.clientX - screenRect.left;
            const y = e.clientY - screenRect.top;

            desktopContextMenu.style.left = `${x}px`;
            desktopContextMenu.style.top = `${y}px`;
            desktopContextMenu.style.display = 'block';
        });

        desktopContextMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI' && e.target.dataset.action) {
                handleDesktopContextMenuAction(e.target.dataset.action);
            }
        });
    }

    if (bgImageInput && desktopUI) {
        bgImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    desktopUI.style.backgroundColor = ''; // Clear solid color
                    desktopUI.style.backgroundImage = `url('${event.target.result}')`;
                    desktopUI.style.backgroundSize = 'cover';
                    desktopUI.style.backgroundPosition = 'center';
                    desktopUI.classList.add('has-custom-background');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Hide context menu on any outside click
    document.addEventListener('click', (e) => {
        if (iconContextMenu && iconContextMenu.style.display === 'block' && !iconContextMenu.contains(e.target)) {
            iconContextMenu.style.display = 'none';
        }
        if (desktopContextMenu && desktopContextMenu.style.display === 'block' && !desktopContextMenu.contains(e.target)) {
            desktopContextMenu.style.display = 'none';
        }
    });

    // --- Log Off Logic ---
    if(logOffBtn) {
        logOffBtn.addEventListener('click', () => {
            if(smoother) {
                smoother.paused(false);
                smoother.scrollTo(0, true);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // --- Terminal App Logic ---
    function initTerminal() {
        if (!terminalContent) return;
        terminalContent.innerHTML = ''; // Clear on open
        printToTerminal('Welcome to Web-OS Terminal v1.0');
        printToTerminal('Type "help" for a list of available commands.');
        createNewInputLine();
    }

    function createNewInputLine() {
        const line = document.createElement('div');
        line.className = 'terminal-input-line';

        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = `guest@web-os:${currentPath}$`;

        const input = document.createElement('span');
        input.className = 'terminal-input';
        input.contentEditable = 'true';
        input.spellcheck = false;

        line.appendChild(prompt);
        line.appendChild(input);
        terminalContent.appendChild(line);
        input.focus();
        terminalInput = input; // Set current input
    }

    if (terminalContent) {
        terminalContent.addEventListener('click', () => {
            if (terminalInput) terminalInput.focus();
        });

        terminalContent.addEventListener('keydown', (e) => {
            if (e.target.className === 'terminal-input' && e.key === 'Enter') {
                e.preventDefault();
                const command = e.target.textContent.trim();
                e.target.contentEditable = 'false'; // Lock the command line

                if (command) {
                    handleCommand(command);
                }
                createNewInputLine();
                terminalContent.scrollTop = terminalContent.scrollHeight;
            }
        });
    }

    function handleCommand(command) {
        const [cmd, ...args] = command.split(' ').filter(Boolean);
        switch (cmd.toLowerCase()) {
            case 'help':
                printToTerminal(`
Available commands:
  help      - Show this help message
  clear     - Clear the terminal screen
  date      - Display the current date and time
  echo      - Display a line of text
  whoami    - Print the current user
  pwd       - Print working directory
  ls        - List directory contents
  cd [dir]  - Change directory
  cat [file]- Display file contents
  neofetch  - Display system information
`);
                break;
            case 'clear':
                terminalContent.innerHTML = '';
                break;
            case 'date':
                printToTerminal(new Date().toLocaleString());
                break;
            case 'echo':
                printToTerminal(args.join(' '));
                break;
            case 'whoami':
                printToTerminal('guest');
                break;
            case 'pwd':
                printToTerminal(currentPath);
                break;
            case 'ls':
                const contents = Object.keys(currentDirectory.children);
                if (contents.length === 0) {
                    printToTerminal('');
                } else {
                    printToTerminal(contents.map(item => currentDirectory.children[item].type === 'dir' ? `${item}/` : item).join('\t'));
                }
                break;
            case 'cd':
                const targetDir = args[0] || '~';
                if (targetDir === '~') {
                    currentDirectory = virtualFileSystem['~'];
                    currentPath = '~';
                } else if(targetDir === '..') {
                    // This is a simplified version, won't work for nested paths yet.
                    // For now, it just goes back to root if not at root.
                    if (currentPath !== '~') {
                       currentDirectory = virtualFileSystem['~'];
                       currentPath = '~';
                    }
                } else if (currentDirectory.children[targetDir] && currentDirectory.children[targetDir].type === 'dir') {
                    currentDirectory = currentDirectory.children[targetDir];
                    currentPath = currentPath === '~' ? `~/${targetDir}` : `${currentPath}/${targetDir}`;
                } else {
                    printToTerminal(`-bash: cd: ${targetDir}: No such file or directory`);
                }
                break;
            case 'cat':
                const targetFile = args[0];
                if (targetFile && currentDirectory.children[targetFile] && currentDirectory.children[targetFile].type === 'file') {
                    printToTerminal(currentDirectory.children[targetFile].content);
                } else {
                    printToTerminal(`cat: ${targetFile || '""'}: No such file or directory`);
                }
                break;
            case 'neofetch':
                printToTerminal(`
<pre>
██╗    ██╗███████╗██████╗      ██████╗ ███████╗
██║    ██║██╔════╝██╔══██╗    ██╔═══██╗██╔════╝
██║ █╗ ██║█████╗  ██████╔╝    ██║   ██║███████╗
██║███╗██║██╔══╝  ██╔══██╗    ██║   ██║╚════██║
╚███╔███╔╝███████╗██████╔╝    ╚██████╔╝███████║
 ╚══╝╚══╝ ╚══════╝╚═════╝      ╚═════╝ ╚══════╝
</pre>
    OS: Web-OS 1.0
    Kernel: 5.4.0-GSAP
    Uptime: ${sessionInterval ? Math.round((new Date() - sessionStartTime) / 1000) : 0}s
    Shell: web-bash
    CPU: Emulated (JavaScript)
`);
                break;
            default:
                printToTerminal(`-bash: command not found: ${command}`);
                break;
        }
    }

    function printToTerminal(text) {
        if (!terminalContent) return;
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = text;
        terminalContent.appendChild(line);
    }

    if (hamburgerMenu && musicWindow) {
        hamburgerMenu.addEventListener('click', () => {
            musicWindow.classList.toggle('sidebar-open');
        });
    }

    if (settingsBtn && musicMainView && musicSettingsView) {
        settingsBtn.addEventListener('click', () => {
            musicMainView.style.display = 'none';
            musicSettingsView.style.display = 'block';
        });
    }

    if (backToPlayerBtn && musicMainView && musicSettingsView) {
        backToPlayerBtn.addEventListener('click', () => {
            musicSettingsView.style.display = 'none';
            musicMainView.style.display = 'flex';
        });
    }
    
    // Drag and Drop for Queue
    function addQueueEventListeners() {
        const queueItems = document.querySelectorAll('.music-queue-list li');

        queueItems.forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
            item.addEventListener('click', handleQueueItemClick);
        });
    }

    function handleQueueItemClick(e) {
        const index = parseInt(e.target.dataset.index, 10);
        if (index !== currentTrackIndex) {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            if(isPlaying) audioPlayer.play();
        }
    }

    function handleDragStart(e) {
        dragStartIndex = parseInt(this.dataset.index, 10);
        this.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault(); 
    }

    function handleDrop(e) {
        e.preventDefault();
        const dropIndex = parseInt(this.dataset.index, 10);
        const draggedItem = playlist[dragStartIndex];
        
        // Remove dragged item and insert at new position
        playlist.splice(dragStartIndex, 1);
        playlist.splice(dropIndex, 0, draggedItem);

        // Adjust current track index if it was affected by the move
        if (dragStartIndex < dropIndex) {
            if (currentTrackIndex === dragStartIndex) {
                currentTrackIndex = dropIndex;
            } else if (currentTrackIndex > dragStartIndex && currentTrackIndex <= dropIndex) {
                currentTrackIndex--;
            }
        } else if (dragStartIndex > dropIndex) {
            if (currentTrackIndex === dragStartIndex) {
                currentTrackIndex = dropIndex;
            } else if (currentTrackIndex >= dropIndex && currentTrackIndex < dragStartIndex) {
                currentTrackIndex++;
            }
        }
        
        renderQueue();
    }
    
    function handleDragEnd() {
        this.classList.remove('dragging');
    }

    if (addMusicBtn) {
        addMusicBtn.addEventListener('click', () => {
            if (musicFileInput) musicFileInput.click();
        });
    }

    if (musicFileInput) {
        musicFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                addFilesToPlaylist(e.target.files);
            }
        });
    }

    // --- System Settings Logic ---
    if(systemSettingsEntry) {
        systemSettingsEntry.addEventListener('click', () => openWindow('system-settings-window'));
    }

    const settingsWindow = document.getElementById('system-settings-window');
    if (settingsWindow) {
        // Tab switching logic
        const tabBtns = settingsWindow.querySelectorAll('.tab-btn');
        const tabContents = settingsWindow.querySelectorAll('.settings-tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;

                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(content => {
                    if (content.id === `tab-${tabId}`) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });

        // Change background button
        const changeBgBtn = document.getElementById('change-bg-btn');
        if (changeBgBtn) {
            changeBgBtn.addEventListener('click', () => {
                if (bgImageInput) bgImageInput.click();
            });
        }

        // Default wallpaper selection
        const wallpaperThumbs = settingsWindow.querySelectorAll('.wallpaper-thumb');
        wallpaperThumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const bg = thumb.dataset.bg;
                if(desktopUI) {
                    if (bg.startsWith('#')) { // Handle solid color
                        desktopUI.style.backgroundImage = 'none';
                        desktopUI.style.backgroundColor = bg;
                        desktopUI.classList.remove('has-custom-background');
                    } else { // Handle image URL
                        desktopUI.style.backgroundColor = '';
                        desktopUI.style.backgroundImage = bg;
                        desktopUI.style.backgroundSize = 'cover';
                        desktopUI.style.backgroundPosition = 'center';
                        desktopUI.classList.add('has-custom-background');
                    }
                }
            });
        });
    }

    // --- Letter App Logic ---
    const letterWindow = document.getElementById('letter-window');
    if (letterWindow) {
        const dropdown = letterWindow.querySelector('#letter-type-dropdown');
        const accountBtn = letterWindow.querySelector('#user-account-btn');
        const accountPopup = letterWindow.querySelector('#user-account-popup');

        // Dropdown Logic
        if (dropdown) {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            const selectedSpan = toggle.querySelector('span');

            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });

            menu.addEventListener('click', (e) => {
                if (e.target.classList.contains('dropdown-item')) {
                    if (selectedSpan) selectedSpan.textContent = e.target.textContent;
                    dropdown.classList.remove('open');
                }
            });
        }

        // Account Popup Logic
        if (accountBtn && accountPopup) {
            const closePopupBtn = accountPopup.querySelector('.close-popup-btn');

            accountBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isPopupVisible = accountPopup.style.display === 'flex';
                // Hide other popups/dropdowns when opening this one
                if (dropdown) dropdown.classList.remove('open');
                accountPopup.style.display = isPopupVisible ? 'none' : 'flex';
            });

            if (closePopupBtn) {
                closePopupBtn.addEventListener('click', () => {
                    accountPopup.style.display = 'none';
                });
            }
        }
        
        // Letter history selection (using event delegation)
        const letterHistory = letterWindow.querySelector('.letter-history');
        if (letterHistory) {
            letterHistory.addEventListener('click', (e) => {
                const clickedItem = e.target.closest('.letter-item');
                if (!clickedItem) return;

                const currentActive = letterHistory.querySelector('.letter-item.active');
                if (currentActive) {
                    currentActive.classList.remove('active');
                }
                clickedItem.classList.add('active');
                
                // Optional: Update composer based on selected letter
                const sender = clickedItem.querySelector('.letter-item-sender')?.textContent;
                const recipientInput = letterWindow.querySelector('.recipient-input');
                const editor = letterWindow.querySelector('.letter-editor');
                if (sender && recipientInput && editor) {
                    recipientInput.value = `To: ${sender}`;
                    editor.placeholder = `Reply to ${sender}...`;
                }
            });
        }
        
        // Add a general click listener to close open popups/dropdowns within the letter window scope
        document.addEventListener('click', (e) => {
            if (dropdown && !dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
            if (accountPopup && accountPopup.style.display === 'flex' && !accountBtn.contains(e.target) && !accountPopup.contains(e.target)) {
                accountPopup.style.display = 'none';
            }
        });
    }

    // --- Chiptune Composer Logic ---
    const chiptuneWindow = document.getElementById('chiptune-window');
    if (chiptuneWindow) {
        let audioCtx = null;
        let sequencerInterval = null;
        let currentStep = 0;
        let isChiptunePlaying = false;
        let tempo = 120;
        const steps = 16;
        const numNotes = 12;
        const notes = ["B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5", "D5", "C#5", "C5"];
        const frequencies = [987.77, 932.33, 880.00, 830.61, 783.99, 739.99, 698.46, 659.25, 622.25, 587.33, 554.37, 523.25];
        let gridState = Array(numNotes).fill(0).map(() => Array(steps).fill(false));

        const gridContainer = document.getElementById('sequencer-grid');
        const playBtn = document.getElementById('chiptune-play-btn');
        const stopBtn = document.getElementById('chiptune-stop-btn');
        const clearBtn = document.getElementById('chiptune-clear-btn');
        const tempoSlider = document.getElementById('tempo-slider');
        const tempoDisplay = document.getElementById('tempo-display');
        let playhead;

        function initChiptuneComposer() {
            if (!gridContainer || gridContainer.childElementCount > 0) return;

            // Create playhead
            playhead = document.createElement('div');
            playhead.id = 'playhead';
            gridContainer.appendChild(playhead);
            
            // Create Header Row
            gridContainer.appendChild(document.createElement('div')); // Empty corner
            for (let i = 0; i < steps; i++) {
                const label = document.createElement('div');
                label.className = 'grid-label';
                label.textContent = i + 1;
                gridContainer.appendChild(label);
            }

            // Create grid cells
            for (let row = 0; row < numNotes; row++) {
                const noteLabel = document.createElement('div');
                noteLabel.className = 'grid-label';
                noteLabel.textContent = notes[row];
                gridContainer.appendChild(noteLabel);

                for (let col = 0; col < steps; col++) {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    gridContainer.appendChild(cell);
                }
            }
        }

        function playNote(frequency) {
            if (!audioCtx) return;
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
            
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
        }

        function tick() {
            currentStep = (currentStep + 1) % steps;

            const gridWidth = gridContainer.offsetWidth - 30; // Subtract label width
            const stepWidth = gridWidth / steps;
            playhead.style.left = `${30 + currentStep * stepWidth}px`;

            for (let row = 0; row < numNotes; row++) {
                if (gridState[row][currentStep]) {
                    playNote(frequencies[row]);
                }
            }
        }

        function startSequencer() {
            if (isChiptunePlaying) return;
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                 audioCtx.resume();
            }
            isChiptunePlaying = true;
            playhead.style.display = 'block';
            currentStep = -1; // So first tick is at step 0
            const intervalTime = (60 / tempo) * 250; // 16th notes
            sequencerInterval = setInterval(tick, intervalTime);
        }

        function stopSequencer() {
            if (!isChiptunePlaying) return;
            isChiptunePlaying = false;
            playhead.style.display = 'none';
            clearInterval(sequencerInterval);
            sequencerInterval = null;
        }

        function clearGrid() {
            stopSequencer();
            gridState = Array(numNotes).fill(0).map(() => Array(steps).fill(false));
            document.querySelectorAll('#sequencer-grid .grid-cell.active').forEach(cell => {
                cell.classList.remove('active');
            });
        }
        
        // Event Listeners
        gridContainer?.addEventListener('click', (e) => {
            if (e.target.classList.contains('grid-cell')) {
                const row = e.target.dataset.row;
                const col = e.target.dataset.col;
                gridState[row][col] = !gridState[row][col];
                e.target.classList.toggle('active');
            }
        });

        playBtn?.addEventListener('click', startSequencer);
        stopBtn?.addEventListener('click', stopSequencer);
        clearBtn?.addEventListener('click', clearGrid);
        
        tempoSlider?.addEventListener('input', (e) => {
            tempo = e.target.value;
            if(tempoDisplay) tempoDisplay.textContent = tempo;
            if (isChiptunePlaying) {
                stopSequencer();
                startSequencer();
            }
        });

        // Initialize when window is first opened
        const chiptuneObserver = new MutationObserver((mutations) => {
            for(let mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if(chiptuneWindow.style.display === 'flex') {
                        initChiptuneComposer();
                    } else {
                        stopSequencer(); // Stop music when window is closed/minimized
                    }
                }
            }
        });
        chiptuneObserver.observe(chiptuneWindow, { attributes: true });
    }

    // --- Letter Sharing Logic ---
    async function loadSharedLetter() {
        const params = new URLSearchParams(window.location.search);
        const letterId = params.get('id');

        if (letterId && supabase && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
            try {
                // Show the letter window if it's hidden
                const letterWindow = document.getElementById('letter-window');
                if (window.getComputedStyle(letterWindow).display === 'none') {
                     // This uses the existing logic for opening a window
                    const letterIcon = document.getElementById('letter-icon');
                    openWindow(letterIcon.dataset.target, letterIcon);
                }

                // Set a loading state
                recipientInput.value = 'Loading shared letter...';
                recipientInput.disabled = true;
                letterEditor.value = '';
                letterEditor.readOnly = true;
                sendLetterBtn.style.display = 'none';
                copyLinkBtn.style.display = 'none';

                const { data, error } = await supabase
                    .from('letters')
                    .select('content')
                    .eq('id', letterId)
                    .single();

                if (error) throw error;

                if (data) {
                    recipientInput.value = 'Shared Letter (Read-Only)';
                    letterEditor.value = data.content;
                } else {
                    recipientInput.value = 'Not Found';
                    letterEditor.value = 'Sorry, this letter could not be found. It may have been deleted.';
                }
            } catch (error) {
                console.error('Error loading shared letter:', error.message);
                recipientInput.value = 'Error';
                letterEditor.value = 'Error: Could not load this letter. Please check the console.';
            }
        }
    }

    // On initial load, check for a shared letter ID in the URL
    loadSharedLetter();

});