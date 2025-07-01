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

    // --- Auth Elements ---
    const authModalContainer = document.getElementById('auth-modal-container');
    const usernameModalContainer = document.getElementById('username-modal-container');
    const otpModalContainer = document.getElementById('otp-modal-container');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authToggleLink = document.getElementById('auth-toggle-link');
    const authToggleText = document.getElementById('auth-toggle-text');
    const authError = document.getElementById('auth-error');
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const usernameForm = document.getElementById('username-form');
    const usernameInput = document.getElementById('username-input');
    const usernameError = document.getElementById('username-error');
    const accountPopupBody = document.getElementById('account-popup-body');
    const accountPopupUserView = document.getElementById('account-popup-user-view');
    const accountUsernameSpan = document.getElementById('account-username');
    const popupLoginBtn = document.getElementById('popup-login-btn');
    const popupSignupBtn = document.getElementById('popup-signup-btn');
    const popupLogoutBtn = document.getElementById('popup-logout-btn');
    const computerWindowUser = document.querySelector('#computer-window ul li b');
    const letterHistory = document.querySelector('.letter-history');
    const letterSearchInput = document.querySelector('.letter-search');
    const expirationControl = document.getElementById('expiration-control');
    const expirationSlider = document.getElementById('expiration-slider');
    const expirationDisplay = document.getElementById('expiration-display');

    // --- Supabase Setup ---
    // IMPORTANT: Replace with your actual Supabase project URL and anon key
    const SUPABASE_URL = 'https://wfekcsjzfhcdntzhltnk.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWtjc2p6ZmhjZG50emhsdG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjMwMzIsImV4cCI6MjA2NjkzOTAzMn0.YOfngdAb-eW_zTKrreN7WgQ9kAxSOA4BoPRbdreaIGk';
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
    let authMode = 'signin'; // 'signin' or 'signup'
    let recipientProfile = null; // Store the full profile of a validated recipient

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
    
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("You must be logged in to send a letter.");
                return;
            }
    
            const letterContent = letterEditor.value.trim();
            if (!letterContent) {
                alert('Please write a letter first!');
                return;
            }
    
            sendLetterBtn.disabled = true;
            sendLetterBtn.querySelector('.send-text').textContent = 'Sending...';
            copyLinkBtn.classList.remove('show');
    
            try {
                // --- Step 1: Prepare the letter data for the database ---
                const letterData = {
                    sender_id: session.user.id,
                    content: letterContent,
                    type: dropdown.dataset.value || 'normal'
                };
    
                // Determine if sending to a user or creating a public link
                if (recipientProfile) {
                    letterData.recipient_id = recipientProfile.id;
                } else {
                    // Public link, recipient_id is null. Check for expiration on normal letters.
                    if (letterData.type === 'normal') {
                        const hours = parseInt(expirationSlider.value, 10);
                        const expires_at = new Date();
                        expires_at.setHours(expires_at.getHours() + hours);
                        letterData.expires_at = expires_at.toISOString();
                    }
                }
    
                // --- Step 2: Insert the letter into the database ---
                const { data: insertedData, error: insertError } = await supabase
                    .from('letters')
                    .insert([letterData])
                    .select()
                    .single();
    
                if (insertError) throw insertError;
    
                // --- Step 3: Save a copy to the user's local history for their records ---
                const localLetter = {
                    id: `local-${Date.now()}`,
                    db_id: insertedData.id, // Keep a reference to the database ID
                    recipient: recipientProfile ? recipientProfile.username : 'Shared Link',
                    content: letterContent,
                    timestamp: new Date().toISOString()
                };
                saveLetter(session.user.id, localLetter);
                loadAndDisplayLetters(session.user.id);
    
                // --- Step 4: Update UI based on success ---
                if (!recipientProfile) {
                    // If it was a public link, show the copy button
                    const shareableLink = `${window.location.origin}${window.location.pathname}?id=${insertedData.id}`;
                    copyLinkBtn.style.display = 'inline-block';
                    setTimeout(() => copyLinkBtn.classList.add('show'), 10);
                    copyLinkBtn.onclick = () => {
                        navigator.clipboard.writeText(shareableLink).then(() => {
                            copyLinkBtn.title = 'Copied!';
                            setTimeout(() => { copyLinkBtn.title = 'Copy link'; }, 2000);
                        });
                    };
                }
    
                // Reset UI elements
                letterEditor.value = '';
                recipientInput.value = '';
                recipientInput.classList.remove('valid-user', 'invalid-user');
                recipientProfile = null;
    
                sendLetterBtn.classList.add('sent');
                sendLetterBtn.querySelector('.send-text').textContent = 'Sent';
    
            } catch (error) {
                console.error('Error sending letter:', error.message);
                alert('Could not send the letter. Please check the console.');
            } finally {
                // Re-enable the send button after a short delay
                setTimeout(() => {
                    sendLetterBtn.disabled = false;
                    sendLetterBtn.classList.remove('sent');
                    sendLetterBtn.querySelector('.send-text').textContent = 'Send';
                }, 2000);
            }
        });
    }

    // --- Debounce function for input validation ---
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // --- Username Validation Logic ---
    async function checkUsername(username) {
        if (!username) {
            recipientInput.classList.remove('valid-user', 'invalid-user');
            recipientProfile = null;
            return;
        }

        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                .single();
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error;
            }

            if (data) {
                recipientInput.classList.add('valid-user');
                recipientInput.classList.remove('invalid-user');
                recipientProfile = { id: data.id, username: username };
            } else {
                recipientInput.classList.add('invalid-user');
                recipientInput.classList.remove('valid-user');
                recipientProfile = null;
            }

        } catch (error) {
            console.error("Error checking username:", error.message);
            recipientInput.classList.add('invalid-user');
            recipientInput.classList.remove('valid-user');
            recipientProfile = null;
        }
    }

    if (recipientInput) {
        recipientInput.addEventListener('input', debounce((e) => {
            checkUsername(e.target.value.trim());
        }, 500));
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

    // --- Authentication Logic ---

    // Update UI based on auth state
    function updateUIForAuthState(session, profile) {
        if (session && profile) {
            // User is logged in and has a profile
            if (accountPopupBody) accountPopupBody.style.display = 'none';
            if (accountPopupUserView) accountPopupUserView.style.display = 'block';
            if (accountUsernameSpan) accountUsernameSpan.textContent = profile.username;
            if (computerWindowUser) computerWindowUser.textContent = profile.username;
            if (logOffBtn) logOffBtn.textContent = 'Log Out';
        } else {
            // User is logged out or doesn't have a profile yet
            if (accountPopupBody) accountPopupBody.style.display = 'block';
            if (accountPopupUserView) accountPopupUserView.style.display = 'none';
            if (computerWindowUser) computerWindowUser.textContent = 'Guest (Not Logged In)';
            if (logOffBtn) logOffBtn.textContent = 'Log OFF';
        }
    }

    async function getProfile(userId) {
        if (!supabase) return null;
        try {
            const { data, error, status } = await supabase
                .from('profiles')
                .select(`username`)
                .eq('id', userId)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error fetching profile:', error.message);
            return null;
        }
    }

    // --- Letter Saving and Searching Logic ---

    // Fetches profiles from a list of IDs to avoid multiple single queries.
    // Also uses a simple cache to prevent re-fetching the same profile in a session.
    const profileCache = new Map();
    async function getProfilesByIds(ids) {
        const idsToFetch = ids.filter(id => id && !profileCache.has(id));
        if (idsToFetch.length > 0) {
            const { data, error } = await supabase.from('profiles').select('id, username').in('id', idsToFetch);
            if (error) {
                console.error("Error fetching profiles:", error);
                return;
            }
            data.forEach(profile => profileCache.set(profile.id, profile));
        }
    }

    function getSavedLetters(userId) {
        if (!userId) return [];
        const lettersJSON = localStorage.getItem(`web-os-letters-${userId}`);
        return lettersJSON ? JSON.parse(lettersJSON) : [];
    }

    function saveLetter(userId, newLetter) {
        if (!userId) return;
        const letters = getSavedLetters(userId);
        letters.unshift(newLetter); // Add new letter to the top
        localStorage.setItem(`web-os-letters-${userId}`, JSON.stringify(letters));
    }

    async function renderLetters(letters, currentUserId) {
        if (!letterHistory) return;
        letterHistory.innerHTML = ''; // Clear current list

        if (!letters || letters.length === 0) {
            letterHistory.innerHTML = '<p style="padding: 10px; text-align: center; color: #888; font-size: 12px;">No mail yet.</p>';
            return;
        }

        // We need usernames for senders/recipients. Fetch them in one go.
        const profileIds = new Set();
        letters.forEach(letter => {
            if (letter.sender_id) profileIds.add(letter.sender_id);
            if (letter.recipient_id) profileIds.add(letter.recipient_id);
        });

        await getProfilesByIds(Array.from(profileIds));

        letters.forEach(letter => {
            const preview = letter.content ? letter.content.substring(0, 35) + (letter.content.length > 35 ? '...' : '') : 'No content';
            const item = document.createElement('div');
            item.className = 'letter-item';
            item.dataset.id = letter.id; // Use database ID

            const isSent = letter.sender_id === currentUserId;
            let otherPartyUsername = 'Unknown';
            if (isSent) {
                const recipientProfile = letter.recipient_id ? profileCache.get(letter.recipient_id) : null;
                otherPartyUsername = recipientProfile ? `To: ${recipientProfile.username}` : 'Public Link';
            } else {
                const senderProfile = letter.sender_id ? profileCache.get(letter.sender_id) : null;
                otherPartyUsername = senderProfile ? `From: ${senderProfile.username}` : 'System';
            }
            
            // Add a class if the letter is unread (a simple example, can be improved)
            if (!isSent && !letter.read) { // 'read' property would need to be added to DB
                 item.classList.add('unread');
            }

            item.innerHTML = `
                <div class="letter-item-sender">${otherPartyUsername}</div>
                <div class="letter-item-preview">${preview}</div>
                <div class="letter-item-date">${new Date(letter.created_at).toLocaleDateString()}</div>
            `;
            letterHistory.appendChild(item);
        });
    }

    async function loadAndDisplayLetters(userId, searchTerm = '') {
        if (!supabase || !userId) return;

        let letters = [];
        if (searchTerm) {
            // Use the database function for searching
            const { data, error } = await supabase.rpc('search_letters', { search_term: searchTerm });
            if (error) {
                console.error("Error searching letters:", error);
                return;
            }
            letters = data;
        } else {
            // Fetch all letters for the user (sent and received)
            const { data, error } = await supabase
                .from('letters')
                .select('*')
                .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching letters:", error);
                return;
            }
            letters = data;
        }
        
        await renderLetters(letters, userId);
    }

    if (letterSearchInput) {
        letterSearchInput.addEventListener('input', debounce(async (e) => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
                loadAndDisplayLetters(sessionData.session.user.id, e.target.value);
            }
        }, 300));
    }

    // Listen to auth state changes
    if (supabase) {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                // User is logged in
                const profile = await getProfile(session.user.id);
                if (profile) {
                    // User has a profile, update UI
                    updateUIForAuthState(session, profile);
                    loadAndDisplayLetters(session.user.id); // Load letters on login
                    // Show expiration control if default is 'normal'
                    if (document.getElementById('letter-type-dropdown').dataset.value === 'normal') {
                         if (expirationControl) expirationControl.style.display = 'flex';
                    }
                    closeAllModals();
                } else {
                    // New user, needs to choose a username
                    if (usernameModalContainer) usernameModalContainer.style.display = 'flex';
                }
            } else {
                // User is logged out
                updateUIForAuthState(null, null);
                if (letterHistory) letterHistory.innerHTML = ''; // Explicitly clear on logout
            }
        });
    }

    function setAuthModalMode(mode) {
        authMode = mode;
        if (authTitle) authTitle.textContent = mode === 'signup' ? 'Sign Up' : 'Sign In';
        if (authSubmitBtn) authSubmitBtn.textContent = mode === 'signup' ? 'Sign Up' : 'Sign In';
        if (authToggleText) authToggleText.innerHTML = mode === 'signup' 
            ? `Already have an account? <a href="#" id="auth-toggle-link">Sign In</a>`
            : `Don't have an account? <a href="#" id="auth-toggle-link">Sign Up</a>`;
        
        // Re-add event listener to the new link
        document.getElementById('auth-toggle-link').addEventListener('click', (e) => {
            e.preventDefault();
            setAuthModalMode(authMode === 'signin' ? 'signup' : 'signin');
        });
    }

    function openAuthModal(mode) {
        setAuthModalMode(mode);
        if(authError) authError.style.display = 'none';
        if(authForm) authForm.reset();
        if(authModalContainer) authModalContainer.style.display = 'flex';
    }

    function closeAllModals() {
        if(authModalContainer) authModalContainer.style.display = 'none';
        if(usernameModalContainer) usernameModalContainer.style.display = 'none';
        if(otpModalContainer) otpModalContainer.style.display = 'none';
    }

    async function handleSignUp(email, password) {
        if (!supabase) return;
        try {
            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters long.");
            }
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            closeAllModals();
            if(otpModalContainer) otpModalContainer.style.display = 'flex';
        } catch (error) {
            if(authError) {
                authError.textContent = error.message;
                authError.style.display = 'block';
            }
        }
    }

    async function handleSignIn(email, password) {
        if (!supabase) return;
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            // onAuthStateChange will handle the rest
        } catch (error) {
            if(authError) {
                authError.textContent = "Invalid login credentials.";
                authError.style.display = 'block';
            }
        }
    }

    async function handleLogOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
        // onAuthStateChange will handle the rest
        if (letterHistory) letterHistory.innerHTML = ''; // Explicitly clear on logout
        closeAllModals(); // Close any open popups like account info
        const accountPopup = document.querySelector('#user-account-popup');
        if(accountPopup) accountPopup.style.display = 'none';
    }

    // Event listeners for auth flow
    popupLoginBtn?.addEventListener('click', () => openAuthModal('signin'));
    popupSignupBtn?.addEventListener('click', () => openAuthModal('signup'));
    popupLogoutBtn?.addEventListener('click', handleLogOut);

    authForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = authEmailInput.value;
        const password = authPasswordInput.value;
        if (authMode === 'signup') {
            handleSignUp(email, password);
        } else {
            handleSignIn(email, password);
        }
    });

    usernameForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!supabase) return;

        const newUsername = usernameInput.value.trim();
        if(usernameError) usernameError.style.display = 'none';

        try {
            // Check if username is taken
            const { data: existingUser, error: checkError } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', newUsername)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // Ignore 'exact one row' error
                throw checkError;
            }
            if (existingUser) {
                throw new Error("Username is already taken. Please choose another.");
            }

            // Save the profile
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData.session.user;

            const { error: updateError } = await supabase.from('profiles').upsert({
                id: user.id,
                username: newUsername,
                updated_at: new Date().toISOString(),
            });

            if (updateError) throw updateError;
            
            // Manually trigger a state change refresh by re-fetching profile
            const profile = await getProfile(user.id);
            updateUIForAuthState(sessionData.session, profile);
            closeAllModals();

        } catch(error) {
            if(usernameError) {
                usernameError.textContent = error.message;
                usernameError.style.display = 'block';
            }
        }
    });

    // Add listeners to all modal containers and close buttons
    document.querySelectorAll('.modal-container').forEach(container => {
        container.addEventListener('click', (e) => {
            if (e.target === container) { // Click on the overlay itself
                closeAllModals();
            }
        });
    });
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
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
    async function openWindow(windowId) {
        const targetWindow = document.getElementById(windowId);
        if (!targetWindow) return;

        if (windowId === 'terminal-window') {
            initTerminal();
        } else if (windowId === 'letter-window') {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                loadAndDisplayLetters(session.user.id);
            }
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
            const userIsGuest = logOffBtn.textContent === 'Log OFF';
            if (userIsGuest) {
            if(smoother) {
                smoother.paused(false);
                smoother.scrollTo(0, true);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                handleLogOut();
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
            const dropdownItems = Array.from(menu.querySelectorAll('.dropdown-item'));
            let isAnimating = false;

            // Function to update the dropdown's value and text
            function setDropdownValue(item, animate = false, direction = 1) {
                if (isAnimating) return; // Guard against multiple calls
                if (!item || !selectedSpan) return;

                const newValue = item.dataset.value;
                if (dropdown.dataset.value === newValue) return; // No change needed

                const oldValue = dropdown.dataset.value;
                dropdown.dataset.value = newValue;

                if (animate) {
                    isAnimating = true;
                    gsap.timeline({ onComplete: () => { isAnimating = false; } })
                        .to(selectedSpan, {
                            y: -20 * direction,
                            opacity: 0,
                            duration: 0.2,
                            ease: 'power2.in'
                        })
                        .call(() => {
                            selectedSpan.textContent = item.textContent;
                        })
                        .set(selectedSpan, { y: 20 * direction })
                        .to(selectedSpan, {
                            y: 0,
                            opacity: 1,
                            duration: 0.2,
                            ease: 'power2.out'
                        });
                } else {
                     selectedSpan.textContent = item.textContent;
                }
            }
            
            // Set initial value
            if (dropdownItems.length > 0) {
                setDropdownValue(dropdownItems[0]);
            }

            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });

            menu.addEventListener('click', (e) => {
                if (e.target.classList.contains('dropdown-item')) {
                    setDropdownValue(e.target, true);
                    dropdown.classList.remove('open');
                }
            });

            // Add scroll wheel functionality
            toggle.addEventListener('wheel', (e) => {
                e.preventDefault();

                const currentValue = dropdown.dataset.value;
                let currentIndex = dropdownItems.findIndex(item => item.dataset.value === currentValue);
                const direction = e.deltaY < 0 ? -1 : 1;
                const nextIndex = (currentIndex + direction + dropdownItems.length) % dropdownItems.length;
                
                setDropdownValue(dropdownItems[nextIndex], true, direction);

                // Toggle expiration control visibility
                if (dropdownItems[nextIndex].dataset.value === 'normal') {
                    gsap.to(expirationControl, { autoAlpha: 1, display: 'flex', duration: 0.3 });
                } else {
                    gsap.to(expirationControl, { autoAlpha: 0, display: 'none', duration: 0.3 });
                }

            }, { passive: false });
        }

        // --- Expiration Slider Logic ---
        if (expirationSlider && expirationDisplay) {
            expirationSlider.addEventListener('input', (e) => {
                const hours = e.target.value;
                if (hours < 24) {
                    expirationDisplay.textContent = `${hours} hour${hours > 1 ? 's' : ''}`;
                } else {
                    const days = Math.floor(hours / 24);
                    expirationDisplay.textContent = `${days} day${days > 1 ? 's' : ''}`;
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
                
                // --- Load clicked letter content into editor ---
                loadSelectedLetter(clickedItem.dataset.id);
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

        async function loadSelectedLetter(letterId) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
        
            const { data: selectedLetter, error } = await supabase
                .from('letters')
                .select('*')
                .eq('id', letterId)
                .single();
        
            if (error && error.code !== 'PGRST116') {
                 console.error("Error fetching selected letter:", error);
                 return;
            }
            
            if (!selectedLetter) {
                // Letter might not be in the DB (e.g., a secret one that was deleted)
                // but we can try to load it from our local archive.
                const localLetters = getSavedLetters(session.user.id);
                const localVersion = localLetters.find(l => l.db_id === letterId);
                if (localVersion) {
                    recipientInput.value = localVersion.recipient === 'Shared Link' ? '' : localVersion.recipient;
                    editor.value = localVersion.content;
                } else {
                    editor.value = 'This letter is no longer available.';
                }
                return;
            }
        
            // We have the letter from the database
            const isRecipient = selectedLetter.recipient_id === session.user.id;

            // Display the content
            editor.value = selectedLetter.content;
            let titleText = 'Letter';

            // If it's a secret letter and the current user is the recipient, handle deletion
            if (isRecipient && selectedLetter.type === 'secret') {
                titleText = 'Secret Letter (will be destroyed)';
                
                // Delete from DB, then refresh the inbox view
                await supabase.from('letters').delete().eq('id', letterId);
                
                // Also remove it from the local history archive if it exists there
                const localLetters = getSavedLetters(session.user.id);
                const updatedLocalLetters = localLetters.filter(l => l.db_id !== letterId);
                localStorage.setItem(`web-os-letters-${session.user.id}`, JSON.stringify(updatedLocalLetters));

                // Refresh the list
                loadAndDisplayLetters(session.user.id);
            }
            letterWindow.querySelector('.title').textContent = titleText;
        }

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
                const letterIcon = document.getElementById('letter-icon');
                if (window.getComputedStyle(letterWindow).display === 'none') {
                    openWindow(letterIcon.dataset.target);
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
                    .select('content, type') // Fetch type as well
                    .eq('id', letterId)
                    .single();

                if (error) throw error;

                if (data) {
                    let titleText = 'Shared Letter (Read-Only)';
                    if (data.type === 'secret') {
                        titleText = 'Secret Letter (will be destroyed after closing)';
                        // Delete the letter from Supabase after a short delay
                        setTimeout(async () => {
                             await supabase.from('letters').delete().eq('id', letterId);
                        }, 500);
                    }
                    
                    letterWindow.querySelector('.title').textContent = titleText;
                    recipientInput.value = titleText;
                    letterEditor.value = data.content;
                } else {
                    recipientInput.value = 'Not Found';
                    letterEditor.value = 'Sorry, this letter could not be found. It may have been deleted or expired.';
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