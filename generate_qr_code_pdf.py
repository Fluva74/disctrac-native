import qrcode
from firebase_admin import firestore, credentials, initialize_app
from PIL import Image, ImageDraw, ImageFont
import os

# Step 1: Initialize Firebase Firestore
cred = credentials.Certificate("serviceAccountKey.json")  # Ensure this path is correct
initialize_app(cred)
db = firestore.client()

# Step 2: Directory to save QR codes
output_dir = "qr_codes"
os.makedirs(output_dir, exist_ok=True)  # Create the directory if it doesn't exist

# Set font for adding text
try:
    font = ImageFont.truetype("arial.ttf", 15)  # Use a font available on your system
except IOError:
    font = ImageFont.load_default()

# Step 3: Generate placeholder QR codes if they don’t exist in Firestore
print("Generating placeholder QR codes for new discs if they don't exist in Firestore...")

for i in range(1, 21):
    uid = f"disc_{i}"
    # Check if UID exists in Firestore
    doc_ref = db.collection('discmain').document(uid)
    doc = doc_ref.get()
    
    if not doc.exists:
        print(f"Document {uid} not found in Firestore. Creating placeholder.")
        # Create a placeholder document in Firestore
        doc_ref.set({
            "uid": uid,
            "company": "N/A",
            "mold": "N/A",
            "color": "N/A"
        })

        # Generate QR code for the placeholder UID
        qr = qrcode.make(uid)
        qr = qr.resize((200, 200))  # Resize QR code if necessary

        # Create a blank image to place QR code and placeholder information
        img = Image.new("RGB", (300, 350), "white")
        img.paste(qr, (50, 10))  # Position the QR code at the top of the image

        # Draw placeholder disc information below the QR code
        draw = ImageDraw.Draw(img)
        draw.text((10, 220), f"UID: {uid}", font=font, fill="black")
        draw.text((10, 250), "Company: N/A", font=font, fill="black")
        draw.text((10, 280), "Mold: N/A", font=font, fill="black")
        draw.text((10, 310), "Color: N/A", font=font, fill="black")

        # Save the placeholder image
        img_path = os.path.join(output_dir, f"{uid}.png")
        img.save(img_path)
        print(f"Generated placeholder QR code for UID: {uid}")

# Step 4: Fetch data from Firestore and generate QR codes for existing discs
print("Fetching documents from Firestore...")

docs = db.collection('discmain').stream()  # Stream all documents in 'discmain' collection

for doc in docs:
    data = doc.to_dict()
    uid = data.get('uid')
    company = data.get('company', 'N/A')
    mold = data.get('mold', 'N/A')
    color = data.get('color', 'N/A')

    if uid:
        print(f"Document ID: {doc.id}, Data: {data}")
        
        # Generate QR code for the UID
        qr = qrcode.make(uid)
        qr = qr.resize((200, 200))  # Resize QR code if necessary

        # Create a blank image to place QR code and disc information
        img = Image.new("RGB", (300, 350), "white")
        img.paste(qr, (50, 10))  # Position the QR code at the top of the image

        # Draw disc information below the QR code
        draw = ImageDraw.Draw(img)
        draw.text((10, 220), f"UID: {uid}", font=font, fill="black")
        draw.text((10, 250), f"Company: {company}", font=font, fill="black")
        draw.text((10, 280), f"Mold: {mold}", font=font, fill="black")
        draw.text((10, 310), f"Color: {color}", font=font, fill="black")

        # Save the image
        img_path = os.path.join(output_dir, f"{uid}.png")
        img.save(img_path)
        print(f"Generated QR code for UID: {uid} with disc information")

# Step 5: Combine all QR code images into a PDF
print("Compiling all QR codes into a PDF...")

# Get all images from the qr_codes directory
image_dir = output_dir
images = [Image.open(os.path.join(image_dir, f)) for f in os.listdir(image_dir) if f.endswith(".png")]

# Save images into a PDF
if images:
    images[0].save("Disc_QR_Codes.pdf", save_all=True, append_images=images[1:])
    print("Saved all QR codes to Disc_QR_Codes.pdf")
else:
    print("No QR code images found to save to PDF.")
