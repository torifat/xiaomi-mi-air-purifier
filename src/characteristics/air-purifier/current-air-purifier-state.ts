import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../../with-device';

// https://developers.homebridge.io/#/characteristic/CurrentAirPurifierState
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.CurrentAirPurifierState,
) {
  const useDevice = withDevice(maybeDevice);
  const {
    INACTIVE,
    // IDLE, // Turning off idle state
    PURIFYING_AIR,
  } = characteristic;

  maybeDevice.then((device) => {
    // TODO: powerChanged doesn't work. Investigate in miio
    device.on('powerChanged', (isOn) => {
      service.updateCharacteristic(
        characteristic,
        isOn ? PURIFYING_AIR : INACTIVE,
      );
    });
  });

  return service.getCharacteristic(characteristic).on(
    CharacteristicEventTypes.GET,
    useDevice(async (device) =>
      (await device.power()) ? PURIFYING_AIR : INACTIVE,
    ),
  );
}
