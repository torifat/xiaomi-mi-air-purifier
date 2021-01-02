import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../../with-device';

// https://developers.homebridge.io/#/characteristic/FilterLifeLevel
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.FilterLifeLevel,
) {
  const useDevice = withDevice<number>(maybeDevice);

  maybeDevice.then((device) => {
    device.on('filterLifeChanged', (value: number) => {
      service.updateCharacteristic(characteristic, value);
    });
  });

  return service.getCharacteristic(characteristic).on(
    CharacteristicEventTypes.GET,
    useDevice(async (device) => device.property('filter_life').value),
  );
}
