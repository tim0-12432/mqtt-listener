let cons = document.getElementById("console");
const message = document.getElementById("message");

function addMessage(msg, type) {
    message.dataset.visibility = "visible";
    message.dataset.stylized = type;
    message.innerText = msg;
}

function removeMessage() {
    message.dataset.visibility = "hidden";
    message.removeAttribute("stylized");
}

const listItem = (text, stat) => {
    const li = document.createElement("li");
    const name = document.createElement("p");
    name.innerText = text + ":";
    const status = document.createElement("p");
    status.innerText = stat;
    li.appendChild(name);
    li.appendChild(status);
    return li;
}

const listBoolItem = (text, stat) => {
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

const listBarItem = (text, stat) => {
    const li = document.createElement("li");
    const name = document.createElement("p");
    name.innerText = text + ":";
    const bar_container = document.createElement("p");
    bar_container.classList.add("bar");
    const bar = document.createElement("span");
    bar.style.width = Math.abs(stat) + "%";
    li.appendChild(name);
    bar_container.appendChild(bar);
    li.appendChild(bar_container);
    return li;
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
        .then(data => {
            cons.innerHTML = "";
            const titles = {
                "Time": "time",
                "Topic": "topic",
                "Payload": "load"
            }
            const headlines = document.createElement("p");
            const separator = document.createElement("p");
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
            .then(data => {
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
                        name.innerText = element.name;

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