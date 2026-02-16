import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class Tracking {

  private socket!: Socket;

  connect(deviceId: string) {
    this.socket = io('http://localhost:3000', {
      auth: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NzU3YWZkMC05NDI1LTQwOTAtOTE4MC1lMzgyOGYxYTM4NjEiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3MTAyNjk1NCwiZXhwIjoxNzcxMTEzMzU0fQ.YPgcRVT-2h9R_T1GJjkqmi6Fcke8Unb7PV86ayzS9GI',
      },
    });

    this.socket.on('connect', () => {
      console.log('🔌 Conectado al websocket');

      // 👇 unirse al room del dispositivo
      this.socket.emit('joinDevice', deviceId);
    });
  }

  onLocation(callback: (data: any) => void) {
    this.socket.on('receiveLocation', callback);
  }
}
