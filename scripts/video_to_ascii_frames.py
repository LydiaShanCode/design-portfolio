#!/usr/bin/env python3
"""
Convert a video file to ASCII art frames.
Extracts frames from video and converts each frame to ASCII art.
"""

import sys
import os
import argparse
from pathlib import Path

try:
    import cv2
    import numpy as np
    from PIL import Image
except ImportError as e:
    print("Error: Required libraries not installed.")
    print("Please run: pip3 install Pillow opencv-python")
    print(f"Missing: {e}")
    sys.exit(1)

# ASCII characters from darkest to brightest
ASCII_CHARS = ".,-~:;=!*#$@"


def resize_image(image, new_width=100):
    """Resize image maintaining aspect ratio."""
    width, height = image.size
    aspect_ratio = height / width
    new_height = int(new_width * aspect_ratio * 0.55)  # 0.55 for better aspect ratio in terminal
    return image.resize((new_width, new_height))


def grayscale_image(image):
    """Convert image to grayscale."""
    return image.convert('L')


def clean_border_characters(ascii_art):
    """Remove redundant border characters (@ and -) from the sides of each line."""
    lines = ascii_art.split('\n')
    cleaned_lines = []
    
    for line in lines:
        if not line.strip():  # Skip empty lines
            cleaned_lines.append(line)
            continue
        
        # Strip leading @ and - characters
        cleaned_line = line.lstrip('@-')
        # Strip trailing - and @ characters
        cleaned_line = cleaned_line.rstrip('-@')
        
        cleaned_lines.append(cleaned_line)
    
    return '\n'.join(cleaned_lines)


def replace_dots_with_spaces(ascii_art):
    """Replace dots (.) with spaces for transparent background."""
    return ascii_art.replace('.', ' ')


def pixels_to_ascii(image):
    """Convert pixels to ASCII characters."""
    pixels = image.getdata()
    ascii_str = ""
    for pixel_value in pixels:
        # Map pixel value (0-255) to ASCII char index
        # Invert mapping for white background: dark pixels → heavy chars (@), light pixels → light chars (.)
        ascii_index = len(ASCII_CHARS) - 1 - int(pixel_value / 256 * len(ASCII_CHARS))
        ascii_str += ASCII_CHARS[ascii_index]
    return ascii_str


def image_to_ascii(image_path, width=100):
    """Convert an image file to ASCII art."""
    try:
        image = Image.open(image_path)
    except Exception as e:
        print(f"Error opening image {image_path}: {e}")
        return None
    
    # Resize and convert to grayscale
    image = resize_image(image, width)
    image = grayscale_image(image)
    
    # Convert to ASCII
    ascii_str = pixels_to_ascii(image)
    
    # Split into lines
    ascii_str_len = len(ascii_str)
    ascii_img = ""
    for i in range(0, ascii_str_len, width):
        ascii_img += ascii_str[i:i+width] + "\n"
    
    # Clean border characters
    ascii_img = clean_border_characters(ascii_img)
    
    # Replace dots with spaces for transparent background
    ascii_img = replace_dots_with_spaces(ascii_img)
    
    return ascii_img


def extract_frames_from_video(video_path, output_dir, frame_rate=1):
    """
    Extract frames from video and convert to ASCII art.
    
    Args:
        video_path: Path to input video file
        output_dir: Directory to save ASCII frames
        frame_rate: Extract 1 frame every N frames (1 = all frames)
    """
    # Create output directory
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Open video
    cap = cv2.VideoCapture(str(video_path))
    
    if not cap.isOpened():
        print(f"Error: Could not open video file {video_path}")
        return False
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Video: {video_path}")
    print(f"FPS: {fps:.2f}")
    print(f"Total frames: {total_frames}")
    print(f"Extracting every {frame_rate} frame(s)...")
    print(f"Output directory: {output_dir}")
    
    frame_count = 0
    saved_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Extract frame at specified rate
        if frame_count % frame_rate == 0:
            # Convert BGR to RGB (OpenCV uses BGR, PIL uses RGB)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Convert to PIL Image
            pil_image = Image.fromarray(frame_rgb)
            
            # Convert to ASCII
            ascii_art = image_to_ascii_from_pil(pil_image, width=120)
            
            if ascii_art:
                # Save ASCII frame
                frame_filename = output_dir / f"frame-{saved_count:03d}.txt"
                with open(frame_filename, 'w', encoding='utf-8') as f:
                    f.write(ascii_art)
                
                saved_count += 1
                if saved_count % 10 == 0:
                    print(f"Processed {saved_count} frames...")
        
        frame_count += 1
    
    cap.release()
    print(f"\nDone! Created {saved_count} ASCII frames in {output_dir}")
    return True


def image_to_ascii_from_pil(pil_image, width=100):
    """Convert a PIL Image to ASCII art."""
    # Resize and convert to grayscale
    image = resize_image(pil_image, width)
    image = grayscale_image(image)
    
    # Convert to ASCII
    ascii_str = pixels_to_ascii(image)
    
    # Split into lines
    ascii_str_len = len(ascii_str)
    ascii_img = ""
    for i in range(0, ascii_str_len, width):
        ascii_img += ascii_str[i:i+width] + "\n"
    
    # Clean border characters
    ascii_img = clean_border_characters(ascii_img)
    
    # Replace dots with spaces for transparent background
    ascii_img = replace_dots_with_spaces(ascii_img)
    
    return ascii_img


def main():
    parser = argparse.ArgumentParser(description='Convert video to ASCII art frames')
    parser.add_argument('video_path', nargs='?', help='Path to input video file')
    parser.add_argument('-o', '--output', default='src/assets/koi-frames', 
                       help='Output directory for ASCII frames (default: src/assets/koi-frames)')
    parser.add_argument('-r', '--rate', type=int, default=1,
                       help='Extract 1 frame every N frames (default: 1, use higher for fewer frames)')
    parser.add_argument('-w', '--width', type=int, default=120,
                       help='ASCII art width in characters (default: 120)')
    
    args = parser.parse_args()
    
    # Determine video path
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    if args.video_path:
        video_path = Path(args.video_path)
        if not video_path.is_absolute():
            video_path = script_dir / video_path
    else:
        # Look for video in input directory
        input_dir = script_dir / 'input'
        input_dir.mkdir(exist_ok=True)
        
        video_files = list(input_dir.glob('*.mp4')) + list(input_dir.glob('*.mov')) + \
                     list(input_dir.glob('*.avi')) + list(input_dir.glob('*.mkv'))
        
        if not video_files:
            print("Error: No video file found.")
            print(f"Please place a video file in {input_dir} or specify a path.")
            print("\nUsage:")
            print("  python3 scripts/video_to_ascii_frames.py path/to/video.mp4")
            print(f"  Or place video in {input_dir} and run without arguments")
            sys.exit(1)
        
        video_path = video_files[0]
        print(f"Found video: {video_path}")
    
    if not video_path.exists():
        print(f"Error: Video file not found: {video_path}")
        sys.exit(1)
    
    # Set output directory (relative to project root)
    output_dir = project_root / args.output
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Extract frames
    success = extract_frames_from_video(video_path, output_dir, frame_rate=args.rate)
    
    if success:
        print(f"\n✓ ASCII frames saved to: {output_dir}")
        print("You can now use these frames in your React component!")
    else:
        print("\n✗ Conversion failed!")
        sys.exit(1)


if __name__ == '__main__':
    main()
