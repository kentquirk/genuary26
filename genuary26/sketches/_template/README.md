# **NAME**

## **TITLE**

More text goes here

## Getting Started

1. Copy this `_template` folder to a new folder with your sketch name:

   ```bash
   cp -r _template my-sketch-name
   cd my-sketch-name
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Structure

- `src/App.tsx` - Main React component with layout and UI controls
- `src/sketch.ts` - p5.js sketch code in instance mode
- `src/App.css` - Styling for the app
- `src/main.tsx` - Entry point

## Customization

1. Update the title and description in `App.tsx`
2. Add your sketch logic to `src/sketch.ts`
3. Add additional UI controls in `App.tsx` as needed
4. Update `package.json` with your sketch name

## Features

- Square canvas that's responsive to screen width
- React-Bootstrap UI components
- Keyboard shortcuts:
  - Spacebar: Pause/unpause
  - 'r': Restart sketch
- Example buttons for color randomization and restart
