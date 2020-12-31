import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../../with-device';

// https://developers.homebridge.io/#/characteristic/Active
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.Active,
) {
  const useDevice = withDevice(maybeDevice);
  const { ACTIVE, INACTIVE } = characteristic;

  maybeDevice.then((device) => {
    // TODO: powerChanged doesn't work. Investigate in miio
    device.on('powerChanged', (isOn) => {
      // TODO: check device state, async state can be stale
      service.updateCharacteristic(characteristic, isOn ? ACTIVE : INACTIVE);
    });
  });

  return service
    .getCharacteristic(characteristic)
    .on(
      CharacteristicEventTypes.GET,
      useDevice(async (device) => ((await device.power()) ? ACTIVE : INACTIVE)),
    )
    .on(
      CharacteristicEventTypes.SET,
      useDevice(async (device, value) => {
        try {
          await device.power(value);
          return value;
        } catch {
          return (value as number) ^ 1;
        }
      }),
    );
}
