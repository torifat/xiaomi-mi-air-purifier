import { Service, Characteristic } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/CurrentRelativeHumidity
export function add(
  device: any,
  service: Service,
  characteristic: typeof Characteristic.CurrentRelativeHumidity,
) {
  device.on('relativeHumidityChanged', (value: number) => {
    service.updateCharacteristic(characteristic, value);
  });

  return service
    .getCharacteristic(characteristic)
    .onGet(async () => await device.rh());
}
