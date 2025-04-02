export function appendDebugInfo(message) {
    const debugOutput = document.getElementById("debug-output");
    if (debugOutput) {
        debugOutput.textContent += `${message}\n`;
    } else {
        console.warn("Debug output element not found. Skipping debug info append.");
    }
}

export function renderDestinations(destinations) {
    const destinationList = document.getElementById("destination-list");
    destinationList.innerHTML = "";
    destinations.forEach((destination) => {
        const li = document.createElement("li");
        li.textContent = destination.name;
        li.addEventListener("click", () => {
            speak(destination.story);
        });
        destinationList.appendChild(li);
    });
}

export function addMarkers(destinations, map) {
    destinations.forEach(destination => {
        const [lng, lat] = destination.location.split(',').map(Number);
        const marker = new AMap.Marker({
            position: new AMap.LngLat(lng, lat),
            title: destination.name,
        });
        marker.setMap(map);
    });
}

export function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}
