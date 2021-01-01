import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../../with-device';

// https://developers.homebridge.io/#/characteristic/Active
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.Active,
) {
  const { ACTIVE, INACTIVE } = characteristic;
  const useDevice = withDevice<typeof ACTIVE | typeof INACTIVE>(maybeDevice);

  maybeDevice.then((device) => {
    device.on('powerChanged', (isOn: boolean) => {
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
      useDevice(async (device, newStatus) => {
        const currentStatus = await device.power();
        if (currentStatus !== newStatus) {
          const [{ code }] = await device.changePower(newStatus);
          return code === 0 ? newStatus : undefined;
        }
        return undefined;
      }),
    );
}
