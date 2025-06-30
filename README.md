# Ephemeral Letters

A secure, elegant and retro styled web application for sending self-destructing messages and private communications. Built with modern web technologies and featuring a unique retro-inspired Macintosh interface.
Note- For Privacy matters, please do not input sensitive information, just assume its a text messaging web application.

![Ephemeral Letters](Assets/Apple-Front.jpeg)

## Disclaimer: Educational and Aesthetic Use of Macintosh Classic Image

**Please note:** The use of the Macintosh Classic image in this project is strictly for educational and aesthetic purposes. It serves to create a visually engaging and nostalgic user experience, demonstrating the integration of classic design elements with modern web technologies. This project, "Ephemeral Letters," is a non-commercial endeavor created for learning and portfolio demonstration. **This specific repository and its associated live demonstration will not be monetized in any form.** We respect Apple's intellectual property and brand. The inclusion of the Macintosh image is a tribute to its iconic design and its impact on personal computing history, and is not intended to imply any affiliation with or endorsement by Apple Inc.

## Features

### 🔒 Secure Messaging
- **Secret Messages**: One-time view messages that self-destruct after reading
- **Timed Messages**: Normal letters with configurable expiration times (1 hour to 1 day)
- **Private Communication**: Direct user-to-user messaging with username support

### 🎨 User Experience
- **Retro-Modern Interface**: Inspired by classic Macintosh design
- **Theme Options**: Six carefully crafted themes to suit your style
  - Blue
  - Red
  - Black
  - Off-White (Default)
  - Red Wine
  - Ocean Blue
- **Smooth Animations**: GSAP-powered scrolling and transitions
- **Toggle Animation**: Option to disable animations for performance

### ✍️ Writing Tools
- **Quick Snippets**: Pre-formatted text snippets for:
  - Salutations
  - Sender Information
  - Letter Closings
- **Rich Text Area**: Comfortable writing environment
- **Share Links**: Easy-to-share message links

### 👤 User Account System
- Multiple authentication methods:
  - Email & Password
  - One-Time Password (OTP) via email
- Customizable usernames
- Secure session management

## Technology Stack

- **Frontend**:
  - HTML5
  - CSS3
  - JavaScript (Vanilla)
- **Animation**: GSAP (GreenSock Animation Platform)
  - ScrollTrigger
  - ScrollSmoother
- **Backend**:
  - Supabase (Backend as a Service)
- **Authentication**:
  - Supabase Auth

## Setup

1. **Clone the repository**
```powershell
git clone [your-repository-url]
cd [repository-name]
```

2. **Configure Supabase**
- Create a Supabase project
- Update `supabaseUrl` and `supabaseKey` in `script.js`

3. **Serve the application**
- Use any local server of your choice (e.g., Live Server VS Code extension)
- Open `index.html` in your browser

## Development

The project structure is organized as follows:
```
├── index.html          # Main HTML structure
├── styles.css         # Styling and themes
├── script.js         # Application logic
└── Assets/
    ├── Apple-Front.jpeg    # Macintosh image
    ├── background.jpeg     # Background asset
    └── TestTiemposFine-Light.otf  # Custom font
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Creator

Created by @thvlayu

Connect:
- GitHub: [Your GitHub Profile]
- Instagram: [Your Instagram Profile]

---

Made with ❤️ for privacy-conscious individual who value the art of ephemeral messaging.