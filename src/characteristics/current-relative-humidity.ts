import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../with-device';

// https://developers.homebridge.io/#/characteristic/CurrentRelativeHumidity
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.CurrentRelativeHumidity,
) {
  const useDevice = withDevice<number>(maybeDevice);

  maybeDevice.then((device) => {
    device.on('relativeHumidityChanged', (value: number) => {
      service.updateCharacteristic(characteristic, value);
    });
  });

  return service.getCharacteristic(characteristic).on(
    CharacteristicEventTypes.GET,
    useDevice(async (device) => await device.rh()),
  );
}
