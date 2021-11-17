import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/FilterLifeLevel
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.FilterLifeLevel,
) {
  maybeDevice.then((device) => {
    device.on('filterLifeChanged', (value: number) => {
      service.updateCharacteristic(characteristic, value);
    });
  });

  return service.getCharacteristic(characteristic).onGet(async () => {
    const device = await maybeDevice;
    return device.property('filter_life').value;
  });
}
