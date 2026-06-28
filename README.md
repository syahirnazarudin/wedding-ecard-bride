# Wedding E-card

Simple Vite project for Syahir and Zubairah's wedding invitation.

## Project structure

- `index.html` - page markup only
- `src/css/main.css` - all styling
- `src/js/main.js` - page interactions
- `src/js/api.js` - RSVP API/demo submission helper
- `public/` - static files such as `music.mp3` and section background images
- `vite.config.js` - Vite build configuration

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

To connect a real RSVP backend later, add the endpoint URL to `RSVP_ENDPOINT` in `src/js/api.js`.

To enable background music, place your audio file at `public/music.mp3`.

Section backgrounds are currently referenced from `public/assets/images/`:

- `main-cover.jpg`
- `intro-bg.jpg`
- `details-bg.jpg`
- `ucapan-bg.jpg`
- `rsvp-bg.jpg`
- `wishes-bg.jpg`
