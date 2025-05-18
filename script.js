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
                
                const leftPane = document.querySelector('.left-pane');
                if (leftPane) leftPane.style.display = 'none';
                const rightPane = document.querySelector('.right-pane');
                if (rightPane) rightPane.style.flexBasis = '100%';
                
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }
            const leftPane = document.querySelector('.left-pane');
            if (leftPane) {
                leftPane.style.display = 'none';
            }
            const rightPane = document.querySelector('.right-pane');
            if (rightPane) {
                 rightPane.style.flexBasis = '100%';
            }
            const appContainer = document.querySelector('.app-container');
            if (appContainer && leftPane && !rightPane) { 
                leftPane.style.flexBasis = '100%';
            }
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
            const leftPane = document.querySelector('.left-pane'); 
            const rightPane = document.querySelector('.right-pane'); 
            if (leftPane) leftPane.style.display = 'flex'; 
            if (rightPane) rightPane.style.flexBasis = ''; 
            
            letterDisplayContent.innerHTML = '<p>Your letter will appear here once created. If you\'re viewing a shared link, the letter content (or status) will be shown here.</p>';
            letterDisplayContent.style.display = 'block';
            if (supabaseClientInstance) messageStatusDiv.textContent = ''; 
        }
    }

    viewLetterFromLink();
});