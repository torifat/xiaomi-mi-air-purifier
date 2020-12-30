import {
  CharacteristicGetCallback,
  CharacteristicValue,
  CharacteristicSetCallback,
} from 'homebridge';

type Getter<T> = (device: T) => Promise<CharacteristicValue>;
type Setter<T> = (
  device: T,
  value: CharacteristicValue,
) => Promise<CharacteristicValue>;
type GetterOrSetter<T> = Getter<T> | Setter<T>;

function isGetter<T>(fn: GetterOrSetter<T>): fn is Getter<T> {
  return fn.length === 1;
}

export const withDevice = <T>(maybeDevice: Promise<T>) => (
  fn: GetterOrSetter<T>,
) =>
  isGetter(fn)
    ? async (callback: CharacteristicGetCallback) => {
        try {
          const device = await maybeDevice;
          callback(null, await fn(device));
        } catch (err) {
          callback(err);
        }
      }
    : async (
        value: CharacteristicValue,
        callback: CharacteristicSetCallback,
      ) => {
        try {
          const device = await maybeDevice;
          callback(null, await fn(device, value));
        } catch (err) {
          callback(err);
        }
      };
