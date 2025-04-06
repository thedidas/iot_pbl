from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import eventlet

eventlet.monkey_patch()

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

@app.route('/')
def index():
    return render_template('index.html')  # Optional: a dashboard page

@app.route('/upload', methods=['POST'])
def upload_data():
    data = request.json
    print("Received data:", data)

    # Broadcast to all connected clients via Socket.IO
    socketio.emit('piezo_data', data)
    return jsonify({'status': 'success'}), 200

@socketio.on('connect')
def on_connect():
    print("Client connected")
    emit('message', {'msg': 'Connected to server'})

@socketio.on('disconnect')
def on_disconnect():
    print("Client disconnected")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
