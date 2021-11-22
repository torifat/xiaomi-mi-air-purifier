import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/LockPhysicalControls
export function add(
  device: any,
  service: Service,
  characteristic: typeof Characteristic.LockPhysicalControls,
) {
  const { CONTROL_LOCK_ENABLED, CONTROL_LOCK_DISABLED } = characteristic;

  device.on('childLockChanged', (isLocked: boolean) => {
    service.updateCharacteristic(
      characteristic,
      isLocked ? CONTROL_LOCK_ENABLED : CONTROL_LOCK_DISABLED,
    );
  });

  return service
    .getCharacteristic(characteristic)
    .onGet(() =>
      device.property('child_lock').value
        ? CONTROL_LOCK_ENABLED
        : CONTROL_LOCK_DISABLED,
    )
    .onSet(async (newStatus) => {
      await device.changeChildLock(newStatus);
    });
}
