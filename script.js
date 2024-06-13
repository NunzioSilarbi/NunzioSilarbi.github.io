function expandBox(box) {
    box.style.transition = "transform 0.3s, background-color 0.3s";
    box.style.transform = "scale(1.1)";
    box.style.backgroundColor = "white";
    box.querySelector('h2').style.transition = "color 0.3s";
    box.querySelector('h2').style.color = "black";
}

function resetBox(box) {
    box.style.transition = "transform 0.3s, background-color 0.3s";
    box.style.transform = "scale(1)";
    box.style.backgroundColor = "transparent";
    box.querySelector('h2').style.transition = "color 0.3s";
    box.querySelector('h2').style.color = "white";
}
