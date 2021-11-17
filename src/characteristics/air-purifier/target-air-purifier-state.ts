import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { MODE } from '../../miio-consts';

// https://developers.homebridge.io/#/characteristic/TargetAirPurifierState
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.TargetAirPurifierState,
) {
  const { AUTO, MANUAL } = characteristic;

  maybeDevice.then((device) => {
    device.on('modeChanged', (mode) => {
      service.updateCharacteristic(characteristic, mode ? MANUAL : AUTO);
    });
  });

  return service
    .getCharacteristic(characteristic)
    .onGet(async () => {
      const device = await maybeDevice;
      return (await device.mode()) ? MANUAL : AUTO;
    })
    .onSet(async (mode) => {
      const device = await maybeDevice;
      const newMode = mode === AUTO ? MODE.AUTO : MODE.NONE;
      const currentMode = await device.mode();
      if (newMode !== currentMode) {
        await device.changeMode(newMode);
      }
    });
}
