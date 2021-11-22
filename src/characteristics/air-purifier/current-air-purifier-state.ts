import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/CurrentAirPurifierState
export function add(
  device: any,
  service: Service,
  characteristic: typeof Characteristic.CurrentAirPurifierState,
) {
  const {
    INACTIVE,
    // IDLE - Shows "Turning off.." with a spinner,
    PURIFYING_AIR,
  } = characteristic;

  device.on('powerChanged', (isOn: boolean) => {
    service.updateCharacteristic(
      characteristic,
      isOn ? PURIFYING_AIR : INACTIVE,
    );
  });

  return (
    service
      .getCharacteristic(characteristic)
      // Default value
      .updateValue(INACTIVE)
      .onGet(async () => {
        const isOn = await device.power();
        return isOn ? PURIFYING_AIR : INACTIVE;
      })
  );
}
