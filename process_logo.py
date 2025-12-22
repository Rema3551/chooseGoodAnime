import sys
import subprocess
import math
import os

try:
    from PIL import Image, ImageFilter, ImageOps
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageFilter, ImageOps

def add_outline(img, stroke_width, color, crop_first=True):
    # crop first to save processing time
    if crop_first:
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
    # Resize canvas to fit stroke
    # Create a larger canvas
    new_size = (img.width + stroke_width * 2, img.height + stroke_width * 2)
    new_img = Image.new("RGBA", new_size, (0, 0, 0, 0))
    
    # Paste original in center
    new_img.paste(img, (stroke_width, stroke_width))
    
    # Get alpha channel
    alpha = new_img.getchannel('A')
    
    # Create outline by dilating the alpha channel
    # Max filter is essentially dilation
    # Apply it multiple times or use a larger kernel if possible.
    # PIL's MaxFilter is square.
    outline_alpha = alpha.filter(ImageFilter.MaxFilter(stroke_width * 2 + 1))
    
    # Create a solid color image for the outline
    outline_base = Image.new("RGBA", new_size, color)
    outline_base.putalpha(outline_alpha)
    
    # Composite: Paste original ON TOP of outline
    outline_base.paste(img, (stroke_width, stroke_width), img)
    
    return outline_base

def process_logo(input_path, output_path):
    print(f"Processing {os.path.basename(input_path)} with White Border...")
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # 1. Background Removal (Simple Threshold or use existing transparency if user said "I did it")
        # User said "I succeeded without you", implying their current logo might be good? 
        # But they sent a request to "resize AND clean well" before... 
        # Let's assume the input file is the one we prepared or the raw one. 
        # Safer to re-run the robust removal just in case, OR just trust alpha if it exists.
        
        # NOTE: If we iterate on the ALREADY PROCESSED file 'public/logo.png', we might degrade quality.
        # Let's go back to the source 'uploaded_image_...'.
        
        # (Re-running simplified background clean just to be safe it's clean for the border)
        width, height = img.size
        if img.getextrema()[3][0] == 255: # If opaque
             # reuse previous simple flood fill logic or similar
             pass # assume user wants us to use the raw one and clean it? 
             # Actually user said "ça marche pas" then "c'est bon j'ai réussi sans toi".
             # MAYBE they uploaded a CLEAN PNG? 
             # Let's check if the source has transparency.
             pass

        # Let's assume we need to clean it if it's opaque.
        if img.getextrema()[3][0] == 255:
             # Fast clean similar to before
             pixels = img.load()
             bg_color = pixels[0, 0]
             stack = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
             visited = set(stack)
             tolerance = 40
             while stack:
                x, y = stack.pop()
                pixels[x, y] = (0, 0, 0, 0)
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height:
                        if (nx, ny) not in visited:
                            visited.add((nx, ny))
                            diff = math.sqrt(sum((a - b) ** 2 for a, b in zip(pixels[nx, ny][:3], bg_color[:3])))
                            if diff < tolerance:
                                stack.append((nx, ny))

        
        # 2. Add White Border
        # Resize down slightly first to make the border operation cheaper and smoother?
        # Or do it at high res? High res is better.
        img_with_border = add_outline(img, stroke_width=15, color=(255, 255, 255, 255))
        
        # 3. Resize finding
        max_dim = 512
        img_with_border.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        
        img_with_border.save(output_path, "PNG")
        print(f"Success! Saved with border to {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Using the last uploaded image
    input_file = r"C:\Users\zbouv\.gemini\antigravity\brain\ba4f3ab8-ba7e-40e1-8413-97d7c2cdff64\uploaded_image_1766442631763.png"
    output_file = r"c:\Users\zbouv\.gemini\antigravity\scratch\chooseGoodAnime\public\logo.png"
    
    print(f"Processing {os.path.basename(input_file)}...")
    try:
        img = Image.open(input_file).convert("RGBA")
        
        # Add White Border (Small - 8px)
        img_with_border = add_outline(img, stroke_width=8, color=(255, 255, 255, 255))
        
        # Resize finding (Keep high quality, maybe slightly larger max dim if needed)
        max_dim = 512
        img_with_border.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        
        img_with_border.save(output_file, "PNG")
        print(f"Success! Saved with border to {output_file}")
            
    except Exception as e:
        print(f"Error: {e}")
