import { Service, Characteristic } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/PM2_5Density
export function add(
  device: any,
  service: Service,
  characteristic: typeof Characteristic.PM2_5Density,
) {
  device.on('pm2.5Changed', (value) => {
    service.updateCharacteristic(characteristic, value);
  });

  return service
    .getCharacteristic(characteristic)
    .onGet(async () => await device.pm2_5());
}
