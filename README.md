# One-day project

A flask server which listens to mqtt topics and displays them on a webpage.

## Use

1. `docker pull ghcr.io/tim0-12432/mqtt-listener:latest`
2. `docker run --name mqtt-listener -d -p 8082:8080 --env MQTT_LISTEN-MQTT-HOST=192.168.0.2 ghcr.io/tim0-12432/mqtt-listener:latest`


<img width="580" alt="screenshot" src="https://user-images.githubusercontent.com/79634593/155401389-d9ded3db-38ab-4604-8719-eed9d57fce31.png">

## Custom

### Build own image

`sudo docker build . --file Dockerfile --tag tim0-12432/mqtt-listener:<tag>`

### Run own container

`sudo docker run --name mqtt-listener -d -p 8082:8080 --env MQTT_LISTEN-MQTT-HOST=192.168.0.2 --env MQTT_LISTEN-LOG_LEVEL=DEBUG tim0-12432/mqtt-listener:<tag>`
