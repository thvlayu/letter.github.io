document.addEventListener('DOMContentLoaded', () => {
    const supabaseUrl = 'https://hnvbfwunapruwvhadrtw.supabase.co'; 
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudmJmd3VuYXBydXd2aGFkcnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NjU3OTksImV4cCI6MjA2MzE0MTc5OX0.D63lTNYvHNbiXdCWUT1uaYWU3LuPXVLiMIOP94ORYEE'; 
    let supabaseClientInstance = null;

    const messageStatusDiv = document.getElementById('message-status');
    const letterDisplayContent = document.getElementById('actual-letter-content'); 

    console.log("Global supabase object from CDN (before initialization attempt):", window.supabase);

    try {
        if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
            supabaseClientInstance = window.supabase.createClient(supabaseUrl, supabaseKey); 
            console.log("Supabase client initialized successfully using global window.supabase.createClient.");
        } else if (typeof window.supabaseJs !== 'undefined' && typeof window.supabaseJs.createClient === 'function') {
            supabaseClientInstance = window.supabaseJs.createClient(supabaseUrl, supabaseKey);
            console.log("Supabase client initialized successfully using global window.supabaseJs.createClient.");
        } else {
            console.error('Supabase client library (window.supabase or window.supabaseJs) not found or createClient is not a function. Ensure it is loaded before this script.');
            if (messageStatusDiv) {
                messageStatusDiv.textContent = 'Critical error: Backend library not loaded. Site may not function.';
                messageStatusDiv.style.color = 'red';
            }
        }
    } catch (error) {
        console.error("Failed to initialize Supabase client instance:", error);
        if (messageStatusDiv) {
            messageStatusDiv.textContent = 'Error connecting to backend. Some features may be unavailable.';
            messageStatusDiv.style.color = 'red';
        }
    }

    const THEME_PREFIX = 'theme-';
    const ALL_THEME_NAMES = ['blue', 'red', 'black', 'off-white', 'red-wine', 'ocean-blue'];
    const DEFAULT_THEME_NAME = 'off-white';

    function startBackgroundAnimation() {
        if (window.gsap) {
            gsap.killTweensOf(document.body, "backgroundPosition");

            gsap.to(document.body, {
                backgroundPosition: "300% 300%", 
                duration: 60, 
                ease: "linear",
                repeat: -1,
            });

        } else {
            console.warn("GSAP not available for background animation.");
        }
    }

    function applyTheme(themeName) {
        if (!ALL_THEME_NAMES.includes(themeName)) {
            console.warn(`Attempted to apply unknown theme: ${themeName}. Reverting to default.`);
            themeName = DEFAULT_THEME_NAME;
        }

        const originalBodyTransition = document.body.style.transition;
        document.body.style.transition = 'none';

        ALL_THEME_NAMES.forEach(name => {
            document.body.classList.remove(THEME_PREFIX + name);
        });

        if (themeName === 'black') {
            document.body.style.backgroundColor = '#000000'; 
            document.body.style.backgroundImage = 'none';    
        } else {
            document.body.style.backgroundColor = '';
            document.body.style.backgroundImage = '';
        }

        document.body.classList.add(THEME_PREFIX + themeName);

        void document.body.offsetHeight;

        document.body.style.transition = originalBodyTransition || ''; 

        localStorage.setItem('ephemeralLetterTheme', themeName);
        startBackgroundAnimation(); 
    }

    const themeButtons = document.querySelectorAll('.theme-buttons button');
    const letterTypeSelect = document.getElementById('letter-type');
    const normalLetterOptionsDiv = document.getElementById('normal-letter-options');
    const createLetterBtn = document.getElementById('create-letter-btn');
    const letterTextarea = document.getElementById('letter-text');
    const letterDurationSelect = document.getElementById('letter-duration');
    
    const shareLinkContainer = document.getElementById('share-link-container');
    const shareableLinkField = document.getElementById('shareable-link-field');
    const copyLinkBtn = document.getElementById('copy-link-btn');

    // Account System Elements (now for modal)
    const accountModalOverlay = document.getElementById('account-modal-overlay');
    const accountModal = document.getElementById('account-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    const modalEmailInput = document.getElementById('modal-email-input');
    const modalSendOtpBtn = document.getElementById('modal-send-otp-btn');
    const modalOtpInput = document.getElementById('modal-otp-input');
    const modalVerifyOtpBtn = document.getElementById('modal-verify-otp-btn');
    const modalUsernameInput = document.getElementById('modal-username-input');
    const modalSetUsernameBtn = document.getElementById('modal-set-username-btn');
    const modalAuthMessage = document.getElementById('modal-auth-message');

    // Views within the modal
    const modalEmailEntryView = accountModal.querySelector('#email-entry-view'); // Corrected: Query within modal
    const modalOtpEntryView = accountModal.querySelector('#otp-entry-view');     // Corrected: Query within modal
    const modalUsernameChoiceView = accountModal.querySelector('#username-choice-view'); // Corrected: Query within modal
    const modalLoggedInView = accountModal.querySelector('#logged-in-view');   // Corrected: Query within modal
    const modalUserIdentifierSpan = document.getElementById('modal-user-identifier');
    const modalLogoutBtn = document.getElementById('modal-logout-btn');

    const accountIcon = document.getElementById('account-icon');

    function openAccountModal() {
        if (accountModalOverlay) {
            accountModalOverlay.classList.remove('hidden');
            setTimeout(() => accountModalOverlay.classList.add('visible'), 10); // For transition
            // Check current auth state and show appropriate view
            initializeAuth(true); // Pass flag to indicate it's for modal opening
        }
    }

    function closeAccountModal() {
        if (accountModalOverlay) {
            accountModalOverlay.classList.remove('visible');
            setTimeout(() => accountModalOverlay.classList.add('hidden'), 300); // Match transition duration
        }
    }

    if (accountIcon) {
        accountIcon.addEventListener('click', openAccountModal);
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeAccountModal);
    }
    if (accountModalOverlay) {
        accountModalOverlay.addEventListener('click', (event) => {
            if (event.target === accountModalOverlay) { // Click on overlay itself, not modal content
                closeAccountModal();
            }
        });
    }

    function showAuthView(viewToShow) {
        if (modalEmailEntryView) modalEmailEntryView.style.display = 'none';
        if (modalOtpEntryView) modalOtpEntryView.style.display = 'none';
        if (modalUsernameChoiceView) modalUsernameChoiceView.style.display = 'none';
        if (modalLoggedInView) modalLoggedInView.style.display = 'none';

        if (viewToShow === 'email' && modalEmailEntryView) modalEmailEntryView.style.display = 'block';
        else if (viewToShow === 'otp' && modalOtpEntryView) modalOtpEntryView.style.display = 'block';
        else if (viewToShow === 'username' && modalUsernameChoiceView) modalUsernameChoiceView.style.display = 'block';
        else if (viewToShow === 'loggedIn' && modalLoggedInView) modalLoggedInView.style.display = 'block';
    }

    function displayAuthMessage(message, isError = false) {
        if (modalAuthMessage) {
            modalAuthMessage.textContent = message;
            modalAuthMessage.style.color = isError ? 'red' : (document.body.classList.contains('theme-black') || document.body.classList.contains('theme-blue') || document.body.classList.contains('theme-red') || document.body.classList.contains('theme-red-wine') || document.body.classList.contains('theme-ocean-blue') ? '#a0ffa0' : 'green');
            setTimeout(() => { modalAuthMessage.textContent = ''; }, 5000);
        } else {
            console.log("Auth Message (modal): " + message + (isError ? " (Error)" : " (Info)"));
        }
    }

    async function handleUserSession(session, isModalContext = false) {
        if (session && session.user) {
            const { data: userData, error: userError } = await supabaseClientInstance
                .from('users')
                .select('username')
                .eq('id', session.user.id)
                .single();

            if (userError && userError.code !== 'PGRST116') {
                console.error("Error fetching user data:", userError);
                if (isModalContext) displayAuthMessage("Error fetching user profile.", true);
                if (isModalContext) showAuthView('email'); 
                if(accountIcon) accountIcon.classList.remove('logged-in', 'needs-setup');
                return;
            }

            if (userData && userData.username) {
                if(modalUserIdentifierSpan) modalUserIdentifierSpan.textContent = userData.username;
                if (isModalContext) showAuthView('loggedIn');
                if(accountIcon) {
                    accountIcon.classList.add('logged-in');
                    accountIcon.classList.remove('needs-setup');
                }
                console.log("Logged in as: " + userData.username);
            } else if (session.user.email) {
                if(modalUserIdentifierSpan && isModalContext) modalUserIdentifierSpan.textContent = session.user.email; // Show email temporarily in modal
                if (isModalContext) showAuthView('username');
                if(accountIcon) {
                    accountIcon.classList.add('needs-setup');
                    accountIcon.classList.remove('logged-in');
                }
                console.log("User needs to set username: " + session.user.email);
            } else {
                if (isModalContext) showAuthView('email');
                if(accountIcon) accountIcon.classList.remove('logged-in', 'needs-setup');
            }
        } else {
            if (isModalContext) showAuthView('email');
            if(accountIcon) accountIcon.classList.remove('logged-in', 'needs-setup');
        }
    }

    if (modalSendOtpBtn) {
        modalSendOtpBtn.addEventListener('click', async () => {
            const email = modalEmailInput.value.trim();
            if (!email.endsWith('@gmail.com')) {
                displayAuthMessage('Please enter a valid Gmail address.', true);
                return;
            }
            if (!supabaseClientInstance) {
                displayAuthMessage('Authentication service is unavailable.', true);
                return;
            }
            displayAuthMessage('Sending login code...', false);
            try {
                const { error } = await supabaseClientInstance.auth.signInWithOtp({
                    email: email,
                    options: { shouldCreateUser: true }
                });
                if (error) {
                    console.error("OTP Send Error:", error);
                    displayAuthMessage(`Error sending code: ${error.message}`, true);
                } else {
                    displayAuthMessage('Login code sent to your Gmail!', false);
                    showAuthView('otp');
                }
            } catch (err) {
                console.error("Supabase OTP send call failed:", err);
                displayAuthMessage('Failed to send login code. Check console.', true);
            }
        });
    }

    if (modalVerifyOtpBtn) {
        modalVerifyOtpBtn.addEventListener('click', async () => {
            const email = modalEmailInput.value.trim();
            const token = modalOtpInput.value.trim();
            if (!email || !token) {
                displayAuthMessage('Email and OTP code are required.', true);
                return;
            }
            if (!supabaseClientInstance) {
                displayAuthMessage('Authentication service is unavailable.', true);
                return;
            }
            displayAuthMessage('Verifying code...', false);
            try {
                const { data: { session }, error } = await supabaseClientInstance.auth.verifyOtp({
                    email: email,
                    token: token,
                    type: 'email'
                });
                if (error) {
                    console.error("OTP Verify Error:", error);
                    displayAuthMessage(`Error verifying code: ${error.message}`, true);
                    if (modalOtpInput) modalOtpInput.value = '';
                } else if (session) {
                    displayAuthMessage('Successfully logged in!', false);
                    await handleUserSession(session, true);
                    // Optionally close modal on successful login after a short delay
                    // setTimeout(closeAccountModal, 1500);
                } else {
                    displayAuthMessage('Login failed. Invalid or expired code.', true);
                    if (modalOtpInput) modalOtpInput.value = '';
                }
            } catch (err) {
                console.error("Supabase OTP verify call failed:", err);
                displayAuthMessage('Failed to verify code. Check console.', true);
                if (modalOtpInput) modalOtpInput.value = '';
            }
        });
    }
    
    if (modalSetUsernameBtn) {
        modalSetUsernameBtn.addEventListener('click', async () => {
            const username = modalUsernameInput.value.trim();
            if (!username) {
                displayAuthMessage('Username cannot be empty.', true);
                return;
            }
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
                displayAuthMessage('Username must be 3-20 characters, letters, numbers, or underscores only.', true);
                return;
            }
            if (!supabaseClientInstance) {
                displayAuthMessage('Service unavailable. Cannot set username.', true);
                return;
            }
            const { data: { user } } = await supabaseClientInstance.auth.getUser();
            if (!user) {
                displayAuthMessage('You are not logged in. Please log in first.', true);
                showAuthView('email');
                return;
            }
            displayAuthMessage('Setting username...', false);
            try {
                const { data: existingUser, error: fetchError } = await supabaseClientInstance
                    .from('users')
                    .select('id')
                    .eq('username', username)
                    .single();
                if (fetchError && fetchError.code !== 'PGRST116') {
                    console.error('Error checking username:', fetchError);
                    displayAuthMessage('Error checking username. Please try again.', true);
                    return;
                }
                if (existingUser) {
                    displayAuthMessage('Username already taken. Please choose another.', true);
                    if (modalUsernameInput) modalUsernameInput.value = '';
                    return;
                }
                const { error: insertError } = await supabaseClientInstance
                    .from('users')
                    .insert({ id: user.id, username: username, email: user.email });
                if (insertError) {
                    console.error("Error setting username:", insertError);
                    displayAuthMessage(`Error setting username: ${insertError.message}`, true);
                } else {
                    displayAuthMessage('Username set successfully!', false);
                    if(modalUserIdentifierSpan) modalUserIdentifierSpan.textContent = username;
                    showAuthView('loggedIn');
                    if(accountIcon) {
                         accountIcon.classList.add('logged-in');
                         accountIcon.classList.remove('needs-setup');
                    }
                    // Optionally close modal after setting username
                    // setTimeout(closeAccountModal, 1500);
                }
            } catch (err) {
                console.error("Set username process failed:", err);
                displayAuthMessage('Failed to set username. Check console.', true);
            }
        });
    }

    if (modalLogoutBtn) {
        modalLogoutBtn.addEventListener('click', async () => {
            if (!supabaseClientInstance) {
                displayAuthMessage('Service unavailable.', true);
                return;
            }
            displayAuthMessage('Logging out...', false);
            const { error } = await supabaseClientInstance.auth.signOut();
            if (error) {
                console.error("Logout error:", error);
                displayAuthMessage(`Logout failed: ${error.message}`, true);
            } else {
                displayAuthMessage('Successfully logged out.', false);
                if (modalEmailInput) modalEmailInput.value = '';
                showAuthView('email');
                if(accountIcon) accountIcon.classList.remove('logged-in', 'needs-setup');
                // Optionally close modal on logout
                // setTimeout(closeAccountModal, 1500);
            }
        });
    }

    // Initial check for user session on page load
    async function initializeAuth(isModalContext = false) { // Added isModalContext flag
        if (!supabaseClientInstance) {
            console.warn("Supabase client not available for auth initialization.");
            if(accountIcon) accountIcon.classList.add('service-unavailable');
            if (isModalContext) displayAuthMessage("Account features unavailable.", true);
            return;
        }
        try {
            const { data: { session }, error } = await supabaseClientInstance.auth.getSession();
            if (error) {
                console.error("Error getting session on load:", error);
            }
            await handleUserSession(session, isModalContext); // Pass the flag to handleUserSession

            supabaseClientInstance.auth.onAuthStateChange(async (_event, session) => {
                // When auth state changes globally, update both icon and modal (if open)
                await handleUserSession(session, accountModalOverlay && accountModalOverlay.classList.contains('visible'));
            });

        } catch (e) {
            console.error("Error during auth initialization:", e);
            if(accountIcon) accountIcon.classList.add('service-unavailable');
            if (isModalContext) displayAuthMessage("Error initializing account features.", true);
        }
    }

    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const themeName = button.dataset.theme;
            applyTheme(themeName);
        });
    });

    if (letterTextarea) {
        letterTextarea.addEventListener('input', () => {
            letterTextarea.style.height = 'auto'; 
            letterTextarea.style.height = letterTextarea.scrollHeight + 'px'; 
        });
        setTimeout(() => {
            letterTextarea.style.height = 'auto';
            letterTextarea.style.height = letterTextarea.scrollHeight + 'px';
        }, 0);
    }

    const savedThemeName = localStorage.getItem('ephemeralLetterTheme');
    if (savedThemeName && ALL_THEME_NAMES.includes(savedThemeName)) {
        applyTheme(savedThemeName); 
    } else {
        let currentAppliedIsValid = false;
        for (const name of ALL_THEME_NAMES) {
            if (document.body.classList.contains(THEME_PREFIX + name)) {
                if (name === DEFAULT_THEME_NAME) {
                    currentAppliedIsValid = true;
                } else if (savedThemeName && name === savedThemeName) { 
                    currentAppliedIsValid = true;
                } else { 
                    document.body.classList.remove(THEME_PREFIX + name);
                }
            }
        }
        if (!currentAppliedIsValid && !document.body.classList.contains(THEME_PREFIX + DEFAULT_THEME_NAME)) {
             applyTheme(DEFAULT_THEME_NAME); 
        } else if (!document.body.classList.contains(THEME_PREFIX + DEFAULT_THEME_NAME) && !savedThemeName) {
            applyTheme(DEFAULT_THEME_NAME);
        } else {
            startBackgroundAnimation();
        }
    }

    letterTypeSelect.addEventListener('change', () => {
        normalLetterOptionsDiv.classList.toggle('hidden', letterTypeSelect.value === 'secret');
    });
    normalLetterOptionsDiv.classList.toggle('hidden', letterTypeSelect.value === 'secret');
    

    createLetterBtn.addEventListener('click', async () => {
        if (!supabaseClientInstance) {
            messageStatusDiv.textContent = 'Backend service is unavailable. Cannot create letter.';
            messageStatusDiv.style.color = 'red';
            console.warn('Create letter clicked, but Supabase client instance is not initialized.');
            return;
        }
        const content = letterTextarea.value.trim();
        const type = letterTypeSelect.value;
        const duration = (type === 'normal') ? parseInt(letterDurationSelect.value) : null;

        if (!content) {
            messageStatusDiv.textContent = 'Please write something in your letter.';
            messageStatusDiv.style.color = 'red';
            setTimeout(() => { messageStatusDiv.textContent = ''; }, 3000);
            return;
        }

        const letterData = {
            content: content,
            type: type,
            viewed: false
        };

        if (type === 'normal' && duration) {
            letterData.expires_at = new Date(Date.now() + duration).toISOString();
        }

        // Clear previously viewed letter and animate it out
        if (letterDisplayContent.dataset.isViewedLetter === 'true') {
            letterDisplayContent.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            letterDisplayContent.style.transform = 'scale(1.1)';
            letterDisplayContent.style.opacity = '0';
            setTimeout(() => {
                letterDisplayContent.innerHTML = '<p>Your letter will appear here once created. If you\'re viewing a shared link, the letter content (or status) will be shown here.</p>';
                letterDisplayContent.style.transform = 'scale(1)';
                letterDisplayContent.style.opacity = '1';
                letterDisplayContent.style.transition = ''; // Reset transition
                delete letterDisplayContent.dataset.isViewedLetter;
            }, 500); // Match timeout to transition duration
        }

        try {
            const { data, error } = await supabaseClientInstance
                .from('letters')
                .insert([letterData])
                .select();

            if (error) {
                console.error('Error creating letter (full error object):', error);
                messageStatusDiv.textContent = 'Error creating letter. Check console.';
                messageStatusDiv.style.color = 'red';
                return;
            }

            if (data && data.length > 0) {
                const letterId = data[0].id;
                letterDisplayContent.textContent = content;
                letterDisplayContent.style.display = 'block';
                const currentUrlWithoutQuery = window.location.href.split('?')[0];
                const shareLink = `${currentUrlWithoutQuery}?view=${letterId}`;
                shareableLinkField.value = shareLink;
                shareLinkContainer.style.display = 'block';
                messageStatusDiv.textContent = `Letter created! ${type === 'secret' ? 'This is a one-time view link.' : 'It will expire based on selection.'}`;
                messageStatusDiv.style.color = 'green';
                letterTextarea.value = '';
            } else {
                messageStatusDiv.textContent = 'Letter created, but no ID returned.';
                messageStatusDiv.style.color = 'orange';
            }
        } catch (err) {
            console.error('Supabase call failed (create):', err);
            messageStatusDiv.textContent = 'Failed to create letter. Check console.';
            messageStatusDiv.style.color = 'red';
        }
    });

    copyLinkBtn.addEventListener('click', () => {
        shareableLinkField.select();
        shareableLinkField.setSelectionRange(0, 99999); 
        try {
            navigator.clipboard.writeText(shareableLinkField.value).then(() => {
                messageStatusDiv.textContent = 'Link copied to clipboard!';
                messageStatusDiv.style.color = 'blue';
            }).catch(err => {
                messageStatusDiv.textContent = 'Failed to copy. Try manual copy.';
                messageStatusDiv.style.color = 'red';
            });
        } catch (err) { 
            try {
                document.execCommand('copy');
                messageStatusDiv.textContent = 'Link copied to clipboard! (fallback)';
                messageStatusDiv.style.color = 'blue';
            } catch (e) {
                messageStatusDiv.textContent = 'Failed to copy link. Please copy manually.';
                messageStatusDiv.style.color = 'red';
            }
        }
        setTimeout(() => { 
            const currentStatus = messageStatusDiv.textContent;
            if (currentStatus.includes("copied") || currentStatus.includes("Failed to copy")) {
                 messageStatusDiv.textContent = '';
            }
        }, 3000);
    });


    async function viewLetterFromLink() {
        const urlParams = new URLSearchParams(window.location.search);
        const letterIdToView = urlParams.get('view');

        if (letterIdToView) { 
            if (!supabaseClientInstance) {
                messageStatusDiv.textContent = 'Backend service is unavailable. Cannot load letter.';
                messageStatusDiv.style.color = 'red';
                letterDisplayContent.textContent = 'Failed to connect to letter service.';
                letterDisplayContent.style.display = 'block';
                
                // Do not hide left-pane or change right-pane flex when viewing a letter.
                // The layout should remain the same, and the letter content will appear in its designated area.
                
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }
            // Do not hide left-pane or change right-pane flex when viewing a letter.
            // The layout should remain the same, and the letter content will appear in its designated area.
            shareLinkContainer.style.display = 'none';

            try {
                const { data: letter, error } = await supabaseClientInstance
                    .from('letters')
                    .select('*')
                    .eq('id', letterIdToView)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') { 
                        messageStatusDiv.textContent = 'Letter not found or invalid link.';
                    } else {
                        console.error('Error fetching letter:', error.message);
                        messageStatusDiv.textContent = 'Error fetching letter. Check console.';
                    }
                    messageStatusDiv.style.color = 'red';
                    letterDisplayContent.textContent = '';
                    letterDisplayContent.style.display = 'block';
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return;
                }

                if (letter) {
                    if (letter.type === 'secret') {
                        if (!letter.viewed) {
                            letterDisplayContent.textContent = letter.content;
                            letterDisplayContent.dataset.isViewedLetter = 'true'; // Mark as viewed letter
                            letterDisplayContent.style.display = 'block';
                            messageStatusDiv.textContent = 'This is a secret message. It has been marked as read and cannot be viewed again.';
                            messageStatusDiv.style.color = 'orange';

                            const { error: updateError } = await supabaseClientInstance
                                .from('letters')
                                .update({ viewed: true })
                                .eq('id', letterIdToView);

                            if (updateError) {
                                console.error('Error marking secret letter as viewed:', updateError.message);
                            }
                        } else {
                            letterDisplayContent.textContent = '';
                            letterDisplayContent.style.display = 'block';
                            messageStatusDiv.textContent = 'This secret message has already been viewed or is no longer available.';
                            messageStatusDiv.style.color = 'red';
                        }
                    } else { 
                        const isExpired = letter.expires_at && new Date(letter.expires_at) < new Date();
                        if (!isExpired) {
                            letterDisplayContent.textContent = letter.content;
                            letterDisplayContent.dataset.isViewedLetter = 'true'; // Mark as viewed letter
                            letterDisplayContent.style.display = 'block';
                            const timeLeftMs = new Date(letter.expires_at) - Date.now();
                            const hours = Math.floor(timeLeftMs / 3600000);
                            const minutes = Math.floor((timeLeftMs % 3600000) / 60000);
                            messageStatusDiv.textContent = `This letter is available. Expires in approx. ${hours}h ${minutes}m.`;
                            messageStatusDiv.style.color = 'green';
                        } else {
                            letterDisplayContent.textContent = '';
                            letterDisplayContent.style.display = 'block';
                            messageStatusDiv.textContent = 'This letter has expired.';
                            messageStatusDiv.style.color = 'red';
                        }
                    }
                } else {
                    messageStatusDiv.textContent = 'Letter not found.';
                    messageStatusDiv.style.color = 'red';
                    letterDisplayContent.textContent = '';
                    letterDisplayContent.style.display = 'block';
                }
            } catch (err) {
                console.error('Supabase call failed (view):', err);
                messageStatusDiv.textContent = 'Failed to fetch letter. Check console.';
                messageStatusDiv.style.color = 'red';
                letterDisplayContent.textContent = '';
                letterDisplayContent.style.display = 'block';
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            if (!supabaseClientInstance){
                console.warn("Initial page load: Supabase client instance not initialized. Backend features will be unavailable.");
            }
            // Ensure panes are always visible
            const leftPane = document.querySelector('.left-pane'); 
            const rightPane = document.querySelector('.right-pane'); 
            if (leftPane) leftPane.style.display = 'flex'; 
            if (rightPane) {
                 rightPane.style.flexBasis = ''; 
                 rightPane.style.display = 'flex'; // Ensure right pane is also visible
            } 
            
            letterDisplayContent.innerHTML = '<p>Your letter will appear here once created. If you\'re viewing a shared link, the letter content (or status) will be shown here.</p>';
            letterDisplayContent.style.display = 'block';
            delete letterDisplayContent.dataset.isViewedLetter; // Clear viewed letter flag
            if (supabaseClientInstance) messageStatusDiv.textContent = ''; 
        }
    }

    viewLetterFromLink();
    initializeAuth(false); // Initial call, not in modal context
});