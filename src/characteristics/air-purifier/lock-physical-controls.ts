import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/LockPhysicalControls
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.LockPhysicalControls,
) {
  const { CONTROL_LOCK_ENABLED, CONTROL_LOCK_DISABLED } = characteristic;

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
    .onGet(async () => {
      const device = await maybeDevice;
      return device.property('child_lock').value
        ? CONTROL_LOCK_ENABLED
        : CONTROL_LOCK_DISABLED;
    })
    .onSet(async (newStatus) => {
      const device = await maybeDevice;
      const currentStatus = +device.property('child_lock').value;
      if (newStatus !== currentStatus) {
        await device.changeChildLock(newStatus);
      }
    });
}
