from PIL import Image
import sys

def make_transparent(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # For the black background version
        # If the pixel is near black, make it transparent
        avg = (item[0] + item[1] + item[2]) / 3
        if avg < 30:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved transparent logo to {output_path}")

if __name__ == "__main__":
    make_transparent(sys.argv[1], sys.argv[2])
