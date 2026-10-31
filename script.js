// ================================================================
// QUANTUM PARTICLE IN A 3D BOX VISUALIZER
// ================================================================


// ================================================================
// CONSTANTS
// ================================================================

const HBAR = 1.054571817e-34;

const PI = Math.PI;

const EV = 1.602176634e-19;


// ================================================================
// GLOBAL VARIABLES
// ================================================================

let currentGrid = null;


// ================================================================
// ELEMENT HELPER
// ================================================================

function $(id) {

    return document.getElementById(id);

}


// ================================================================
// CHECK PLOTLY
// ================================================================

function plotlyReady() {

    return (
        typeof window.Plotly !== "undefined" &&
        typeof window.Plotly.newPlot === "function"
    );

}


// ================================================================
// PLOTLY FALLBACK LOADER
// ================================================================

function loadPlotlyFallback() {


    if (plotlyReady()) {

        return Promise.resolve(true);

    }


    return new Promise(function(resolve) {


        const script =
            document.createElement("script");


        script.src =
            "https://unpkg.com/plotly.js-dist-min@2.35.2/plotly.min.js";


        script.onload = function() {

            resolve(
                plotlyReady()
            );

        };


        script.onerror = function() {

            resolve(false);

        };


        document.head.appendChild(
            script
        );

    });

}


// ================================================================
// SHOW PLOT ERROR
// ================================================================

function showPlotError(
    elementId,
    message
) {


    const element =
        $(elementId);


    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.style.display =
        "block";

}


// ================================================================
// HIDE PLOT ERROR
// ================================================================

function hidePlotError(
    elementId
) {


    const element =
        $(elementId);


    if (!element) {

        return;

    }


    element.textContent =
        "";


    element.style.display =
        "none";

}


// ================================================================
// CUSTOM MASS
// ================================================================

function toggleCustomMass() {


    const select =
        $("mass");


    const container =
        $("custom-mass-container");


    if (
        select.value === "custom"
    ) {

        container.style.display =
            "block";

    }

    else {

        container.style.display =
            "none";

    }

}


// ================================================================
// GET INPUTS
// ================================================================

function getInputsNormalized() {


    let nx =
        parseInt(
            $("nx").value
        );


    let ny =
        parseInt(
            $("ny").value
        );


    let nz =
        parseInt(
            $("nz").value
        );


    let Lx =
        parseFloat(
            $("Lx").value
        );


    let Ly =
        parseFloat(
            $("Ly").value
        );


    let Lz =
        parseFloat(
            $("Lz").value
        );


    if (
        !Number.isFinite(nx) ||
        nx < 1
    ) {

        nx = 1;

    }


    if (
        !Number.isFinite(ny) ||
        ny < 1
    ) {

        ny = 1;

    }


    if (
        !Number.isFinite(nz) ||
        nz < 1
    ) {

        nz = 1;

    }


    if (
        !Number.isFinite(Lx) ||
        Lx <= 0
    ) {

        Lx = 1;

    }


    if (
        !Number.isFinite(Ly) ||
        Ly <= 0
    ) {

        Ly = 1;

    }


    if (
        !Number.isFinite(Lz) ||
        Lz <= 0
    ) {

        Lz = 1;

    }


    const massOption =
        $("mass").value;


    let m;


    if (
        massOption === "electron"
    ) {

        m = 9.1093837e-31;

    }

    else if (
        massOption === "proton"
    ) {

        m = 1.6726219e-27;

    }

    else {

        m =
            parseFloat(
                $("customMass").value
            );


        if (
            !Number.isFinite(m) ||
            m <= 0
        ) {

            m =
                9.1093837e-31;

        }

    }


    return {

        nx,
        ny,
        nz,

        Lx:
            Lx * 1e-9,

        Ly:
            Ly * 1e-9,

        Lz:
            Lz * 1e-9,

        m

    };

}


// ================================================================
// ENERGY
// ================================================================

function energyLevel(
    nx,
    ny,
    nz,
    Lx,
    Ly,
    Lz,
    m
) {


    return (

        (PI * PI * HBAR * HBAR) /
        (2 * m)

    ) * (

        (nx * nx) /
        (Lx * Lx)

        +

        (ny * ny) /
        (Ly * Ly)

        +

        (nz * nz) /
        (Lz * Lz)

    );

}


// ================================================================
// WAVEFUNCTION
// ================================================================

function psi_at(
    nx,
    ny,
    nz,
    Lx,
    Ly,
    Lz,
    x,
    y,
    z
) {


    const prefactor =
        Math.sqrt(
            8 /
            (Lx * Ly * Lz)
        );


    return (

        prefactor

        *

        Math.sin(
            nx * PI * x / Lx
        )

        *

        Math.sin(
            ny * PI * y / Ly
        )

        *

        Math.sin(
            nz * PI * z / Lz
        )

    );

}


// ================================================================
// MAIN CALCULATE
// ================================================================

function calculate() {


    const data =
        getInputsNormalized();


    const E =
        energyLevel(

            data.nx,
            data.ny,
            data.nz,

            data.Lx,
            data.Ly,
            data.Lz,

            data.m

        );


    const psi =
        psi_at(

            data.nx,
            data.ny,
            data.nz,

            data.Lx,
            data.Ly,
            data.Lz,

            data.Lx / 2,
            data.Ly / 2,
            data.Lz / 2

        );


    const probability =
        psi * psi;


    // Display scientific notation as a × 10^n instead of e-notation.
    function formatScientific(value, digits = 4) {

        if (value === 0) {
            return "0";
        }

        const exponent = Math.floor(Math.log10(Math.abs(value)));
        const coefficient = value / Math.pow(10, exponent);
        const roundedCoefficient = coefficient.toFixed(digits);

        return `${roundedCoefficient} × 10<sup>${exponent}</sup>`;

    }


    $("wavefunction").innerHTML =
        `${formatScientific(psi)} <span class="result-unit">m<sup>−3/2</sup></span>`;


    $("probability").innerHTML =
        `${formatScientific(probability)} <span class="result-unit">m<sup>−3</sup></span>`;


    $("energy").innerHTML =
        `${formatScientific(E)} <span class="result-unit">J</span>`
        +
        ` <span class="energy-separator">|</span> `
        +
        `${(E / EV).toFixed(4)} <span class="result-unit">eV</span>`;


    if (
        window.MathJax &&
        typeof MathJax.typesetPromise === "function"
    ) {

        MathJax.typesetPromise();

    }
}


// ================================================================
// COMPUTE GRID
// ================================================================

function computeGridAndDensity(
    N
) {


    const data =
        getInputsNormalized();


    const xs =
        new Float64Array(N);


    const ys =
        new Float64Array(N);


    const zs =
        new Float64Array(N);


    for (
        let i = 0;
        i < N;
        i++
    ) {

        xs[i] =
            ((i + 0.5) / N) *
            data.Lx;


        ys[i] =
            ((i + 0.5) / N) *
            data.Ly;


        zs[i] =
            ((i + 0.5) / N) *
            data.Lz;

    }


    const density =
        new Float64Array(
            N * N * N
        );


    let index = 0;


    for (
        let k = 0;
        k < N;
        k++
    ) {


        for (
            let j = 0;
            j < N;
            j++
        ) {


            for (
                let i = 0;
                i < N;
                i++
            ) {


                const psi =
                    psi_at(

                        data.nx,
                        data.ny,
                        data.nz,

                        data.Lx,
                        data.Ly,
                        data.Lz,

                        xs[i],
                        ys[j],
                        zs[k]

                    );


                density[index] =
                    psi * psi;


                index++;

            }

        }

    }


    return {

        N,

        xs,
        ys,
        zs,

        density

    };

}


// ================================================================
// FIND MAXIMUM
// ================================================================

function getMaximum(
    array
) {


    let maximum =
        0;


    for (
        let i = 0;
        i < array.length;
        i++
    ) {


        if (
            array[i] > maximum
        ) {

            maximum =
                array[i];

        }

    }


    return maximum;

}


// ================================================================
// 2D SLICE
// ================================================================

function plotSlice(
    grid,
    axis,
    sliceIndex,
    plotId
) {


    if (
        !plotlyReady()
    ) {

        return;

    }


    const N =
        grid.N;


    sliceIndex =
        Math.max(
            0,
            Math.min(
                N - 1,
                sliceIndex
            )
        );


    let zData;

    let x;

    let y;

    let xTitle;

    let yTitle;


    // Z slice

    if (
        axis === "z"
    ) {


        x =
            Array.from(
                grid.xs
            ).map(
                v => v * 1e9
            );


        y =
            Array.from(
                grid.ys
            ).map(
                v => v * 1e9
            );


        xTitle =
            "x (nm)";


        yTitle =
            "y (nm)";


        zData =
            [];


        for (
            let j = 0;
            j < N;
            j++
        ) {


            const row =
                [];


            for (
                let i = 0;
                i < N;
                i++
            ) {


                row.push(

                    grid.density[
                        i +
                        j * N +
                        sliceIndex *
                        N *
                        N
                    ]

                );

            }


            zData.push(
                row
            );

        }

    }


    // Y slice

    else if (
        axis === "y"
    ) {


        x =
            Array.from(
                grid.xs
            ).map(
                v => v * 1e9
            );


        y =
            Array.from(
                grid.zs
            ).map(
                v => v * 1e9
            );


        xTitle =
            "x (nm)";


        yTitle =
            "z (nm)";


        zData =
            [];


        for (
            let k = 0;
            k < N;
            k++
        ) {


            const row =
                [];


            for (
                let i = 0;
                i < N;
                i++
            ) {


                row.push(

                    grid.density[
                        i +
                        sliceIndex * N +
                        k * N * N
                    ]

                );

            }


            zData.push(
                row
            );

        }

    }


    // X slice

    else {


        x =
            Array.from(
                grid.ys
            ).map(
                v => v * 1e9
            );


        y =
            Array.from(
                grid.zs
            ).map(
                v => v * 1e9
            );


        xTitle =
            "y (nm)";


        yTitle =
            "z (nm)";


        zData =
            [];


        for (
            let k = 0;
            k < N;
            k++
        ) {


            const row =
                [];


            for (
                let j = 0;
                j < N;
                j++
            ) {


                row.push(

                    grid.density[
                        sliceIndex +
                        j * N +
                        k * N * N
                    ]

                );

            }


            zData.push(
                row
            );

        }

    }


    const plotElement =
        $(plotId);


    if (!plotElement) {

        return;

    }


    plotElement.style.height =
        "420px";


    plotElement.style.marginTop =
        "0";


    const trace = {

        type:
            "heatmap",

        x,

        y,

        z:
            zData,

        colorscale:
            "Viridis",

        colorbar: {

            title:
                "|ψ|²"

        }

    };


    const layout = {

        title:
            `Probability Density Slice — ${axis.toUpperCase()} Axis`,

        xaxis: {

            title:
                xTitle

        },

        yaxis: {

            title:
                yTitle

        },

        paper_bgcolor:
            "rgba(0,0,0,0)",

        plot_bgcolor:
            "rgba(0,0,0,0)",

        font: {
            color: "#334155"
        },

        margin: {

            l: 70,

            r: 30,

            t: 60,

            b: 60

        }

    };


    Plotly.newPlot(

        plotId,

        [trace],

        layout,

        {

            responsive:
                true,

            displaylogo:
                false

        }

    );

}


// ================================================================
// 3D COORDINATES
// ================================================================

function make3DCoordinates(
    grid
) {


    const N =
        grid.N;


    const x =
        new Array(
            N * N * N
        );


    const y =
        new Array(
            N * N * N
        );


    const z =
        new Array(
            N * N * N
        );


    let index = 0;


    for (
        let k = 0;
        k < N;
        k++
    ) {


        for (
            let j = 0;
            j < N;
            j++
        ) {


            for (
                let i = 0;
                i < N;
                i++
            ) {


                x[index] =
                    grid.xs[i] * 1e9;


                y[index] =
                    grid.ys[j] * 1e9;


                z[index] =
                    grid.zs[k] * 1e9;


                index++;

            }

        }

    }


    return {

        x,

        y,

        z

    };

}


// ================================================================
// 3D PLOT
// ================================================================

function plot3D(
    grid,
    mode,
    plotId
) {


    if (
        !plotlyReady()
    ) {

        return;

    }


    const coords =
        make3DCoordinates(
            grid
        );


    const values =
        Array.from(
            grid.density
        );


    const maximum =
        getMaximum(
            values
        );


    if (
        maximum <= 0
    ) {

        return;

    }


    let trace;


    if (
        mode === "isosurface"
    ) {


        trace = {

            type:
                "isosurface",

            x:
                coords.x,

            y:
                coords.y,

            z:
                coords.z,

            value:
                values,

            // Draw one density threshold only. A range of thresholds creates
            // nested shells, which is why the previous plot looked like rings.
            // A single isosurface gives one continuous particle for each state.
            isomin:
                maximum * 0.22,

            isomax:
                maximum * 0.22,

            surface: {
                count: 1
            },

            // Neutral grey material with directional lighting for a softly
            // faceted, textured appearance. This affects only the isosurface.
            colorscale: [
                [0.00, "#777777"],
                [0.50, "#b5b5b5"],
                [1.00, "#eeeeee"]
            ],
            opacity: 1,
            lighting: {
                ambient: 0.42,
                diffuse: 0.78,
                specular: 0.16,
                roughness: 0.88,
                fresnel: 0.04
            },
            lightposition: { x: 100, y: 150, z: 180 },

            caps: {

                x: {
                    show: false
                },

                y: {
                    show: false
                },

                z: {
                    show: false
                }

            },

        };

    }


    else {


        trace = {

            type:
                "volume",

            x:
                coords.x,

            y:
                coords.y,

            z:
                coords.z,

            value:
                values,

            isomin:
                maximum * 0.02,

            isomax:
                maximum,

            opacity:
                0.15,

            surface: {

                count:
                    12

            },

            colorscale:
                "Viridis"

        };

    }


    const plotElement =
        $(plotId);


    if (!plotElement) {

        return;

    }


    // Keep the 3D plot compact so it does not leave a large empty area below.
    plotElement.style.height =
        "560px";


    plotElement.style.marginTop =
        "0";


    const layout = {

        height: 560,

        scene: {

            // Use the available plot area efficiently and avoid excess space below.
            domain: {
                x: [0.02, 0.91],
                y: [0.02, 0.98]
            },

            aspectmode: "data",

            camera: {

                eye: {
                    x: 1.65,
                    y: 1.65,
                    z: 1.50
                },
                center: {
                    x: 0,
                    y: 0,
                    z: 0.04
                }

            },

            xaxis: {
                title: { text: "x (nm)", font: { color: "#334155" } },
                tickfont: { color: "#475569" },
                gridcolor: "rgba(100,116,139,0.22)",
                zerolinecolor: "rgba(100,116,139,0.35)",
                linecolor: "#94a3b8",
                backgroundcolor: "rgba(248,250,252,0.25)"
            },

            yaxis: {
                title: { text: "y (nm)", font: { color: "#334155" } },
                tickfont: { color: "#475569" },
                gridcolor: "rgba(100,116,139,0.22)",
                zerolinecolor: "rgba(100,116,139,0.35)",
                linecolor: "#94a3b8",
                backgroundcolor: "rgba(248,250,252,0.25)"
            },

            zaxis: {
                title: { text: "z (nm)", font: { color: "#334155" } },
                tickfont: { color: "#475569" },
                gridcolor: "rgba(100,116,139,0.22)",
                zerolinecolor: "rgba(100,116,139,0.35)",
                linecolor: "#94a3b8",
                backgroundcolor: "rgba(248,250,252,0.25)"
            }

        },


        paper_bgcolor:
            "rgba(0,0,0,0)",


        plot_bgcolor:
            "rgba(0,0,0,0)",


        font: {

            color:
                "white"

        },


        margin: {

            l: 60,

            r: 85,

            b: 45,

            t: 25

        },

        autosize: true

    };


    Plotly.newPlot(

        plotId,

        [trace],

        layout,

        {

            responsive:
                true,

            displaylogo:
                false

        }

    );

}


// ================================================================
// RUN INTERACTIVE VISUALISATION
// ================================================================

function updateSliceControls() {


    const controls =
        document.querySelector(".control-section");


    if (!controls) {

        return;

    }


    controls.style.display =
        $("plotMode").value === "slices"
            ? "block"
            : "none";

}


// ================================================================
// CREATE A NEW PLOT AREA
// ================================================================

function createPlotArea(mode) {


    const container =
        $("plotsContainer");


    if (!container) {

        return null;

    }


    const card =
        document.createElement("div");


    card.className =
        "plot-output-card";


    const heading =
        document.createElement("div");


    heading.className =
        "plot-output-title";


    heading.textContent =
        mode === "slices"
            ? "2D Probability Density Slice"
            : mode === "isosurface"
                ? "3D Probability Density Isosurface"
                : "3D Probability Density Volume";


    const plot =
        document.createElement("div");


    const plotId =
        "plot_" +
        Date.now() +
        "_" +
        Math.floor(Math.random() * 100000);


    plot.id = plotId;


    plot.className =
        mode === "slices"
            ? "visualization-plot-area"
            : "plot-3d-container";


    card.appendChild(heading);

    card.appendChild(plot);

    container.appendChild(card);


    return plotId;

}


// ================================================================
// RUN INTERACTIVE VISUALISATION
// ================================================================

function runVisualization() {


    const mode =
        $("plotMode").value;


    if (!mode) {

        showPlotError(
            "plotError",
            "Please select a visualisation from the dropdown first."
        );

        return;

    }


    if (!plotlyReady()) {

        showPlotError(
            "plotError",
            "Plotly is still loading. Please wait a moment and try again."
        );


        loadPlotlyFallback()
            .then(function(success) {

                if (success) {

                    hidePlotError("plotError");

                    runVisualization();

                }

                else {

                    showPlotError(
                        "plotError",
                        "Unable to load Plotly. Please check your internet connection or refresh the page."
                    );

                }

            });


        return;

    }


    hidePlotError("plotError");


    let N =
        parseInt($("gridN").value);


    if (!Number.isFinite(N)) {

        N = 25;

    }


    N =
        Math.max(
            10,
            Math.min(50, N)
        );


    $("gridN").value = N;


    currentGrid =
        computeGridAndDensity(N);


    const plotId =
        createPlotArea(mode);


    if (!plotId) {

        return;

    }


    if (mode === "slices") {


        const axis =
            $("sliceAxis").value;


        const slider =
            parseInt($("sliceSlider").value);


        const index =
            Math.floor(
                (N - 1) *
                slider / 100
            );


        plotSlice(
            currentGrid,
            axis,
            index,
            plotId
        );


        // Remember the most recently created slice plot.
        window.lastSlicePlotId =
            plotId;

    }

    else {


        plot3D(
            currentGrid,
            mode,
            plotId
        );

    }

}


// ================================================================
// SLIDER
// ================================================================

function updateSlice() {


    if (!currentGrid) {

        return;

    }


    const mode =
        $("plotMode").value;


    if (mode !== "slices") {

        return;

    }


    const value =
        parseInt($("sliceSlider").value);


    $("sliceValue").textContent =
        `${value}%`;


    const index =
        Math.floor(
            (currentGrid.N - 1) *
            value / 100
        );


    if (window.lastSlicePlotId) {

        plotSlice(
            currentGrid,
            $("sliceAxis").value,
            index,
            window.lastSlicePlotId
        );

    }

}


// ================================================================
// ENERGY COMPARISON
// ================================================================

function generateEnergyComparison() {

    if (!plotlyReady()) return;

    const data = getInputsNormalized();
    const target = [data.nx, data.ny, data.nz];

    // Generate a neighbourhood of states around the user's selected state.
    // Sorting by energy makes the table and graph show nearby lower/higher levels,
    // even when the selected quantum numbers are much larger than 1, 2, or 3.
    const maxX = Math.max(4, data.nx + 5);
    const maxY = Math.max(4, data.ny + 5);
    const maxZ = Math.max(4, data.nz + 5);
    const allStates = [];

    for (let nx = 1; nx <= maxX; nx++) {
        for (let ny = 1; ny <= maxY; ny++) {
            for (let nz = 1; nz <= maxZ; nz++) {
                const energyJ = energyLevel(
                    nx, ny, nz,
                    data.Lx, data.Ly, data.Lz, data.m
                );
                allStates.push({
                    nx,
                    ny,
                    nz,
                    eV: energyJ / EV,
                    selected: nx === target[0] && ny === target[1] && nz === target[2]
                });
            }
        }
    }

    allStates.sort((a, b) => {
        const delta = a.eV - b.eV;
        if (Math.abs(delta) > Math.max(Math.abs(a.eV), Math.abs(b.eV), 1) * 1e-12) {
            return delta;
        }
        return a.nx - b.nx || a.ny - b.ny || a.nz - b.nz;
    });

    const selectedIndex = allStates.findIndex(state => state.selected);
    if (selectedIndex < 0) return;

    const windowSize = 4;
    const visibleStates = allStates.slice(
        Math.max(0, selectedIndex - windowSize),
        Math.min(allStates.length, selectedIndex + windowSize + 1)
    );

    const labels = visibleStates.map(state => `(${state.nx},${state.ny},${state.nz})`);
    const energies = visibleStates.map(state => state.eV);
    const selected = visibleStates.map(state => state.selected);

    let tableHTML = `
        <table class="energy-table">
            <thead>
                <tr>
                    <th>Quantum State</th>
                    <th>nₓ</th>
                    <th>nᵧ</th>
                    <th>n𝓏</th>
                    <th>Energy (eV)</th>
                </tr>
            </thead>
            <tbody>
    `;

    visibleStates.forEach(state => {
        tableHTML += `
            <tr class="${state.selected ? "selected-state" : ""}">
                <td>(${state.nx},${state.ny},${state.nz})</td>
                <td>${state.nx}</td>
                <td>${state.ny}</td>
                <td>${state.nz}</td>
                <td>${state.eV.toFixed(5)}</td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    const tableElement = $("energyTable");
    const plotElement = $("energyPlot");
    tableElement.innerHTML = tableHTML;
    tableElement.classList.add("is-visible");
    plotElement.classList.add("is-visible");

    // Muted greys fit the professional light theme; highlight the active state in slate.
    const colors = selected.map(isSelected => isSelected ? "#475569" : "#cbd5e1");
    const trace = {
        x: labels,
        y: energies,
        type: "bar",
        marker: {
            color: colors,
            line: { color: "#94a3b8", width: 1 }
        },
        text: energies.map(value => value.toFixed(3)),
        textposition: "outside",
        hovertemplate: "%{y:.5f}<extra></extra>"
    };

    const layout = {
        title: { text: "Energy Spectrum of Nearby Quantum States", font: { color: "#334155", size: 22 } },
        xaxis: {
            title: { text: "Quantum State (nₓ,nᵧ,n𝓏)", standoff: 12, font: { color: "#334155" } },
            tickmode: "array",
            tickvals: labels,
            ticktext: labels,
            showticklabels: true,
            tickangle: -35,
            tickfont: { size: 13, color: "#475569" },
            automargin: true,
            gridcolor: "rgba(148,163,184,0.16)",
            linecolor: "#94a3b8",
            zerolinecolor: "#94a3b8",
            fixedrange: false
        },
        yaxis: {
            title: { text: "Energy (eV)", font: { color: "#334155" } },
            tickfont: { color: "#475569" },
            rangemode: "tozero",
            automargin: true,
            gridcolor: "rgba(148,163,184,0.24)",
            linecolor: "#94a3b8",
            zerolinecolor: "#94a3b8",
            autorange: true
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: { color: "#334155", family: "Inter, Arial, sans-serif" },
        height: 500,
        margin: { l: 80, r: 25, t: 65, b: 115 }
    };

    plotElement.style.height = layout.height + "px";
    Plotly.newPlot(plotElement, [trace], layout, {
        responsive: true,
        displaylogo: false,
        autosizable: true
    }).then(function() {
        const resizeEnergyPlot = function() {
            if (window.Plotly && plotElement.data) Plotly.Plots.resize(plotElement);
        };
        plotElement.addEventListener("transitionend", function(event) {
            if (event.propertyName === "max-height") resizeEnergyPlot();
        }, { once: true });
        window.setTimeout(resizeEnergyPlot, 900);
        window.addEventListener("resize", resizeEnergyPlot, { passive: true });
    });
}

// ================================================================
// INITIALIZE PLOTS AFTER PLOTLY LOAD
// ================================================================

function initializePlots() {


    loadPlotlyFallback()
        .then(

            function(success) {


                if (!success) {


                    showPlotError(

                        "plotError",

                        "Plotly could not be loaded. Please refresh the page and make sure your internet connection is active."

                    );
return;

                }


                // ------------------------------------------------
                // Do not create a visualisation on page load.
                // The user selects a plot type first.
                // ------------------------------------------------

                updateSliceControls();

            }

        );

}


// ================================================================
// INITIALIZATION
// ================================================================

function initializeApplication() {


    toggleCustomMass();

    updateSliceControls();


    // Calculate

    $("calculateBtn")
        .addEventListener(
            "click",
            calculate
        );


    // Custom mass

    $("mass")
        .addEventListener(
            "change",
            toggleCustomMass
        );




    // Slice slider

    $("sliceSlider")
        .addEventListener(
            "input",
            updateSlice
        );


    // Slice axis

    $("sliceAxis")
        .addEventListener(

            "change",

            function() {

                updateSlice();

            }

        );


    // Plot mode

    $("plotMode")
        .addEventListener(

            "change",

            function() {

                updateSliceControls();

                hidePlotError("plotError");

                if (this.value) {

                    runVisualization();

                }

            }

        );
    // Energy comparison

    $("energyCompareBtn")
        .addEventListener(

            "click",

            function() {

                generateEnergyComparison();

            }

        );


    // ------------------------------------------------
    // Do not calculate results on page load.
    // Results remain blank until the user presses Calculate.
    // ------------------------------------------------


    // ------------------------------------------------
    // Load Plotly and then create plots
    // ------------------------------------------------

    initializePlots();

}


// ================================================================
// DOM READY
// ================================================================

if (
    document.readyState === "loading"
) {


    document.addEventListener(

        "DOMContentLoaded",

        initializeApplication

    );

}

else {

    initializeApplication();

}


// ================================================================
// PARTICLE BACKGROUND
// ================================================================

const canvas =
    $("particles-bg");


const ctx =
    canvas.getContext(
        "2d"
    );


let particles = [];


function resizeCanvas() {


    canvas.width =
        window.innerWidth;


    canvas.height =
        window.innerHeight;

}


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();


for (
    let i = 0;
    i < 120;
    i++
) {


    particles.push({

        x:
            Math.random() *
            canvas.width,

        y:
            Math.random() *
            canvas.height,

        r:
            Math.random() * 2,

        dx:
            (Math.random() - 0.5) *
            0.5,

        dy:
            (Math.random() - 0.5) *
            0.5

    });

}


function animateParticles() {


    ctx.clearRect(

        0,
        0,
        canvas.width,
        canvas.height

    );


    for (
        let i = 0;
        i < particles.length;
        i++
    ) {


        const p =
            particles[i];


        ctx.beginPath();


        ctx.arc(

            p.x,
            p.y,
            p.r,
            0,
            Math.PI * 2

        );


        ctx.fillStyle =
            "cyan";


        ctx.shadowBlur =
            20;


        ctx.shadowColor =
            "cyan";


        ctx.fill();


        p.x +=
            p.dx;


        p.y +=
            p.dy;


        if (
            p.x < 0 ||
            p.x > canvas.width
        ) {

            p.dx *= -1;

        }


        if (
            p.y < 0 ||
            p.y > canvas.height
        ) {

            p.dy *= -1;

        }

    }


    requestAnimationFrame(
        animateParticles
    );

}


animateParticles();