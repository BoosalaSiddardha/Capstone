document.addEventListener("DOMContentLoaded", () => {

    const searchBtn = document.getElementById("searchBtn");
    const searchType = document.getElementById("searchType");
    const searchInput = document.getElementById("searchInput");
    const resultsBody = document.getElementById("resultsBody");

    const noDataMsg = document.getElementById("noDataMsg");
    const chartCanvas = document.getElementById("healthChart");  
    const progressBar = document.getElementById("progressBar");

    let healthChart = null;

    searchBtn.addEventListener("click", performSearch);

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            performSearch();
        }
    });

    function startProgress() {
        progressBar.style.width = "0%";
        progressBar.style.opacity = "1";

        setTimeout(() => progressBar.style.width = "30%", 100);
        setTimeout(() => progressBar.style.width = "60%", 300);
        setTimeout(() => progressBar.style.width = "85%", 600);
    }

    function completeProgress() {
        progressBar.style.width = "100%";
        setTimeout(() => {
            progressBar.style.opacity = "0";
            progressBar.style.width = "0%";
        }, 400);
    }

    function performSearch() {
        const type = searchType.value;
        const value = searchInput.value.trim().toLowerCase();

        if (value === "") {
            alert("Please enter a value to search");
            return;
        }

        startProgress();

        fetch(`/search?type=${type}&value=${encodeURIComponent(value)}`)
            .then(response => response.json())
            .then(data => {
                resultsBody.innerHTML = "";

                if (data.length === 0) {
                    resultsBody.innerHTML = `
                        <tr>
                            <td colspan="4">No results found</td>
                        </tr>
                    `;
                    clearChart();
                    completeProgress();
                    return;
                }

                data.forEach(row => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${row.pesticide}</td>
                        <td>${row.health_effect}</td>
                        <td>${row.reason}</td>
                    `;
                    resultsBody.appendChild(tr);
                });

                if (type === "crop") {
                    loadHealthStats(value);
                } else {
                    clearChart();
                }

                completeProgress();
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error fetching results");
                completeProgress();
            });
    }

    function loadHealthStats(crop) {
        fetch(`/crop_health_stats?crop=${encodeURIComponent(crop)}`)
            .then(res => res.json())
            .then(data => {

                if (Object.keys(data).length === 0) {
                    noDataMsg.style.display = "block";
                    clearChart();
                    return;
                }

                noDataMsg.style.display = "none";

                const sorted = Object.entries(data)
                    .sort((a, b) => b[1] - a[1]);

                const MAX_EFFECTS = 8;
                const mainEffects = sorted.slice(0, MAX_EFFECTS);
                const otherEffects = sorted.slice(MAX_EFFECTS);

                const labels = mainEffects.map(e => e[0]);
                const values = mainEffects.map(e => e[1]);

                if (healthChart) healthChart.destroy();

                healthChart = new Chart(chartCanvas.getContext("2d"), {
                    type: "bar",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Health Effect Frequency",
                            data: values
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: {
                                    color: "white"
                                }
                            },
                            tooltip: {
                                titleColor: "white",
                                bodyColor: "white"
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    color: "white"
                                },
                                title: {
                                    display: true,
                                    text: "Frequency",
                                    color: "white"
                                }
                            },
                            x: {
                                ticks: {
                                    color: "white"
                                },
                                title: {
                                    display: true,
                                    text: "Health Effects",
                                    color: "white"
                                }
                            }
                        }
                    }
                });

                if (otherEffects.length > 0) {
                    const text = otherEffects
                        .map(e => `${e[0]} (${e[1]})`)
                        .join(", ");

                    noDataMsg.innerText = "Other health effects: " + text;
                    noDataMsg.style.display = "block";
                } else {
                    noDataMsg.style.display = "none";
                }
            });
    }

    function clearChart() {
        noDataMsg.style.display = "none";
        if (healthChart) {
            healthChart.destroy();
            healthChart = null;
        }
    }

});
