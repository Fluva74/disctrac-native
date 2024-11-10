import os
import qrcode
from firebase_admin import credentials, firestore, initialize_app
from PIL import Image, ImageDraw, ImageFont

# Initialize Firebase Firestore
cred = credentials.Certificate("serviceAccountKey.json")  # Replace with the correct path to your Firebase service account key
initialize_app(cred)
db = firestore.client()

# Set output directory for QR code images
output_dir = "qr_codes"
os.makedirs(output_dir, exist_ok=True)  # Create directory if it doesn't exist

# Set font for adding text below QR code (adjust font path and size if needed)
try:
    font = ImageFont.truetype("arial.ttf", 15)  # Adjust the font size as necessary
except IOError:
    font = ImageFont.load_default()

# Fetch all documents from 'discmain' and generate QR codes
docs = db.collection('discmain').stream()
print("Generating QR codes...")

images = []
for doc in docs:
    data = doc.to_dict()
    uid = data.get('uid', 'N/A')
    company = data.get('company', 'N/A')
    mold = data.get('mold', 'N/A')
    color = data.get('color', 'N/A')

    # Generate QR code image
    qr = qrcode.make(uid)
    qr = qr.resize((200, 200))  # Resize QR code if needed

    # Create a blank image to place QR code and text
    img = Image.new("RGB", (300, 350), "white")
    img.paste(qr, (50, 10))  # Paste QR code at the top of the image

    # Draw text below the QR code
    draw = ImageDraw.Draw(img)
    draw.text((10, 220), f"UID: {uid}", font=font, fill="black")
    draw.text((10, 250), f"Company: {company}", font=font, fill="black")
    draw.text((10, 280), f"Mold: {mold}", font=font, fill="black")
    draw.text((10, 310), f"Color: {color}", font=font, fill="black")

    # Save individual QR code image
    img_path = os.path.join(output_dir, f"{uid}.png")
    img.save(img_path)
    print(f"Saved QR code for UID: {uid}")

    # Collect images for PDF generation
    images.append(img)

# Generate PDF from all QR code images
if images:
    pdf_path = "Disc_QR_Codes.pdf"
    images[0].save(pdf_path, save_all=True, append_images=images[1:])
    print(f"PDF saved as {pdf_path}")
else:
    print("No QR codes were generated.")
