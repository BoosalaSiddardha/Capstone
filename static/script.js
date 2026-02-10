document.addEventListener("DOMContentLoaded", () => {

    const searchBtn = document.getElementById("searchBtn");
    const searchType = document.getElementById("searchType");
    const searchInput = document.getElementById("searchInput");
    const resultsBody = document.getElementById("resultsBody");

    const noDataMsg = document.getElementById("noDataMsg");
    const chartCanvas = document.getElementById("healthChart");
    let healthChart = null;

    searchBtn.addEventListener("click", performSearch);

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            performSearch();
        }
    });

    function performSearch() {
        const type = searchType.value;
        const value = searchInput.value.trim().toLowerCase();

        if (value === "") {
            alert("Please enter a value to search");
            return;
        }

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

                // ✅ ONLY load graph when searching by crop
                if (type === "crop") {
                    loadHealthStats(value);
                } else {
                    clearChart();
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error fetching results");
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

            // Sort by frequency (descending)
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
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: "Frequency" }
                        },
                        x: {
                            title: { display: true, text: "Health Effects" }
                        }
                    }
                }
            });

            // Show remaining effects as text
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
