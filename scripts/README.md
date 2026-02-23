# Koi Fish ASCII Animation Converter

This script converts a video of koi fish swimming into multiple ASCII art frames.

## Installation

1. Install required Python libraries:
```bash
pip3 install -r requirements.txt
```

Or install individually:
```bash
pip3 install Pillow opencv-python
```

## Usage

1. Place your video file in the `scripts/input/` directory
2. Run the conversion script:
```bash
python3 scripts/video_to_ascii_frames.py
```

Or specify a video file:
```bash
python3 scripts/video_to_ascii_frames.py path/to/your/video.mp4
```

3. The ASCII frames will be saved to `src/assets/koi-frames/` directory
4. Frames will be numbered: `frame-000.txt`, `frame-001.txt`, etc.

## Output

- ASCII art frames saved as `.txt` files
- Each frame represents one moment in the animation
- Frames are optimized for display in the React component
