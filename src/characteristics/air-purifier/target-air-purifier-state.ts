import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { MODE } from '../../miio-consts';

// https://developers.homebridge.io/#/characteristic/TargetAirPurifierState
export function add(
  device: any,
  service: Service,
  characteristic: typeof Characteristic.TargetAirPurifierState,
) {
  const { AUTO, MANUAL } = characteristic;

  device.on('modeChanged', (mode) => {
    service.updateCharacteristic(characteristic, mode ? MANUAL : AUTO);
  });

  return service
    .getCharacteristic(characteristic)
    .onGet(async () => ((await device.mode()) ? MANUAL : AUTO))
    .onSet(async (mode) => {
      const newMode = mode === AUTO ? MODE.AUTO : MODE.NONE;
      await device.changeMode(newMode);
    });
}
