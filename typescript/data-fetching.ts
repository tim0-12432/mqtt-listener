let cons = document.getElementById("console") as HTMLDivElement;
const message = document.getElementById("message") as HTMLParagraphElement;

type MessageStyles = "warn" | "error" | "success" | "info";

function addMessage(msg: string, type: MessageStyles) {
    message.dataset.visibility = "visible";
    message.dataset.stylized = type;
    message.innerText = msg;
}

function removeMessage() {
    message.dataset.visibility = "hidden";
    message.removeAttribute("stylized");
}

const listItem = (text: string, stat: string | number): HTMLLIElement => {
    const li = document.createElement("li");
    const name = document.createElement("p");
    name.innerText = text + ":";
    const status = document.createElement("p");
    status.innerText = stat?.toString();
    li.appendChild(name);
    li.appendChild(status);
    return li;
}

const listBoolItem = (text: string, stat: boolean): HTMLLIElement => {
    const li = document.createElement("li");
    const name = document.createElement("p");
    name.innerText = text + ":";
    const container = document.createElement("div");
    const status = document.createElement("div");
    status.classList.add("checkradio");
    status.classList.add(stat ? "checked" : "unchecked");
    li.appendChild(name);
    container.appendChild(status);
    li.appendChild(container);
    return li;
}

type HSBColor = {
    h: number,
    s: number,
    b: number
}

const listColorItem = (text: string, stat: HSBColor): HTMLLIElement => {

    const hsbToHsl = (h: number, s: number, b: number): string => {
        const x = (200 - s) * b / 100;
        const newS = x === 0 || x === 200 ? 0 : Math.round(s * b / (x <= 100 ? x : 200 - x));
        const l = Math.round(x / 2);
        return `hsl(${h}, ${newS}%, ${l}%)`;
    };

    const li = document.createElement("li");
    const name = document.createElement("p");
    name.innerText = text + ":";
    const container = document.createElement("div");
    const status = document.createElement("div");
    status.classList.add("colorpoint");
    status.style.backgroundColor = hsbToHsl(stat.h, stat.s, stat.b);
    li.appendChild(name);
    container.appendChild(status);
    li.appendChild(container);
    return li;
}

const listBarItem = (text: string, stat: number, unit: string = "%"): HTMLLIElement => {
    const li = document.createElement("li");
    const name = document.createElement("p");
    name.innerText = text + ":";
    const bar_container = document.createElement("p");
    bar_container.classList.add("bar");
    if (unit === "%") {
        bar_container.title = Math.round(Math.abs(stat) * 100) / 100 + "%";
    } else {
        bar_container.title = stat + unit;
    }
    const bar = document.createElement("span");
    bar.style.width = Math.abs(stat) + "%";
    li.appendChild(name);
    bar_container.appendChild(bar);
    li.appendChild(bar_container);
    return li;
}

function truncate(input: string, length: number, front: boolean = true) {
    if (input.length > length) {
        if (front) {
            return input.substring(0, length) + '...';
        } else {
            return '...' + input.substring(input.length - length, input.length);
        }
    }
    return input;
};

async function copyToClipboard(text: string, entity: string = "text") {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        addMessage(`Copied ${entity} to clipboard!`, "success");
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "absolute";
        textArea.style.left = "-300%";
        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            addMessage(`Copied ${entity} to clipboard!`, "success");
        } catch (error) {
            console.error(error);
            addMessage(`Error copying '${truncate(text, 20)}'!`, "error");
        } finally {
            textArea.remove();
        }
    }
}

type MQTTData = {
    time: string,
    topic: string,
    payload: string
}[]

type TasmotaData = {
    name: string,
    topic: string,
    stats: string
}[]

function fetchData() {
    const currentData = cons;
    fetch("/data")
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                console.error(response.status + ": " + response.statusText);
                addMessage("Error: " + response.status + ": " + response.statusText, "error");
            }
        })
        .then((data: MQTTData) => {
            removeMessage();
            cons.innerHTML = "";
            const titles: {[key: string]: string} = {
                "Time": "time",
                "Topic": "topic",
                "Payload": "load"
            }
            const headlines: HTMLParagraphElement = document.createElement("p");
            const separator: HTMLParagraphElement = document.createElement("p");
            Object.keys(titles).forEach(title => {
                const headline = document.createElement("p");
                headline.innerText = title;
                headline.classList.add(titles[title]);
                headlines.appendChild(headline);
                const sep = document.createElement("p");
                sep.innerText = "-".repeat(title.length + 2);
                sep.classList.add(titles[title]);
                sep.classList.add("sep");
                separator.appendChild(sep);
            });
            cons.appendChild(headlines);
            cons.appendChild(separator);
            console.log("Headlines added...")
            data.forEach((element, _) => {
                const paragraph = document.createElement("p");
                const copyString = ["copy '", "' to clipboard!"];

                const time = document.createElement("p");
                time.classList.add("time");
                time.innerText = element.time;
                time.title = copyString[0] + truncate(element.time, 10, true) + copyString[1];
                time.onclick = () => {
                    copyToClipboard(element.time, "time");
                };

                const topic = document.createElement("p");
                topic.classList.add("topic");
                topic.innerText = element.topic;
                topic.title = copyString[0] + truncate(element.topic, 20, false) + copyString[1];
                topic.onclick = () => {
                    copyToClipboard(element.topic, "MQTT topic");
                };

                const payload = document.createElement("p");
                payload.classList.add("load");
                payload.innerText = element.payload;
                payload.title = copyString[0] + truncate(element.payload, 25, true) + copyString[1];
                payload.onclick = () => {
                    copyToClipboard(element.payload, "MQTT payload");
                };

                paragraph.appendChild(time);
                paragraph.appendChild(topic);
                paragraph.appendChild(payload);
                cons.appendChild(paragraph);
            });
            console.log("Refreshed data...")
        })
        .catch(error => {
            addMessage("Error fetching MQTT data!", "error");
            console.error(error);
            cons = currentData;
        });

    const tasmTab = document.getElementById("tasmota-tab");
    if (tasmTab != undefined) {
        const currentDevices = tasmTab.innerHTML;
        fetch("/tasmota/devices")
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    console.error(response.status + ": " + response.statusText);
                }
            })
            .then((data: TasmotaData) => {
                tasmTab.innerHTML = "";
                if (data.length === 0) {
                    const paragraph = document.createElement("p");
                    paragraph.innerText = "No devices found!";
                    tasmTab.appendChild(paragraph);
                } else {
                    data.forEach((element, _) => {
                        const container = document.createElement("div");

                        const name = document.createElement("h3");
                        name.classList.add("name");
                        name.innerHTML = element.name;

                        container.appendChild(name);

                        const stats = JSON.parse(element.stats);
                        container.appendChild(listItem("Uptime", stats.Uptime));
                        container.appendChild(listBoolItem("Power", stats.POWER.toUpperCase() === "ON"));
                        container.appendChild(listBarItem("Load", stats.LoadAvg));
                        container.appendChild(listBarItem("Heap", stats.Heap));
                        container.appendChild(listItem("SSID", stats.Wifi.SSId));
                        container.appendChild(listBarItem("Signal", stats.Wifi.Signal, "dBm"));
                        if (stats.Dimmer !== undefined) {
                            container.appendChild(listBarItem("Dimmer", stats.Dimmer));
                        }
                        if (stats.HSBColor !== undefined) {
                            const [hue, saturation, brightness] = stats.HSBColor.split(",");
                            container.appendChild(listColorItem("Color", {h: hue, s: saturation, b: brightness}));
                        }
                        if (stats.Vcc !== undefined) {
                            container.appendChild(listBarItem("Vcc", stats.Vcc, "V"));
                        }
                        if (stats.Fade !== undefined) {
                            container.appendChild(listBoolItem("Fading", stats.Fade.toUpperCase() === "ON"));
                        }
                        tasmTab.appendChild(container);
                    });
                }
                console.log("Refreshed data...")
            })
            .catch(error => {
                console.error(error);
                if (currentDevices == "") {
                    tasmTab.innerHTML = "";
                    const paragraph = document.createElement("p");
                    paragraph.innerText = "No devices found!";
                    tasmTab.appendChild(paragraph);
                } else {
                    tasmTab.innerHTML = currentDevices;
                }
            });
    }
}

setInterval(fetchData, 1000);