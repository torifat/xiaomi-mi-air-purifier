import { Service, Characteristic } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/CurrentTemperature
export function add(
  device: any,
  service: Service,
  characteristic: typeof Characteristic.CurrentTemperature,
) {
  device.on('temperatureChanged', ({ value }) => {
    service.updateCharacteristic(characteristic, value);
  });

  return service.getCharacteristic(characteristic).onGet(
    // Temperature { value: 23.4, unit: 'C' }
    async () => (await device.temperature()).value,
  );
}
