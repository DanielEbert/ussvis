from __future__ import annotations

import socketio
import sys

sio = socketio.Client()

@sio.event
def connect():
    print('connected')

@sio.event
def disconnected():
    print('disconnected')

with open(sys.argv[1]) as f:
    plot = f.read()

sio.connect('http://localhost:1234')


sio.emit('echo_plot', plot)

print('send')
