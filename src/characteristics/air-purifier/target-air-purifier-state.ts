import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../../with-device';

// https://developers.homebridge.io/#/characteristic/TargetAirPurifierState
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.TargetAirPurifierState,
) {
  const useDevice = withDevice(maybeDevice);
  const { AUTO, MANUAL } = characteristic;

  maybeDevice.then((device) => {
    device.on('modeChanged', (mode) => {
      service.updateCharacteristic(characteristic, mode ? MANUAL : AUTO);
    });
  });

  return service
    .getCharacteristic(characteristic)
    .on(
      CharacteristicEventTypes.GET,
      useDevice(async (device) =>
        // 0: Auto, 1: Sleep, 2: Favorite, 3: Manual
        (await device.mode()) ? MANUAL : AUTO,
      ),
    )
    .on(
      CharacteristicEventTypes.SET,
      useDevice(
        async (device, value) =>
          await device.mode(value === AUTO ? 'auto' : 'none'),
      ),
    );
}
