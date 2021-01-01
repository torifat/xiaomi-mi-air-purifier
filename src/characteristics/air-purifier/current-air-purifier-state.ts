import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../../with-device';

// https://developers.homebridge.io/#/characteristic/CurrentAirPurifierState
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.CurrentAirPurifierState,
) {
  const { INACTIVE, IDLE, PURIFYING_AIR } = characteristic;
  const useDevice = withDevice<typeof INACTIVE | typeof PURIFYING_AIR>(
    maybeDevice,
  );

  maybeDevice.then((device) => {
    device.on('powerChanged', (isOn: boolean) => {
      service.updateCharacteristic(
        characteristic,
        isOn ? PURIFYING_AIR : INACTIVE,
      );
    });

    device.on('fanSpeedChanged', (speed: number) => {
      service.updateCharacteristic(
        characteristic,
        speed > 0 ? PURIFYING_AIR : IDLE,
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
