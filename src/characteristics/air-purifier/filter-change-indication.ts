import { Service, Characteristic, CharacteristicEventTypes } from 'homebridge';

export const DEFAULT_FILTER_CHANGE_THRESHOLD = 5;

interface FilterChangeIndicationOptions {
  filterChangeThreshold: number;
}

// https://developers.homebridge.io/#/characteristic/FilterChangeIndication
export function add(
  device: any,
  service: Service,
  characteristic: typeof Characteristic.FilterChangeIndication,
  options: FilterChangeIndicationOptions,
) {
  const { FILTER_OK, CHANGE_FILTER } = characteristic;

  device.on('filterLifeChanged', (value: number) => {
    if (value <= options.filterChangeThreshold) {
      service.updateCharacteristic(characteristic, CHANGE_FILTER);
    }
  });

  return (
    service
      .getCharacteristic(characteristic)
      // Default value
      .updateValue(FILTER_OK)
      .onGet(async () => {
        return device.property('filter_life').value <=
          options.filterChangeThreshold
          ? CHANGE_FILTER
          : FILTER_OK;
      })
  );
}
