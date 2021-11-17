import { Service, Characteristic } from 'homebridge';

function pm2_5ToAqi(aqi: number) {
  if (!aqi) {
    return 0; // Error or unknown response
  } else if (aqi <= 25) {
    return 1; // Return EXCELLENT
  } else if (aqi > 25 && aqi <= 50) {
    return 2; // Return GOOD
  } else if (aqi > 50 && aqi <= 75) {
    return 3; // Return FAIR
  } else if (aqi > 75 && aqi <= 100) {
    return 4; // Return INFERIOR
  } else if (aqi > 100) {
    return 5; // Return POOR (Homekit only goes to cat 5, so the last two AQI cats of Very Unhealty and Hazardous.
  } else {
    return 0; // Error or unknown response.
  }
}

// https://developers.homebridge.io/#/characteristic/AirQuality
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.AirQuality,
) {
  maybeDevice.then((device) => {
    device.on('pm2.5Changed', (value: number) => {
      service.updateCharacteristic(characteristic, pm2_5ToAqi(value));
    });
  });

  return service.getCharacteristic(characteristic).onGet(async () => {
    const device = await maybeDevice;
    return pm2_5ToAqi(await device.pm2_5());
  });
}
