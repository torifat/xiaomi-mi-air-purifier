import {
  API,
  Logger,
  Service,
  AccessoryConfig,
  AccessoryPlugin,
} from 'homebridge';
import { isDefined } from './utils';
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
import { AIR_PURIFIERS } from './xiaomi-metadata';

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

export function isValidConfig(
  config: AccessoryConfig,
): config is XiaomiMiAirPurifierAccessoryConfig {
  return !!config.token && !!config.address;
}

export function xiaomiMiAirPurifierAccessoryFactory(device: any) {
  return class XiaomiMiAirPurifierAccessory implements AccessoryPlugin {
    readonly name?: string;
    readonly config?: XiaomiMiAirPurifierAccessoryConfig;

    readonly airPurifierService?: Service;
    readonly accessoryInformationService?: Service;
    readonly filterMaintenanceService?: Service;
    readonly airQualitySensorService?: Service;
    readonly temperatureSensorService?: Service;
    readonly humiditySensorService?: Service;

    connection?: Promise<any>;

    constructor(
      readonly log: Logger,
      config: AccessoryConfig,
      readonly api: API,
    ) {
      this.config = config as XiaomiMiAirPurifierAccessoryConfig;

      const {
        Service: {
          AirPurifier,
          HumiditySensor,
          AirQualitySensor,
          TemperatureSensor,
          AccessoryInformation,
        },
        Characteristic,
      } = api.hap;

      this.name = config.name;
      log.info(`Connected to "${this.name}" @ ${config.address}!`);

      // Air Purifier Service
      // Required characteristics
      this.airPurifierService = new AirPurifier(this.name);
      addActive(device, this.airPurifierService, Characteristic.Active);
      addCurrentAirPurifierState(
        device,
        this.airPurifierService,
        Characteristic.CurrentAirPurifierState,
      );
      addTargetAirPurifierState(
        device,
        this.airPurifierService,
        Characteristic.TargetAirPurifierState,
      );

      // Optional characteristics
      if (config.enableFanSpeedControl && device.matches('cap:fan-speed')) {
        addRotationSpeed(
          device,
          this.airPurifierService,
          Characteristic.RotationSpeed,
        );
      }

      if (config.enableChildLockControl) {
        addLockPhysicalControls(
          device,
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
          device,
          this.airQualitySensorService,
          Characteristic.AirQuality,
        );

        if (device.matches('cap:pm2.5')) {
          addPm2_5Density(
            device,
            this.airQualitySensorService,
            Characteristic.PM2_5Density,
          );
        }

        addFilterLifeLevel(
          device,
          this.airQualitySensorService,
          Characteristic.FilterLifeLevel,
        );
        addFilterChangeIndication(
          device,
          this.airQualitySensorService,
          Characteristic.FilterChangeIndication,
          {
            filterChangeThreshold:
              config.filterChangeThreshold | DEFAULT_FILTER_CHANGE_THRESHOLD,
          },
        );
      }

      // Temperature Sensor Service
      if (config.enableTemperature) {
        this.temperatureSensorService = new TemperatureSensor(
          `Temperature on ${this.name}`,
        );

        addCurrentTemperature(
          device,
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
          device,
          this.humiditySensorService,
          Characteristic.CurrentRelativeHumidity,
        );
      }

      // Device Info
      this.accessoryInformationService = new AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'Xiaomi Corporation')
        .setCharacteristic(
          Characteristic.Model,
          AIR_PURIFIERS[device.miioModel] || device.miioModel,
        );

      log.info(`${this.name} finished initializing!`);
    }

    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    identify() {
      this.log.info(`Identifying "${this.name}" @ ${this.config?.address}`);
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
  };
}
