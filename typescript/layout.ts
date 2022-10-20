const vars = document.querySelector(":root");
const btnPlus = document.getElementById('btn-plus');
const btnMinus = document.getElementById('btn-minus');

function addTasmotaBtn() {
    const btn = document.createElement("button");
    btn.classList.add("tasmota");
    const img = document.createElement("img");
    img.src = "/static/tasmota-logo.svg";
    img.alt = "Tasmota";
    btn.appendChild(img);
    btn.addEventListener("click", () => {
        toggleTasmotaTab();
    }
    );
    btnMinus.parentElement.appendChild(btn);
}

function toggleTasmotaTab() {
    if (document.body.classList.contains("tasmota-open")) {
        const tasmotaTab = document.getElementById("tasmota-tab");
        tasmotaTab.classList.add("hidden");
        setTimeout(() => {
            tasmotaTab.remove();
        }, 300);
        console.log("Tasmota tab closed...");
        document.body.classList.remove("tasmota-open");
    } else {
        const tasmotaTab = document.createElement("div");
        tasmotaTab.id = "tasmota-tab";
        tasmotaTab.classList.add("hidden");
        document.body.appendChild(tasmotaTab);
        setTimeout(() => {
            tasmotaTab.classList.remove("hidden");
        }, 500);
        console.log("Tasmota tab added...");
        document.body.classList.add("tasmota-open");
    }
}

btnPlus.addEventListener('click', () => {
    const size = parseInt(getComputedStyle(vars).getPropertyValue('--font-size').replace("px", ""));
    const newSize = size + (size < 5 ? 1 : 5) + 'px';
    vars.style.setProperty('--font-size', newSize);
    console.log("Changed font from " + size + " to " + newSize + ".");
});

btnMinus.addEventListener('click', () => {
    const size = parseInt(getComputedStyle(vars).getPropertyValue('--font-size').replace("px", ""));
    const newSize = size - (size <= 5 ? 1 : 5) + 'px';
    vars.style.setProperty('--font-size', newSize);
    console.log("Changed font from " + size + " to " + newSize + ".");
});

fetch("/tasmota").then(response => {
    if (response.ok) {
        return response.json()
    } else {
        console.error(response.status + ": " + response.statusText);
    }
}).then(data => {
    if (data.enabled == true){
        addTasmotaBtn();
    }
}).catch(error => {
    addMessage("Error retrieving tasmota information!", "warn");
    console.error(error);
    cons.innerHTML = currentData;
});