import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../with-device';

// https://developers.homebridge.io/#/characteristic/PM2_5Density
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.PM2_5Density,
) {
  const useDevice = withDevice(maybeDevice);

  maybeDevice.then((device) => {
    device.on('pm2.5Changed', (value) => {
      service.updateCharacteristic(characteristic, value);
    });
  });

  return service.getCharacteristic(characteristic).on(
    CharacteristicEventTypes.GET,
    useDevice(async (device) => await device.pm2_5()),
  );
}
