import paho.mqtt.client as mqtt
from random import choice, uniform
import time

client = mqtt.Client()
client.connect("192.168.0.2", 1883, 60)

while True:
    # num = uniform(0, 100)
    # tp = choice([0, 1 , 2])
    # client.publish(f"test{tp}", str(num))
    # print("Posted " + str(num) + " to test" + str(tp))

    test_object = f'{{"Time":"1970-01-26T16:15:45","Uptime":"25T16:15:13","UptimeSec":{int(uniform(2200000, 2250000))},"Heap":{int(uniform(0, 100))},"SleepMode":"Dynamic","Sleep":50,"LoadAvg":{int(uniform(0, 100))},"MqttCount":2,"POWER":"OFF","Dimmer":91,"Speed":1,"LedTable":"ON","Wifi":{{"AP":1,"Channel":6,"Mode":"11n","RSSI":{int(uniform(0, 100))},"Signal":{int(uniform(-100, 0))},"LinkCount":1,"Downtime":"0T00:00:05"}}}}'
    tp = choice(["000A00", "FFFFFF" , "12469A"])
    client.publish(f"tele/tasmota_{tp}/STATE", test_object)
    print("Posted update to tele/tasmota_" + str(tp))
    time.sleep(3)