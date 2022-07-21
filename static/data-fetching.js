const cons = document.getElementById("console");
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

function fetchData() {
    const currentData = cons.innerHTML;
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
            cons.innerHTML = currentData;
        });
}

setInterval(fetchData, 1000);