import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/CurrentAirPurifierState
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.CurrentAirPurifierState,
) {
  const {
    INACTIVE,
    // IDLE - Shows "Turning off.." with a spinner,
    PURIFYING_AIR,
  } = characteristic;

  maybeDevice.then((device) => {
    device.on('powerChanged', (isOn: boolean) => {
      service.updateCharacteristic(
        characteristic,
        isOn ? PURIFYING_AIR : INACTIVE,
      );
    });
  });

  return service.getCharacteristic(characteristic).onGet(async () => {
    const device = await maybeDevice;
    const isOn = await device.power();
    return isOn ? PURIFYING_AIR : INACTIVE;
  });
}
