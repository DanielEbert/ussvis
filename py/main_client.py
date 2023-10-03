from __future__ import annotations

import socketio
import sys
import time

sio = socketio.Client()

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


with open(sys.argv[1]) as f:
    plot = f.read()

sio.connect('http://localhost:1234')

sio.emit('echo_plot', plot)

print('send')

while True:
    time.sleep(0.1)

sio.disconnect()
