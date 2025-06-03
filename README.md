# PlayDisc - Ultimate Frisbee Play Editor

A web application for creating and visualizing Ultimate Frisbee plays. Built with React, TypeScript, and Firebase.

## Features

- Create and edit Ultimate Frisbee plays with a visual editor
- Animate player movements between frames
- Support for offensive and defensive players, discs, and cones
- Multiple field configurations
- Real-time saving to Firebase
- Undo/redo functionality
- Multi-select and bulk operations
- Keyboard shortcuts for common actions

## Tech Stack

- React 18
- TypeScript
- Vite
- Firebase (Firestore)
- Konva.js for canvas rendering
- Tailwind CSS for styling

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/playdisc.git
   cd playdisc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Keyboard Shortcuts

- `Delete` or `Backspace`: Delete selected objects
- `Escape`: Clear selection
- `Ctrl/Cmd + A`: Select all objects
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo

### Mouse Controls

- Click to select an object
- Shift + Click to multi-select
- Click and drag to move objects
- Click empty space to deselect

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
