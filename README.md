[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

Control and monitor your **Xiaomi Mi Air Purifier** purifier with HomeKit.

<p align="center">
  <img title="HomeKit integration for Xiaomi Mi Air Purifier" src="../assets/media/xiaomi-mi-air-purifier@2x.png" width="1280">
</p>

## Features

- Air Purifier Accessory
  - Turn on/off
  - Control Fan Speed
  - Toggle Child Lock
  - Change Mode (Auto/Manual)
  - Filter Live Level
  - Filter Change Warning
- Air Quality Sensor
  - Air Quality
  - PM2.5 Density
- Temperature Sensor
- Relative Humidity Sensor

## Prerequisites

- Installation of [Homebridge](https://homebridge.io/)

## Installation

Install using `npm`:

```bash
npm install -g homebridge-xiaomi-mi-air-purifier
```

Or, search for `homebridge-xiaomi-mi-air-purifier ` in Plugins.

## Configuration

Use [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x) to configure the plugin (highly recommended) otherwise head over to [Manual Config](#manual-config)

 <img title="Settings: Xiaomi Mi Air Purifier" src="../assets/media/settings-xiaomi-mi-air-purifier.png" width="726">

### Getting a Token

Use [Xiaomi Cloud Tokens Extractor](https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor) to get a token for your device.

### Manual Config

Add this to your homebridge config.json file.

```json
{
  "accessories": [
    {
      "name": "Air Purifier",
      "address": "<YOUR_DEVICE_IP_ADDRESS>",
      "token": "<YOUR_DEVICE_TOKEN>",
      "enableAirQuality": true,
      "enableTemperature": true,
      "enableHumidity": true,
      "filterChangeThreshold": 5,
      "enableFanSpeedControl": true,
      "enableChildLockControl": true,
      "accessory": "XiaomiMiAirPurifier"
    }
  ]
}
```

## HomeKit pairing

1. Open the Home <img src='https://user-images.githubusercontent.com/3979615/78010622-4ea1d380-738e-11ea-8a17-e6a465eeec35.png' height='16.42px'> app on your device.
2. Tap the Home tab, then tap <img src='https://user-images.githubusercontent.com/3979615/78010869-9aed1380-738e-11ea-9644-9f46b3633026.png' height='16.42px'>.
3. Tap _Add Accessory_, and select _I Don't Have a Code or Cannot Scan_.
