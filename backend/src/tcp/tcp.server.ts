import * as net from 'net';
import { PrismaService } from 'prisma/prisma.service';
import { DevicesGateway } from '../devices/devices.gateway';
import * as queclink from 'queclink-parser';

export function startTcpServer(
  prisma: PrismaService,
  gateway: DevicesGateway,
) {
  const server = net.createServer((socket) => {
    console.log('📡 GPS conectado:', socket.remoteAddress);

    socket.on('data', async (data: Buffer) => {
      try {
        const raw = data.toString().trim();

        console.log('📥 Trama recibida:', raw);

        const parsed = queclink.parse(data);

        if (!parsed || !parsed.imei) return;

        const device = await prisma.device.findUnique({
          where: { imei: parsed.imei },
        });

        if (!device) {
          console.log('❌ IMEI no registrado:', parsed.imei);
          return;
        }

        if (!parsed.loc || !parsed.loc.coordinates) return;

        const [lng, lat] = parsed.loc.coordinates;

        const location = await prisma.deviceLocation.create({
          data: {
            deviceId: device.id,
            lat,
            lng,
            speed: parsed.speed || 0,
            heading: parsed.azimuth || 0,
          },
        });

        // Emitir en tiempo real
        gateway.server.to(device.id).emit('receiveLocation', {
          deviceId: device.id,
          lat,
          lng,
          speed: parsed.speed,
          heading: parsed.azimuth,
        });

        console.log('✅ Ubicación guardada:', device.imei);
      } catch (err) {
        console.log('⚠️ Error procesando trama:', err.message);
      }
    });

    socket.on('error', (err) => {
      console.log('⚠️ Error TCP:', err.message);
    });
  });

  server.listen(1721, () => {
    console.log('🚀 TCP Server escuchando en puerto 1721');

    // 🔥 SIMULACIÓN TEMPORAL
    let lat = 19.4326;
    let lng = -99.1332;
    const deviceId = 'test-device-id'; // usa un ID real de tu BD si quieres probar completo

    setInterval(() => {

      lat += (Math.random() - 0.5) * 0.002;
      lng += (Math.random() - 0.5) * 0.002;

      gateway.server.emit('receiveLocation', {
        deviceId,
        lat,
        lng,
        speed: Math.random() * 80,
        heading: Math.random() * 360,
      });

      console.log('🧪 Simulación enviada:', lat, lng);

    }, 2000);
  });

}
