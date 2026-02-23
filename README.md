# Portfolio 2026

A modern design portfolio website for Lydia, featuring water ripple effects, animated koi fish, custom cursor, dynamic title animations, bento box project grid, and an easily updatable activity log.

## Features

- **Water Ripple Effects**: Interactive canvas-based water ripples on cursor movement and clicks
- **Custom Cursor**: Smooth elastic-motion cursor with hover effects
- **Animated Koi Fish**: Two ASCII art koi fish swimming in a circular pattern
- **Dynamic Title**: Animated title that cycles through different verbs (designing, building, deploying, drawing, performing on stage)
- **Bento Box Projects Grid**: Responsive grid layout for project showcase
- **Activity Log**: Easily updatable JSON-based activity feed

## Tech Stack

- React + Vite
- Tailwind CSS
- JavaScript
- Canvas API (for water effects)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Updating Activity Log

The activity log is stored in `src/data/activity-log.json`. You can easily update it using:

1. **GitHub Mobile App**: Edit the JSON file directly from your phone
2. **Any text editor**: The JSON structure is simple and straightforward

Example entry:
```json
{
  "date": "2024-01-15",
  "title": "Shipped new feature",
  "description": "Just launched a new design system component",
  "links": [
    {
      "text": "Twitter",
      "url": "https://twitter.com/example"
    }
  ]
}
```

## Project Structure

```
src/
├── components/      # React components
├── styles/          # CSS files (Tailwind + custom)
├── data/            # JSON data files
└── assets/          # Images and other assets
```
