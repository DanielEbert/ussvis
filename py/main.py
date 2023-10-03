from __future__ import annotations

import socketio
import eventlet
import sys
import time

sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)

config = {
    'sensor_id: 1'
}


@sio.event
def connect():
    print('connected')


@sio.event
def disconnected():
    print('disconnected')


@sio.event
def update_config(data):
    print(f'update_config: {data}')


# with open(sys.argv[1]) as f:
#     plot = f.read()

# sio.connect('http://localhost:1234')

# sio.emit('echo_plot', plot)

print('send')
eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 1234)), app)
