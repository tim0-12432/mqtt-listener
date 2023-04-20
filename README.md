<div align="center">
    <img width="35%" alt="mqtt-listener" src="./static/android-chrome-512x512.png"/>
</div>

<div align="center">
    <h1>MQTT Monitoring Tool</h1>
    <span>A flask server which listens to mqtt topics and displays them on a webpage.</span>
</div>

---

## Use

1. `docker pull ghcr.io/tim0-12432/mqtt-listener:latest`
2. `docker run --name mqtt-listener -d -p 8082:8080 --env MQTT_LISTEN-MQTT-HOST=192.168.0.2 ghcr.io/tim0-12432/mqtt-listener:latest`

If you want to enable Tasmota discovery, you need to add the following environment variables:
`MQTT_LISTEN-TASMOTA_ENABLED=True`

## Custom

### Build own image

`sudo docker build . --file Dockerfile --tag tim0-12432/mqtt-listener:<tag>`

### Run own container

`sudo docker run --name mqtt-listener -d -p 8082:8080 --env MQTT_LISTEN-MQTT-HOST=192.168.0.2 tim0-12432/mqtt-listener:<tag>`

For debugging purposes you can set following environment variables:
`MQTT_LISTEN-LOG_LEVEL=DEBUG` and `MQTT_LISTEN-APP-DEBUG=True`

## Images

<p align="center">
    <img width="60%" alt="ipad with dark mode" src="./doc/localhost_8080_(iPad).png"/>
&nbsp;&nbsp;
    <img width="35%" alt="iphone with light mode" src="./doc/localhost_8080_(iPhone%206_7_8%20Plus).png"/>
</p>
