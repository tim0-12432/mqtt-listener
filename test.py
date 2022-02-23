import paho.mqtt.client as mqtt
from random import uniform
import time

client = mqtt.Client()
client.connect("192.168.0.2", 1883, 60)

while True:
    num = uniform(0, 100)
    client.publish("test", str(num))
    print("Posted " + str(num))
    time.sleep(1)