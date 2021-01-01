import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../../with-device';
import { MODE } from '../../miio-consts';

// https://developers.homebridge.io/#/characteristic/TargetAirPurifierState
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.TargetAirPurifierState,
) {
  const { AUTO, MANUAL } = characteristic;
  const useDevice = withDevice<typeof AUTO | typeof MANUAL>(maybeDevice);

  maybeDevice.then((device) => {
    device.on('modeChanged', (mode) => {
      service.updateCharacteristic(characteristic, mode ? MANUAL : AUTO);
    });
  });

  return service
    .getCharacteristic(characteristic)
    .on(
      CharacteristicEventTypes.GET,
      useDevice(async (device) => ((await device.mode()) ? MANUAL : AUTO)),
    )
    .on(
      CharacteristicEventTypes.SET,
      useDevice(async (device, mode) => {
        const newMode = mode === AUTO ? MODE.AUTO : MODE.NONE;
        const currentMode = await device.mode();
        if (newMode !== currentMode) {
          const [{ code }] = await device.changeMode(newMode);
          return code === 0 ? mode : undefined;
        }
        return undefined;
      }),
    );
}
