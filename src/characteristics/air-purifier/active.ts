import { Service, Characteristic } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/Active
export function add(
  device: any,
  service: Service,
  characteristic: typeof Characteristic.Active,
) {
  const { ACTIVE, INACTIVE } = characteristic;

  device.on('powerChanged', (isOn: boolean) => {
    service.updateCharacteristic(characteristic, isOn ? ACTIVE : INACTIVE);
  });

  return (
    service
      .getCharacteristic(characteristic)
      // Default value
      .updateValue(INACTIVE)
      .onGet(async () => ((await device.power()) ? ACTIVE : INACTIVE))
      .onSet(async function (this: Characteristic, newStatus) {
        await device.changePower(newStatus);
      })
  );
}
