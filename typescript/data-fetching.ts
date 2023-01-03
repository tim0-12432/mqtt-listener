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

const listBarItem = (text: string, stat: number): HTMLLIElement => {
    const li = document.createElement("li");
    const name = document.createElement("p");
    name.innerText = text + ":";
    const bar_container = document.createElement("p");
    bar_container.classList.add("bar");
    bar_container.title = Math.round(Math.abs(stat) * 100) / 100 + "%";
    const bar = document.createElement("span");
    bar.style.width = Math.abs(stat) + "%";
    li.appendChild(name);
    bar_container.appendChild(bar);
    li.appendChild(bar_container);
    return li;
}

type MQTTData = {
    time: string,
    topic: string,
    payload: string
}[]

type SupportedType = "bulb" | "plug" | "unknown";

type TasmotaData = {
    name: string,
    type: SupportedType,
    topic: string,
    stats: string
}[]

function getIconForType(type: SupportedType): string {
    switch (type) {
        case "bulb":
            return "&#9788; ";
        case "plug":
            return "&#9889; ";
        default:
            return "";
    }
}

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

                const time = document.createElement("p");
                time.classList.add("time");
                time.innerText = element.time;
                const topic = document.createElement("p");
                topic.classList.add("topic");
                topic.innerText = element.topic;
                const payload = document.createElement("p");
                payload.classList.add("load");
                payload.innerText = element.payload;

                paragraph.appendChild(time);
                paragraph.appendChild(topic);
                paragraph.appendChild(payload);
                cons.appendChild(paragraph);
            });
            console.log("Refreshed data...")
            removeMessage();
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
                        name.innerHTML = getIconForType(element.type) + element.name;

                        container.appendChild(name);

                        const stats = JSON.parse(element.stats);
                        container.appendChild(listItem("Uptime", stats.Uptime));
                        container.appendChild(listBoolItem("Power", stats.POWER.toUpperCase() === "ON"));
                        container.appendChild(listBarItem("Load", stats.LoadAvg));
                        container.appendChild(listBarItem("Heap", stats.Heap));
                        container.appendChild(listItem("SSID", stats.Wifi.SSId));
                        container.appendChild(listBarItem("Signal", stats.Wifi.Signal));
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