const hour = new Date().getHours();
let greeting = "Good Morning";
if (hour >= 12 && hour < 18) greeting = "Good Afternoon";
if (hour >= 18) greeting = "Good Evening";
document.getElementById("greeting").textContent = `${greeting}, Cristian.`;
