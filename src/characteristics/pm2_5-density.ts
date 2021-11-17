import { Service, Characteristic } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/PM2_5Density
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.PM2_5Density,
) {
  maybeDevice.then((device) => {
    device.on('pm2.5Changed', (value) => {
      service.updateCharacteristic(characteristic, value);
    });
  });

  return service.getCharacteristic(characteristic).onGet(async () => {
    const device = await maybeDevice;
    return await device.pm2_5();
  });
}
