import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { MODE } from '../../miio-consts';

// http://miot-spec.org/miot-spec-v2/instance?type=urn:miot-spec-v2:device:air-purifier:0000A007:zhimi-ma4:1
// Range 0 - 3000
const RATIO = 30;
// NOTE: `.toFixed` returns `string`
const toPercentage = (speed: number) => Math.round((speed / RATIO) * 100) / 100;

// https://developers.homebridge.io/#/characteristic/Active
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.RotationSpeed,
) {
  maybeDevice.then((device) => {
    device.on('fanSpeedChanged', (speed) => {
      service.updateCharacteristic(characteristic, toPercentage(speed));
    });
  });

  return service
    .getCharacteristic(characteristic)
    .onGet(async () => {
      const device = await maybeDevice;
      return toPercentage(await device.fanSpeed());
    })
    .onSet(async (speed) => {
      const device = await maybeDevice;
      console.log(device);
      // If the device isn't in manual mode change it first
      if ((await device.mode()) !== MODE.NONE) {
        await device.changeMode(MODE.NONE);
      }
      await device.changeFanSpeed(+speed * RATIO);
    });
}
