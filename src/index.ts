import type { AccessoryConfig, API, HomebridgeConfig } from 'homebridge';

import fs from 'fs';
import miio from '@rifat/miio';

import { ACCESSORY_NAME } from './settings';
import {
  isValidConfig,
  xiaomiMiAirPurifierAccessoryFactory,
} from './accessory';

/*
capabilities=
fan-speed,
miio:led-brightness,
pm2.5,
relative-humidity,
temperature,
switchable-mode,
mode,
switchable-power,
restorable-state,
power,
state
*/

/**
 * This method registers the platform with Homebridge
 */
export default async function XiaomiMiAirPurifier(api: API) {
  /**
   * Need access to config early so that I can initialize the device earlier
   * and make decision based on the connected device.
   */
  const configPath = api.user.configPath();
  if (fs.existsSync(configPath)) {
    /**
     * Homebridge already does take care of validation & loading.
     * At this point we can safely assume the config is a valid JSON.
     */
    const config: Partial<HomebridgeConfig> = JSON.parse(
      fs.readFileSync(configPath, { encoding: 'utf8' }),
    );

    const accessoryConfig = (config.accessories || []).find(
      ({ accessory }) => accessory === ACCESSORY_NAME,
    );

    if (accessoryConfig && isValidConfig(accessoryConfig)) {
      const { address, token } = accessoryConfig;
      try {
        const device = await miio.device({ address, token });
        if (device.matches('type:air-purifier')) {
          api.registerAccessory(
            ACCESSORY_NAME,
            xiaomiMiAirPurifierAccessoryFactory(device),
          );
        } else {
          console.log('Connected device is not an Air Purifier!');
        }
      } catch (error) {
        // NOTE: use `retry` if failure becomes an issue
        throw error;
      }
    } else {
      throw new Error(
        'Your must provide IP address and token of the Air Purifier.',
      );
    }
  }
}
