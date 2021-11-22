import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/FilterLifeLevel
export function add(
  device: any,
  service: Service,
  characteristic: typeof Characteristic.FilterLifeLevel,
) {
  device.on('filterLifeChanged', (value: number) => {
    service.updateCharacteristic(characteristic, value);
  });

  return service
    .getCharacteristic(characteristic)
    .onGet(() => device.property('filter_life').value);
}
