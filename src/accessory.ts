import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  Logger,
  Service,
  Characteristic,
} from 'homebridge';
import miio from '@rifat/miio';
import { retry } from './utils';
import { add as addActive } from './characteristics/active';
import { add as addCurrentAirPurifierState } from './characteristics/current-air-purifier-state';
import { add as addTargetAirPurifierState } from './characteristics/target-air-purifier-state';

// export interface XiaomiMiAirPurifierAccessoryConfig extends AccessoryConfig {
//   token: string;
//   ip: string;
//   showAirQuality: boolean;
//   showTemperature: boolean;
//   showHumidity: boolean;
//   showLED: boolean;
//   showBuzzer: boolean;
// }

interface Device {
  power(): boolean;
  power(isOn: boolean): void;
}

export class XiaomiMiAirPurifierAccessory implements AccessoryPlugin {
  private readonly name: string;
  private readonly airPurifierService: Service;

  private connection?: Promise<Device>;
  protected readonly device: Promise<Device>;

  constructor(
    protected readonly log: Logger,
    protected readonly config: AccessoryConfig,
    protected readonly api: API,
  ) {
    const { Service, Characteristic } = api.hap;

    this.name = config.name;
    this.device = this.connect();

    // Create a new Air Purifier service
    this.airPurifierService = new Service.AirPurifier(this.name);

    // Add required characteristics
    addActive(this.device, this.airPurifierService, Characteristic.Active);
    addCurrentAirPurifierState(
      this.device,
      this.airPurifierService,
      Characteristic.CurrentAirPurifierState,
    );
    addTargetAirPurifierState(
      this.device,
      this.airPurifierService,
      Characteristic.TargetAirPurifierState,
    );
  }

  connect() {
    if (!this.connection) {
      this.connection = new Promise((resolve) => {
        const { address, token } = this.config;
        retry(async () => await miio.device({ address, token }), 5000)
          .then(resolve)
          .catch((e) => {
            this.log.error('BOOOM!', e);
          });
      });
    }
    return this.connection;
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify() {
    this.log.info(`Identifying ${this.name} ${this.config.ip}`);
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [this.airPurifierService];
  }
}
