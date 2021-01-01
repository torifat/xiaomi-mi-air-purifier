import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../with-device';

// https://developers.homebridge.io/#/characteristic/CurrentTemperature
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.CurrentTemperature,
) {
  const useDevice = withDevice<number>(maybeDevice);

  maybeDevice.then((device) => {
    device.on('temperatureChanged', ({ value }) => {
      service.updateCharacteristic(characteristic, value);
    });
  });

  return service.getCharacteristic(characteristic).on(
    CharacteristicEventTypes.GET,
    // Temperature { value: 23.4, unit: 'C' }
    useDevice(async (device) => await device.temperature().value),
  );
}
