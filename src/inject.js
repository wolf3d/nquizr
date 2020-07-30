console.log("toast toast 123");
//var matches = document.querySelectorAll('span[role="text"]:not([class])');
var matches = document.querySelectorAll('div[class="kur-room__content"]');
var first = matches[0];
var element = document.createElement("aside");
element.setAttribute("class", "fact widget brief lp_fact");
element.textContent = "some text";
//class="fact widget brief lp_fact"
first.appendChild(element);
console.log(first);