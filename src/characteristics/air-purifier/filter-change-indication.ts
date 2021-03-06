import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';
import { withDevice } from '../../with-device';

export const DEFAULT_FILTER_CHANGE_THRESHOLD = 5;

interface FilterChangeIndicationOptions {
  filterChangeThreshold: number;
}

// https://developers.homebridge.io/#/characteristic/FilterChangeIndication
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.FilterChangeIndication,
  options: FilterChangeIndicationOptions,
) {
  const { FILTER_OK, CHANGE_FILTER } = characteristic;
  const useDevice = withDevice<number>(maybeDevice);

  maybeDevice.then((device) => {
    device.on('filterLifeChanged', (value: number) => {
      if (value <= options.filterChangeThreshold) {
        service.updateCharacteristic(characteristic, CHANGE_FILTER);
      }
    });
  });

  return service.getCharacteristic(characteristic).on(
    CharacteristicEventTypes.GET,
    useDevice(async (device) =>
      device.property('filter_life').value <= options.filterChangeThreshold
        ? CHANGE_FILTER
        : FILTER_OK,
    ),
  );
}
