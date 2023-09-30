from __future__ import annotations

import socket
import json
import struct
import threading
import queue
import time


# do this in second thread
# ipc via queue

# read from queue until empty. if there is nothing, skip to wait
# create img
# send img to render
# wait X seconds

messages = queue.SimpleQueue()


def listen() -> None:
    server_addr = ('localhost', 8032)
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(server_addr)

    try:
        while True:
            data, address = sock.recvfrom(52_428_800)  # 50 MB

            try:
                message = json.loads(data)
                # print(f'Received from {address}:\n{message}\n')
                messages.put(message)
            except Exception as e:
                print(f'Failed to parse json from {address}: {e}')
    finally:
        sock.close()


listen_thread = threading.Thread(target=listen)
listen_thread.daemon = True
listen_thread.start()

while True:
    received_messages = []
    while not messages.empty():
        received_messages.append(messages.get(block=False))

    print(f'Received len {len(received_messages)}')

    if received_messages:
        ...

    time.sleep(1)
