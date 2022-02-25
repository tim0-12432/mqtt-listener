from flask import Flask, jsonify, render_template
from config import config_from_env, config_from_dict, ConfigurationSet
from flask.logging import default_handler
from gevent.pywsgi import WSGIServer
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
import pandas as pd
import logging


DEFAULT_CONFIG = {
    # information about the server
    "app.host": "0.0.0.0",
    "app.port": 8080,
    "app.debug": False,

    # address of mqtt broker
    "mqtt.host": "localhost",
    "mqtt.port": 1883,

    # log level for debugging
    "log_level": "WARNING",

    # store system topic messages
    "sys_on": False,

    # maximum number of records to be stored in memory
    "max_entries": 100,

    # maximum number of entries to display in the web interface
    "max_cons_rows": 50
}

PREFIX = "MQTT_LISTEN"


if __name__ == "__main__":
    load_dotenv()

    cfg = ConfigurationSet(
        config_from_env(prefix=PREFIX, separator="-", lowercase_keys=True),
        config_from_dict(DEFAULT_CONFIG)
    )

    logging.basicConfig(level=cfg.log_level, format='%(name)s: %(levelname)s - %(message)s')
    logging.debug("Configuration: %s", cfg)

    results = pd.DataFrame(columns=["time", "topic", "payload"])

    def on_connect(client, userdata, flags, rc):
        logging.info(f"Connected to {cfg.mqtt.host}:{cfg.mqtt.port} with result code {rc}")
        if cfg.sys_on:
            client.subscribe([("$SYS/#",0), ("#",0)])
        else:
            client.subscribe([("#",0)])


    def on_message(client, userdata, msg):
        global results
        if (cfg.sys_on == "False") and msg.topic.startswith("$SYS"):
            return
        if results.shape[0] >= cfg.max_entries:
            results = results.iloc[1:, :]
        new_record = pd.DataFrame.from_records([{"time": msg.timestamp, "topic": msg.topic, "payload": msg.payload}])
        results = pd.concat([results, new_record], ignore_index=True)


    client = mqtt.Client("MQTT_Listener", clean_session=True)
    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(cfg["mqtt"]["host"], cfg["mqtt"]["port"], 60)

    client.loop_start()

    wz_log = logging.getLogger("werkzeug")
    wz_log.setLevel(cfg.log_level)
    app = Flask("mqtt-listener")
    app.logger.addHandler(default_handler)
    app.logger.setLevel(cfg.log_level)

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/data", methods=["GET"])
    def get_results():
        result_df = results.tail(cfg.max_cons_rows)
        result_list = []
        for idx, row in result_df.iterrows():
            date = round(row["time"])
            result_list.append({"time": date, "topic": row["topic"], "payload": str(row["payload"]).replace("b\'", "").replace("\'", "")})
        return jsonify(result_list)

    if cfg["app"]["debug"] == True:
        app.run(host=cfg["app"]["host"], port=cfg["app"]["port"], debug=cfg["app"]["debug"], use_reloader=False)
    else:
        http_server = WSGIServer((cfg["app"]["host"], cfg["app"]["port"]), app)
        http_server.serve_forever()
