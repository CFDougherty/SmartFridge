from flask import Flask, Response
from picamera2 import Picamera2
import io
import time
from PIL import Image

app = Flask(__name__)
picam2 = Picamera2()
picam2.configure(picam2.create_still_configuration(main={"size": (4056, 3040)}))
picam2.start()

def generate_image():
    stream = io.BytesIO()
    picam2.capture_file(stream, format='jpeg')
    stream.seek(0)

    # Rotate 90 degrees. Important for preview, doesn't seem to affect models
    image = Image.open(stream)
    rotated_image = image.rotate(-90, expand=True)

    output_stream = io.BytesIO()
    rotated_image.save(output_stream, format='JPEG')
    output_stream.seek(0)

    return output_stream.read()

@app.route('/image.jpg')
def serve_image():
    image_data = generate_image()
    return Response(image_data, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
