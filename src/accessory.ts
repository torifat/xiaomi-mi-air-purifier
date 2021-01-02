import {
  API,
  Logger,
  Service,
  AccessoryConfig,
  AccessoryPlugin,
} from 'homebridge';
import miio from '@rifat/miio';
import { retry, isDefined } from './utils';
import { add as addActive } from './characteristics/air-purifier/active';
import { add as addCurrentAirPurifierState } from './characteristics/air-purifier/current-air-purifier-state';
import { add as addTargetAirPurifierState } from './characteristics/air-purifier/target-air-purifier-state';
import { add as addFilterLifeLevel } from './characteristics/air-purifier/filter-life-level';
import {
  add as addFilterChangeIndication,
  DEFAULT_FILTER_CHANGE_THRESHOLD,
} from './characteristics/air-purifier/filter-change-indication';
import { add as addRotationSpeed } from './characteristics/air-purifier/rotation-speed';
import { add as addLockPhysicalControls } from './characteristics/air-purifier/lock-physical-controls';
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
  enableAirQuality: boolean;
  enableTemperature: boolean;
  enableHumidity: boolean;
  enableFanSpeedControl: boolean;
  enableChildLockControl: boolean;
  filterChangeThreshold: number;
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
  private readonly accessoryInformationService: Service;
  private readonly filterMaintenanceService?: Service;
  private readonly airQualitySensorService?: Service;
  private readonly temperatureSensorService?: Service;
  private readonly humiditySensorService?: Service;

  private connection?: Promise<any>;
  protected readonly maybeDevice: Promise<any>;

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
        FilterMaintenance,
        TemperatureSensor,
        AccessoryInformation,
      },
      Characteristic,
    } = api.hap;

    this.name = config.name;
    this.maybeDevice = this.connect().then((device) => {
      log.info(`Connected to "${this.name}" @ ${this.config.address}!`);
      return device;
    });

    // Air Purifier Service
    // Required characteristics
    this.airPurifierService = new AirPurifier(this.name);
    addActive(this.maybeDevice, this.airPurifierService, Characteristic.Active);
    addCurrentAirPurifierState(
      this.maybeDevice,
      this.airPurifierService,
      Characteristic.CurrentAirPurifierState,
    );
    addTargetAirPurifierState(
      this.maybeDevice,
      this.airPurifierService,
      Characteristic.TargetAirPurifierState,
    );
    addFilterLifeLevel(
      this.maybeDevice,
      this.airPurifierService,
      Characteristic.FilterLifeLevel,
    );
    addFilterChangeIndication(
      this.maybeDevice,
      this.airPurifierService,
      Characteristic.FilterChangeIndication,
      {
        filterChangeThreshold:
          config.filterChangeThreshold | DEFAULT_FILTER_CHANGE_THRESHOLD,
      },
    );

    // Optional characteristics
    if (config.enableFanSpeedControl) {
      addRotationSpeed(
        this.maybeDevice,
        this.airPurifierService,
        Characteristic.RotationSpeed,
      );
    }

    if (config.enableChildLockControl) {
      addLockPhysicalControls(
        this.maybeDevice,
        this.airPurifierService,
        Characteristic.LockPhysicalControls,
      );
    }

    // Air Quality Sensor Service
    if (config.enableAirQuality) {
      this.airQualitySensorService = new AirQualitySensor(
        `Air Quality on ${this.name}`,
      );
      addAirQuality(
        this.maybeDevice,
        this.airQualitySensorService,
        Characteristic.AirQuality,
      );
      addPm2_5Density(
        this.maybeDevice,
        this.airQualitySensorService,
        Characteristic.PM2_5Density,
      );
    }

    // Temperature Sensor Service
    if (config.enableTemperature) {
      this.temperatureSensorService = new TemperatureSensor(
        `Temperature on ${this.name}`,
      );

      addCurrentTemperature(
        this.maybeDevice,
        this.temperatureSensorService,
        Characteristic.CurrentTemperature,
      );
    }

    // Humidity Sensor Service
    if (config.enableHumidity) {
      this.humiditySensorService = new HumiditySensor(
        `Humidity on ${this.name}`,
      );
      addCurrentRelativeHumidity(
        this.maybeDevice,
        this.humiditySensorService,
        Characteristic.CurrentRelativeHumidity,
      );
    }

    // Device Info
    this.accessoryInformationService = new AccessoryInformation().setCharacteristic(
      Characteristic.Manufacturer,
      'Xiaomi Corporation',
    );

    log.info(`${this.name} finished initializing!`);
  }

  connect() {
    if (!this.connection) {
      this.connection = new Promise((resolve) => {
        const { address, token } = this.config;
        // Now keeps retrying forever.
        // Maybe can add a max retries number as an option
        retry(() => miio.device({ address, token }), RETRY_DELAY)
          .then(resolve)
          .catch((e) => {
            this.log.error('Error occurred during retry:', e);
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
      this.filterMaintenanceService,
      this.accessoryInformationService,
    ].filter(isDefined);
  }
}
