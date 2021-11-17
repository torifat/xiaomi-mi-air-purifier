import { Service, Characteristic } from 'homebridge';

// https://developers.homebridge.io/#/characteristic/Active
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.Active,
) {
  const { ACTIVE, INACTIVE } = characteristic;

  maybeDevice.then((device) => {
    device.on('powerChanged', (isOn: boolean) => {
      service.updateCharacteristic(characteristic, isOn ? ACTIVE : INACTIVE);
    });
  });

  return service
    .getCharacteristic(characteristic)
    .onGet(async () => {
      const device = await maybeDevice;
      return (await device.power()) ? ACTIVE : INACTIVE;
    })
    .onSet(async function (this: Characteristic, newStatus) {
      const device = await maybeDevice;
      const currentStatus = await device.power();
      if (currentStatus !== newStatus) {
        await device.changePower(newStatus);
      }
    });
}
