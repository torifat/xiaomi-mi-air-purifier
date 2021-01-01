import {
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  Nullable,
} from 'homebridge';

type Getter<T, U> = (device: U) => Promise<T | undefined>;
type Setter<T, U> = (device: U, value: T) => Promise<T | undefined>;
type GetterOrSetter<T, U> = Getter<T, U> | Setter<T, U>;

function isGetter<T, U>(fn: GetterOrSetter<T, U>): fn is Getter<T, U> {
  // NOTE: not a very reliable check but does the job for now
  return fn.length === 1;
}

export const withDevice = <T extends CharacteristicValue, U = any>(
  maybeDevice: Promise<U>,
) => (fn: GetterOrSetter<T, U>) =>
  isGetter(fn)
    ? (callback: CharacteristicGetCallback<Nullable<T>>) => {
        maybeDevice
          .then((device) => fn(device))
          .then((val) => callback(null, val))
          .catch(callback);
      }
    : (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        maybeDevice
          .then((device) => fn(device, value as any))
          .then((val) => callback(null, val))
          .catch(callback);
      };
