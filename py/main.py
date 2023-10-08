from __future__ import annotations

import socketio
import eventlet
import time

sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)

config = {
    'sensor_id: 1'
}


@sio.event
def connect(sid, environ):
    print(f'connected {sid=}')


@sio.event
def disconnected(sid):
    print(f'disconnected {sid=}')


@sio.event
def update_config(sid, data):
    print(f'update_config: {data}')


def emit_every_second() -> None:
    while True:
        print('emitting event')
        with open('plot.json') as f:
            sio.emit('beta', f.read())
        eventlet.sleep(1)


eventlet.spawn(emit_every_second)


eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 1234)), app)
