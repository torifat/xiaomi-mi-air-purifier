import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../../with-device';

// https://developers.homebridge.io/#/characteristic/LockPhysicalControls
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.LockPhysicalControls,
) {
  const { CONTROL_LOCK_ENABLED, CONTROL_LOCK_DISABLED } = characteristic;
  const useDevice = withDevice<
    typeof CONTROL_LOCK_ENABLED | typeof CONTROL_LOCK_DISABLED
  >(maybeDevice);

  maybeDevice.then((device) => {
    device.on('childLockChanged', (isLocked: boolean) => {
      service.updateCharacteristic(
        characteristic,
        isLocked ? CONTROL_LOCK_ENABLED : CONTROL_LOCK_DISABLED,
      );
    });
  });

  return service
    .getCharacteristic(characteristic)
    .on(
      CharacteristicEventTypes.GET,
      useDevice(async (device) =>
        device.property('child_lock').value
          ? CONTROL_LOCK_ENABLED
          : CONTROL_LOCK_DISABLED,
      ),
    )
    .on(
      CharacteristicEventTypes.SET,
      useDevice(async (device, newStatus) => {
        const currentStatus = +device.property('child_lock').value;
        if (newStatus !== currentStatus) {
          await device.changeChildLock(newStatus);
          return newStatus;
        }
        return undefined;
      }),
    );
}
