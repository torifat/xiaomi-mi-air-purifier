import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  Logger,
  Service,
} from 'homebridge';
import miio from '@rifat/miio';
import { retry, isDefined } from './utils';
import { add as addActive } from './characteristics/air-purifier/active';
import { add as addCurrentAirPurifierState } from './characteristics/air-purifier/current-air-purifier-state';
import { add as addTargetAirPurifierState } from './characteristics/air-purifier/target-air-purifier-state';
import { add as addAirQuality } from './characteristics/air-quality';
import { add as addPm2_5Density } from './characteristics/pm2_5-density';
import { add as addCurrentTemperature } from './characteristics/current-temperature';
import { add as addCurrentRelativeHumidity } from './characteristics/current-relative-humidity';

// TODO: Add this under "Advanced Settings"
// Try to connect to the device after RETRY_DELAY ms delay in case of failure
const RETRY_DELAY = 5000;

export interface XiaomiMiAirPurifierAccessoryConfig extends AccessoryConfig {
  token: string;
  address: string;
  showAirQuality: boolean;
  showTemperature: boolean;
  showHumidity: boolean;
  showLED: boolean;
  showBuzzer: boolean;
}

function isValidConfig(
  config: AccessoryConfig,
): config is XiaomiMiAirPurifierAccessoryConfig {
  return !!config.token && !!config.address;
}

export class XiaomiMiAirPurifierAccessory implements AccessoryPlugin {
  private readonly name: string;
  protected readonly config: XiaomiMiAirPurifierAccessoryConfig;

  private readonly airPurifierService: Service;
  private readonly airQualitySensorService?: Service;
  private readonly temperatureSensorService?: Service;
  private readonly humiditySensorService?: Service;

  private connection?: Promise<any>;
  protected readonly device: Promise<any>;

  constructor(
    protected readonly log: Logger,
    config: AccessoryConfig,
    protected readonly api: API,
  ) {
    if (!isValidConfig(config)) {
      throw new Error(
        'Your must provide IP address and token of the Air Purifier.',
      );
    }
    this.config = config;

    const {
      Service: {
        AirPurifier,
        HumiditySensor,
        AirQualitySensor,
        TemperatureSensor,
      },
      Characteristic,
    } = api.hap;

    this.name = config.name;
    this.device = this.connect();

    // Required characteristics
    this.airPurifierService = new AirPurifier(this.name);
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

    // Optional characteristics
    if (config.showAirQuality) {
      this.airQualitySensorService = new AirQualitySensor(
        `Air Quality on ${this.name}`,
      );
      addAirQuality(
        this.device,
        this.airQualitySensorService,
        Characteristic.AirQuality,
      );
      addPm2_5Density(
        this.device,
        this.airQualitySensorService,
        Characteristic.PM2_5Density,
      );
    }

    if (config.showTemperature) {
      this.temperatureSensorService = new TemperatureSensor(
        `Temperature on ${this.name}`,
      );
      addCurrentTemperature(
        this.device,
        this.temperatureSensorService,
        Characteristic.CurrentTemperature,
      );
    }

    if (config.showHumidity) {
      this.humiditySensorService = new HumiditySensor(
        `Humidity on ${this.name}`,
      );
      addCurrentRelativeHumidity(
        this.device,
        this.humiditySensorService,
        Characteristic.CurrentRelativeHumidity,
      );
    }
  }

  connect() {
    if (!this.connection) {
      this.connection = new Promise((resolve) => {
        const { address, token } = this.config;
        retry(async () => await miio.device({ address, token }), RETRY_DELAY)
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
    this.log.info(`Identifying "${this.name}" @ ${this.config.address}`);
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.airPurifierService,
      this.airQualitySensorService,
      this.temperatureSensorService,
      this.humiditySensorService,
    ].filter(isDefined);
  }
}
