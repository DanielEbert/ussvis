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
    i = 1
    while True:
        i += 1
        print('emitting event')
        with open('plot.json') as f:
            plot = f.read()
        if i % 2 == 0:
            sio.emit('beta', plot)
        else:
            sio.emit('gamma', plot)
        eventlet.sleep(1)


eventlet.spawn(emit_every_second)


eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 1234)), app)
