# Door Panel Calculator

A modern webapp for calculating and visualizing door panel layouts using golden ratio proportions. Perfect for designers, carpenters, and homeowners planning decorative door panels.

![Door Panel Calculator Screenshot](./docs/screenshot.png)

## Features

- 🎨 **Visual Door Representation**: Real-time SVG visualization of your door and panels
- 📏 **Multiple Panel Configurations**: Support for 2, 3, 4, or 5 panels
- 🏛️ **Golden Ratio Proportions**: Built-in golden ratio calculations for aesthetically pleasing layouts
- 🔧 **Flexible Proportions**: Equal, golden ratio, classic, fibonacci, and reverse golden sequences
- 👁️ **Peephole Integration**: Special handling for peephole cutouts with conflict detection
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- ⚡ **Real-time Updates**: Instant calculations and visualization as you adjust parameters

## Mathematical Foundations

The app uses several proportional systems:

- **Golden Ratio (φ)**: 1.618... - Creates naturally pleasing proportions
- **Fibonacci Sequence**: 1, 1, 2, 3, 5... - Natural mathematical progression
- **Classical Proportions**: Traditional ratios like 1:2 and small-large-small patterns
- **Equal Distribution**: Uniform panel heights for modern aesthetics

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project files**
2. **Navigate to the project directory**
   ```bash
   cd door-panel-calculator
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

### Development

**Start the development server:**
```bash
npm run dev
```
or
```bash
yarn dev
```

This will:
- Start the Vite development server
- Open your browser to `http://localhost:3000`
- Enable hot module replacement for instant updates

### Building for Production

**Create a production build:**
```bash
npm run build
```
or
```bash
yarn build
```

The optimized build will be created in the `dist/` directory.

**Preview the production build locally:**
```bash
npm run preview
```
or
```bash
yarn preview
```

### Linting

**Run ESLint to check code quality:**
```bash
npm run lint
```
or
```bash
yarn lint
```

## Project Structure

```
door-panel-calculator/
├── public/                 # Static assets
├── src/                   # Source code
│   ├── components/        # React components
│   │   └── DoorPanelCalculator.jsx
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles (Tailwind)
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── README.md            # This file
```

## Usage Guide

### Basic Setup

1. **Enter Door Dimensions**: Set your door width and height in centimeters
2. **Configure Panels**: Choose number of panels (2-5) and set edge distance and gaps
3. **Select Proportions**: Choose from golden ratio, equal, classic, or other proportion types
4. **View Results**: See real-time visualization and exact panel measurements

### Peephole Integration

1. **Enable Peephole**: Check "Show Peephole Cutout"
2. **Set Position**: Enter distance from top and peephole height
3. **Check Conflicts**: The app will warn you if the peephole interferes with panel edges
4. **Optimize Layout**: Adjust panel count or proportions to avoid conflicts

### Proportion Types

- **Equal**: All panels same height - modern, clean look
- **Golden**: Uses φ (1.618) ratios - naturally pleasing proportions
- **Classic**: Traditional door proportions (1:2, small-large-small)
- **Fibonacci**: Natural mathematical sequence proportions
- **Reverse**: Descending golden sequence proportions

### Panel Specifications

The app provides exact measurements for:
- Individual panel dimensions (width × height)
- Total space utilization
- Proportion ratios between panels
- Conflict warnings for peepholes

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool with hot module replacement
- **Tailwind CSS**: Utility-first CSS framework for styling
- **SVG**: Scalable vector graphics for door visualization
- **ESLint**: Code quality and consistency checking

## Deployment

The built application is a static website that can be deployed to:

- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Push the `dist/` contents to gh-pages branch
- **Any static hosting**: Upload the `dist/` folder contents

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Modern mobile browsers

## Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run lint`
5. Submit a pull request

## Design Philosophy

This tool prioritizes:
- **Accuracy**: Precise mathematical calculations for panel proportions
- **Usability**: Intuitive interface with real-time feedback
- **Flexibility**: Support for various door sizes and panel configurations
- **Visual Clarity**: Clear visualization of the final result
- **Practical Application**: Real-world measurements ready for construction

## Use Cases

- **Homeowners**: Planning decorative panels for interior doors
- **Carpenters**: Calculating precise panel dimensions
- **Designers**: Exploring proportional relationships in door design
- **Students**: Learning about golden ratio applications in design
- **Architects**: Quickly iterating door panel concepts

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For questions or issues:
1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Include screenshots if applicable

---

*Built with ⚡ Vite + ⚛️ React + 🎨 Tailwind CSS*