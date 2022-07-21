import paho.mqtt.client as mqtt
from random import choice, uniform
import time

client = mqtt.Client()
client.connect("192.168.0.2", 1883, 60)

while True:
    num = uniform(0, 100)
    tp = choice([0, 1 , 2])
    client.publish(f"test{tp}", str(num))
    print("Posted " + str(num) + " to test" + str(tp))
    time.sleep(1.5)