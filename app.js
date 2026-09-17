/* =====================================================
   SMART IRRIGATION ROBOT
   FRONTEND JAVASCRIPT
===================================================== */


/* =====================================================
   BACKEND URL
===================================================== */

const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:5000/api"
        : `${window.location.origin}/api`;


/*
   When you deploy your Flask backend,
   change the line above to:

   let API_URL =
       "https://YOUR-BACKEND-URL/api";
*/


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let audioContext = null;

let selectedRobotNumber = null;

let robotWorking = false;

let workTimer = null;

let farmRobotPosition = 15;


/* =====================================================
   AUDIO
===================================================== */

function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }

    return audioContext;
}


/* =====================================================
   NORMAL SOUND
===================================================== */

function playSound(
    frequency = 600,
    duration = 200,
    type = "sine",
    volume = 0.25
) {

    try {

        const context =
            getAudioContext();

        const oscillator =
            context.createOscillator();

        const gain =
            context.createGain();

        oscillator.connect(gain);

        gain.connect(
            context.destination
        );

        oscillator.type = type;

        oscillator.frequency.setValueAtTime(
            frequency,
            context.currentTime
        );

        gain.gain.setValueAtTime(
            volume,
            context.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime +
            duration / 1000
        );

        oscillator.start();

        oscillator.stop(
            context.currentTime +
            duration / 1000
        );

    }

    catch (error) {

        console.log(
            "Audio error:",
            error
        );

    }

}


/* =====================================================
   WATER FALLING SOUND
===================================================== */

let waterSoundTimer = null;

function startWaterSound() {

    stopWaterSound();

    function makeWaterSound() {

        try {

            const context =
                getAudioContext();

            const bufferSize =
                context.sampleRate * 0.25;

            const buffer =
                context.createBuffer(
                    1,
                    bufferSize,
                    context.sampleRate
                );

            const data =
                buffer.getChannelData(0);

            for (
                let i = 0;
                i < bufferSize;
                i++
            ) {

                data[i] =
                    (
                        Math.random() * 2 - 1
                    ) *
                    Math.exp(
                        -i /
                        (
                            context.sampleRate *
                            0.08
                        )
                    );

            }

            const source =
                context.createBufferSource();

            const filter =
                context.createBiquadFilter();

            const gain =
                context.createGain();

            filter.type =
                "highpass";

            filter.frequency.value =
                500;

            gain.gain.value =
                0.15;

            source.buffer =
                buffer;

            source
                .connect(filter)
                .connect(gain)
                .connect(
                    context.destination
                );

            source.start();

        }

        catch (error) {

            console.log(
                "Water sound error:",
                error
            );

        }

    }


    makeWaterSound();

    waterSoundTimer =
        setInterval(
            makeWaterSound,
            350
        );

}


function stopWaterSound() {

    if (waterSoundTimer) {

        clearInterval(
            waterSoundTimer
        );

        waterSoundTimer =
            null;

    }

}


/* =====================================================
   ALERT SOUND
===================================================== */

function playAlertSound() {

    getAudioContext();

    playSound(
        1000,
        250,
        "square",
        0.3
    );

    setTimeout(
        () => {

            playSound(
                1000,
                250,
                "square",
                0.3
            );

        },
        350
    );

    setTimeout(
        () => {

            playSound(
                700,
                400,
                "square",
                0.25
            );

        },
        700
    );

}


/* =====================================================
   LOGIN
===================================================== */

function login() {

    const username =
        document
            .getElementById("username")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value
            .trim();


    if (
        username === "" ||
        password === ""
    ) {

        document
            .getElementById(
                "loginMessage"
            )
            .textContent =
            "Please enter username and password.";

        playAlertSound();

        return;

    }


    getAudioContext();


    document
        .getElementById(
            "loginPage"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "dashboardPage"
        )
        .classList
        .remove("hidden");


    playSound(
        700,
        120
    );


    setTimeout(
        () => {

            playSound(
                900,
                150
            );

        },
        150
    );


    startSystem();

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    stopRobotWork();

    stopWaterSound();

    selectedRobotNumber =
        null;

    localStorage.removeItem(
        "selectedRobot"
    );


    document
        .getElementById(
            "dashboardPage"
        )
        .classList
        .add("hidden");


    document
        .getElementById(
            "loginPage"
        )
        .style
        .display =
        "flex";


    document
        .getElementById(
            "username"
        )
        .value = "";


    document
        .getElementById(
            "password"
        )
        .value = "";


    playSound(
        300,
        200,
        "square",
        0.2
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

function goToSection(
    sectionId
) {

    const section =
        document.getElementById(
            sectionId
        );

    if (!section) {
        return;
    }


    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    playSound(
        650,
        100
    );

}


/* =====================================================
   OPEN PUMP DASHBOARD
===================================================== */

function openPumpDashboard() {

    const pump =
        document.getElementById(
            "pumpSection"
        );

    if (!pump) {
        return;
    }


    pump.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    playSound(
        500,
        120
    );

}


/* =====================================================
   PUMP TABS
===================================================== */

function showPumpTab(
    tabName,
    button
) {

    document
        .querySelectorAll(
            ".pump-tab-content"
        )
        .forEach(
            tab => {

                tab.classList
                    .remove("active");

            }
        );


    document
        .querySelectorAll(
            ".pump-tab"
        )
        .forEach(
            tab => {

                tab.classList
                    .remove("active");

            }
        );


    const selectedTab =
        document.getElementById(
            tabName + "Tab"
        );


    if (selectedTab) {

        selectedTab.classList
            .add("active");

    }


    if (button) {

        button.classList
            .add("active");

    }


    playSound(
        600,
        100
    );

}


/* =====================================================
   SOIL
===================================================== */

function selectMoisture(
    condition,
    percentage
) {

    document
        .getElementById(
            "soilMoisture"
        )
        .textContent =
        percentage + "%";


    document
        .getElementById(
            "soilCondition"
        )
        .textContent =
        condition;


    document
        .getElementById(
            "soilMoistureDisplay"
        )
        .textContent =
        percentage + "%";


    document
        .getElementById(
            "soilConditionDisplay"
        )
        .textContent =
        condition;


    document
        .getElementById(
            "moistureFill"
        )
        .style
        .width =
        percentage + "%";


    playSound(
        500,
        200
    );


    fetch(
        `${API_URL}/soil`,
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                moisture:
                    percentage,

                condition:
                    condition

            })

        }
    )
    .catch(
        error =>
            console.log(
                "Soil error:",
                error
            )
    );

}


/* =====================================================
   WATER
===================================================== */

function selectWaterLevel(
    percentage
) {

    document
        .getElementById(
            "waterLevel"
        )
        .textContent =
        percentage + "%";


    document
        .getElementById(
            "waterLevelDisplay"
        )
        .textContent =
        percentage + "%";


    document
        .getElementById(
            "tankWater"
        )
        .style
        .height =
        percentage + "%";


    document
        .getElementById(
            "waterMiniFill"
        )
        .style
        .width =
        percentage + "%";


    playSound(
        350,
        200
    );


    setTimeout(
        () => {

            playSound(
                450,
                180
            );

        },
        150
    );


    fetch(
        `${API_URL}/water`,
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                water_level:
                    percentage

            })

        }
    )
    .catch(
        error =>
            console.log(
                "Water error:",
                error
            )
    );

}


/* =====================================================
   TEMPERATURE
===================================================== */

function selectTemperature(
    temperature
) {

    document
        .getElementById(
            "temperature"
        )
        .textContent =
        temperature + "°C";


    document
        .getElementById(
            "temperatureDisplay"
        )
        .textContent =
        temperature + "°C";


    playSound(
        650,
        150
    );


    fetch(
        `${API_URL}/temperature`,
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                temperature:
                    temperature

            })

        }
    )
    .catch(
        error =>
            console.log(
                "Temperature error:",
                error
            )
    );

}


/* =====================================================
   PUMP
===================================================== */

function controlPump(
    status
) {

    getAudioContext();


    if (status === "on") {

        startWaterSound();

        playSound(
            300,
            250,
            "square",
            0.18
        );

    }

    else {

        stopWaterSound();

        playSound(
            250,
            180,
            "square",
            0.2
        );

    }


    updatePumpDisplay(
        status === "on"
    );


    fetch(
        `${API_URL}/pump`,
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                status:
                    status

            })

        }
    )
    .then(
        response =>
            response.json()
    )
    .then(
        data => {

            updatePumpDisplay(
                data.pump
            );


            if (data.robot_task) {

                document
                    .getElementById(
                        "robotTask"
                    )
                    .textContent =
                    data.robot_task;

            }

        }
    )
    .catch(
        error =>
            console.log(
                "Pump error:",
                error
            )
    );

}


/* =====================================================
   PUMP DISPLAY
===================================================== */

function updatePumpDisplay(
    isOn
) {

    const status =
        document.getElementById(
            "pumpStatus"
        );


    const indicator =
        document.getElementById(
            "pumpIndicator"
        );


    const dashboardStatus =
        document.getElementById(
            "pumpDashboardStatus"
        );


    const waterFlowText =
        document.getElementById(
            "waterFlowText"
        );


    const flowMeter =
        document.getElementById(
            "flowMeterFill"
        );


    const flowStatus =
        document.getElementById(
            "flowStatus"
        );


    if (status) {

        status.textContent =
            isOn ? "ON" : "OFF";

    }


    if (indicator) {

        indicator.textContent =
            isOn ? "ON" : "OFF";

        indicator.classList
            .remove(
                "on",
                "off"
            );

        indicator.classList
            .add(
                isOn
                    ? "on"
                    : "off"
            );

    }


    if (dashboardStatus) {

        dashboardStatus.textContent =
            isOn ? "ON" : "OFF";

        dashboardStatus.classList
            .remove(
                "on",
                "off"
            );

        dashboardStatus.classList
            .add(
                isOn
                    ? "on"
                    : "off"
            );

    }


    if (waterFlowText) {

        waterFlowText.textContent =
            isOn
                ? "💧 Water is flowing..."
                : "Water flow stopped";

    }


    if (flowMeter) {

        flowMeter.style.width =
            isOn ? "85%" : "0%";

    }


    if (flowStatus) {

        flowStatus.textContent =
            isOn
                ? "Flow: 85%"
                : "Flow: 0%";

    }

}


/* =====================================================
   AUTOMATIC IRRIGATION
===================================================== */

function setAutomaticMode(
    enabled
) {

    fetch(
        `${API_URL}/automatic`,
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                enabled:
                    enabled

            })

        }
    )
    .then(
        response =>
            response.json()
    )
    .then(
        data => {

            updateAutomaticDisplay(
                data.automatic_irrigation
            );


            updatePumpDisplay(
                data.pump
            );


            if (data.pump) {

                startWaterSound();

            }

            else {

                stopWaterSound();

            }


            if (data.robot_task) {

                document
                    .getElementById(
                        "robotTask"
                    )
                    .textContent =
                    data.robot_task;

            }

        }
    )
    .catch(
        error =>
            console.log(
                "Automatic error:",
                error
            )
    );

}


/* =====================================================
   AUTOMATIC DISPLAY
===================================================== */

function updateAutomaticDisplay(
    isOn
) {

    const status =
        document.getElementById(
            "automaticStatus"
        );


    const indicator =
        document.getElementById(
            "automaticIndicator"
        );


    if (status) {

        status.textContent =
            isOn
                ? "ON"
                : "OFF";

    }


    if (indicator) {

        indicator.textContent =
            isOn
                ? "ON"
                : "OFF";

        indicator.classList
            .remove(
                "on",
                "off"
            );

        indicator.classList
            .add(
                isOn
                    ? "on"
                    : "off"
            );

    }

}


/* =====================================================
   ROBOT SELECTION
===================================================== */

function selectFarmRobot(
    robotNumber
) {

    selectedRobotNumber =
        robotNumber;


    localStorage.setItem(
        "selectedRobot",
        robotNumber
    );


    const names = {

        1:
            "Soil Monitoring Robot",

        2:
            "Irrigation Robot",

        3:
            "Crop Monitoring Robot",

        4:
            "Fertilizer Robot",

        5:
            "Farm Transport Robot"

    };


    const robotName =
        names[robotNumber];


    document
        .getElementById(
            "selectedRobotName"
        )
        .textContent =
        robotName;


    document
        .getElementById(
            "robotWorkStatus"
        )
        .textContent =
        "READY";


    document
        .getElementById(
            "farmRobotStatus"
        )
        .textContent =
        "READY";


    document
        .getElementById(
            "robotTask"
        )
        .textContent =
        robotName +
        " is ready to work.";


    playSound(
        750,
        100
    );


    fetch(
        `${API_URL}/robot/select`,
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                robot:
                    robotNumber

            })

        }
    )
    .then(
        response =>
            response.json()
    )
    .then(
        data => {

            if (
                data.success === true
            ) {

                document
                    .getElementById(
                        "selectedRobotName"
                    )
                    .textContent =
                    data.robot;

                document
                    .getElementById(
                        "robotTask"
                    )
                    .textContent =
                    data.robot_task;

            }

        }
    )
    .catch(
        error =>
            console.log(
                "Robot selection error:",
                error
            )
    );

}


/* =====================================================
   START ROBOT
===================================================== */

function startRobotWork() {

    if (!selectedRobotNumber) {

        const savedRobot =
            localStorage.getItem(
                "selectedRobot"
            );

        if (savedRobot) {

            selectedRobotNumber =
                Number(savedRobot);

        }

    }


    if (!selectedRobotNumber) {

        alert(
            "Please select a robot first."
        );

        return;

    }


    /*
       IMPORTANT:
       Select the robot AGAIN before
       sending the work command.
       This prevents the old
       "Please select a robot first"
       problem.
    */

    fetch(
        `${API_URL}/robot/select`,
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                robot:
                    selectedRobotNumber

            })

        }
    )
    .then(
        response =>
            response.json()
    )
    .then(
        () => {

            return fetch(
                `${API_URL}/robot/work`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        working:
                            true

                    })

                }
            );

        }
    )
    .then(
        response =>
            response.json()
    )
    .then(
        data => {

            if (
                data.success !== true
            ) {

                alert(
                    data.message ||
                    "Robot could not start."
                );

                return;

            }


            robotWorking =
                true;


            document
                .getElementById(
                    "robotWorkStatus"
                )
                .textContent =
                "WORKING";


            document
                .getElementById(
                    "farmRobotStatus"
                )
                .textContent =
                "WORKING";


            document
                .getElementById(
                    "robotTask"
                )
                .textContent =
                data.robot_task ||
                "Robot is working.";


            document
                .getElementById(
                    "workingRobot"
                )
                .classList
                .add("working");


            updatePumpDisplay(
                data.pump
            );


            startFarmWork();


            playSound(
                700,
                150
            );

        }
    )
    .catch(
        error => {

            console.log(
                "Start robot error:",
                error
            );

            alert(
                "Unable to connect to backend."
            );

        }
    );

}


/* =====================================================
   FARM WORK
===================================================== */

function startFarmWork() {

    clearInterval(
        workTimer
    );


    workTimer =
        setInterval(
            () => {

                if (
                    !robotWorking
                ) {

                    return;

                }


                moveWorkingRobot();

            },
            2500
        );

}


function moveWorkingRobot() {

    const robot =
        document.getElementById(
            "workingRobot"
        );


    if (!robot) {
        return;
    }


    farmRobotPosition += 8;


    if (
        farmRobotPosition >= 80
    ) {

        farmRobotPosition =
            15;

    }


    robot.style.left =
        farmRobotPosition +
        "%";


    document
        .getElementById(
            "farmRobotStatus"
        )
        .textContent =
        "WORKING • CHECKING CROPS";


    setTimeout(
        () => {

            if (
                !robotWorking
            ) {
                return;
            }


            document
                .getElementById(
                    "farmRobotStatus"
                )
                .textContent =
                "WORKING • IRRIGATING";

        },
        1000
    );

}


/* =====================================================
   PAUSE
===================================================== */

function pauseRobotWork() {

    robotWorking =
        false;


    clearInterval(
        workTimer
    );


    document
        .getElementById(
            "workingRobot"
        )
        .classList
        .remove("working");


    fetch(
        `${API_URL}/robot/work`,
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                working:
                    false

            })

        }
    )
    .then(
        response =>
            response.json()
    )
    .then(
        data => {

            document
                .getElementById(
                    "robotWorkStatus"
                )
                .textContent =
                "PAUSED";


            document
                .getElementById(
                    "farmRobotStatus"
                )
                .textContent =
                "PAUSED";


            document
                .getElementById(
                    "robotTask"
                )
                .textContent =
                data.robot_task ||
                "Robot work paused.";

        }
    );


    playSound(
        400,
        150
    );

}


/* =====================================================
   STOP ROBOT
   IMMEDIATE ALERT SOUND
===================================================== */

function stopRobotWork() {

    /*
       STOP EVERYTHING IMMEDIATELY
    */

    robotWorking =
        false;


    clearInterval(
        workTimer
    );


    stopWaterSound();


    const robot =
        document.getElementById(
            "workingRobot"
        );


    if (robot) {

        robot.classList
            .remove("working");

    }


    document
        .getElementById(
            "robotWorkStatus"
        )
        .textContent =
        "STOPPED";


    document
        .getElementById(
            "farmRobotStatus"
        )
        .textContent =
        "STOPPED";


    document
        .getElementById(
            "robotTask"
        )
        .textContent =
        "Robot stopped immediately.";


    document
        .getElementById(
            "systemAlert"
        )
        .textContent =
        "🚨 ALERT: Robot has been stopped immediately.";


    /*
       ALERT SOUND HAPPENS IMMEDIATELY
    */

    getAudioContext();

    playAlertSound();


    /*
       Tell backend
    */

    fetch(
        `${API_URL}/robot/stop`,
        {
            method: "POST"
        }
    )
    .then(
        response =>
            response.json()
    )
    .then(
        data => {

            if (data.robot_task) {

                document
                    .getElementById(
                        "robotTask"
                    )
                    .textContent =
                    data.robot_task;

            }

        }
    )
    .catch(
        error =>
            console.log(
                "Stop error:",
                error
            )
    );

}


/* =====================================================
   ALERT
===================================================== */

function testAlertSound() {

    getAudioContext();

    playAlertSound();


    document
        .getElementById(
            "systemAlert"
        )
        .textContent =
        "🔊 TEST ALERT: Sound is working.";

}


function checkSystemAlert() {

    getAudioContext();

    playAlertSound();


    fetch(
        `${API_URL}/alerts`
    )
    .then(
        response =>
            response.json()
    )
    .then(
        data => {

            document
                .getElementById(
                    "systemAlert"
                )
                .textContent =
                data.alerts.join(
                    " | "
                );

        }
    )
    .catch(
        error =>
            console.log(
                "Alert error:",
                error
            )
    );

}


/* =====================================================
   LOAD SYSTEM STATUS
===================================================== */

function loadSystemStatus() {

    fetch(
        `${API_URL}/status`
    )
    .then(
        response => {

            if (!response.ok) {

                throw new Error(
                    "Backend not responding."
                );

            }

            return response.json();

        }
    )
    .then(
        data => {

            document
                .getElementById(
                    "soilMoisture"
                )
                .textContent =
                data.soil_moisture +
                "%";


            document
                .getElementById(
                    "soilCondition"
                )
                .textContent =
                data.soil_condition;


            document
                .getElementById(
                    "soilMoistureDisplay"
                )
                .textContent =
                data.soil_moisture +
                "%";


            document
                .getElementById(
                    "soilConditionDisplay"
                )
                .textContent =
                data.soil_condition;


            document
                .getElementById(
                    "moistureFill"
                )
                .style
                .width =
                data.soil_moisture +
                "%";


            document
                .getElementById(
                    "waterLevel"
                )
                .textContent =
                data.water_level +
                "%";


            document
                .getElementById(
                    "waterLevelDisplay"
                )
                .textContent =
                data.water_level +
                "%";


            document
                .getElementById(
                    "tankWater"
                )
                .style
                .height =
                data.water_level +
                "%";


            document
                .getElementById(
                    "waterMiniFill"
                )
                .style
                .width =
                data.water_level +
                "%";


            document
                .getElementById(
                    "temperature"
                )
                .textContent =
                data.temperature +
                "°C";


            document
                .getElementById(
                    "temperatureDisplay"
                )
                .textContent =
                data.temperature +
                "°C";


            document
                .getElementById(
                    "battery"
                )
                .textContent =
                data.battery +
                "%";


            document
                .getElementById(
                    "batteryFill"
                )
                .style
                .width =
                data.battery +
                "%";


            updatePumpDisplay(
                data.pump
            );


            updateAutomaticDisplay(
                data.automatic_irrigation
            );


            if (data.pump) {

                startWaterSound();

            }

        }
    )
    .catch(
        error => {

            console.log(
                "Backend error:",
                error
            );


            document
                .getElementById(
                    "systemAlert"
                )
                .textContent =
                "⚠️ Backend is offline.";

        }
    );

}


/* =====================================================
   START SYSTEM
===================================================== */

function startSystem() {

    const savedRobot =
        localStorage.getItem(
            "selectedRobot"
        );


    if (savedRobot) {

        selectedRobotNumber =
            Number(savedRobot);

    }


    loadSystemStatus();

}
/* =====================================================
   LEFT NAVIGATION BAR
   PROFILE
   CONTACT FORM
   MESSAGE INBOX
===================================================== */

(function addLeftNavigationFeatures() {

    /* =====================================================
       CREATE STYLE
    ===================================================== */

    const style = document.createElement("style");

    style.textContent = `

        /* ================================
           LEFT NAVIGATION
        ================================= */

        #smartLeftNav {
            position: fixed;
            left: 0;
            top: 0;
            width: 245px;
            height: 100vh;

            background:
                linear-gradient(
                    180deg,
                    #071b12,
                    #0b2b1c,
                    #071b12
                );

            border-right: 1px solid #1d7048;

            padding: 20px 14px;

            z-index: 99999;

            overflow-y: auto;

            box-shadow:
                4px 0 20px rgba(0,0,0,0.35);
        }


        #smartLeftNav .nav-logo {
            text-align: center;
            padding: 10px 5px 20px;
            border-bottom: 1px solid #245d43;
            margin-bottom: 15px;
        }


        #smartLeftNav .nav-logo-icon {
            font-size: 42px;
            margin-bottom: 5px;
        }


        #smartLeftNav .nav-logo-title {
            color: #ffffff;
            font-size: 18px;
            font-weight: bold;
        }


        #smartLeftNav .nav-logo-subtitle {
            color: #7de2a8;
            font-size: 11px;
            margin-top: 4px;
        }


        .smart-nav-button {
            width: 100%;

            border: none;

            background: transparent;

            color: #d9f5e4;

            padding: 13px 12px;

            margin-bottom: 6px;

            border-radius: 10px;

            text-align: left;

            cursor: pointer;

            font-size: 14px;

            transition:
                0.25s ease;
        }


        .smart-nav-button:hover {
            background: #145b39;
            color: #ffffff;
            transform: translateX(4px);
        }


        .smart-nav-button.active {
            background: #176b3a;
            color: #ffffff;
            box-shadow:
                0 4px 12px rgba(0,0,0,0.25);
        }


        .smart-nav-icon {
            display: inline-block;
            width: 28px;
            font-size: 17px;
        }


        .smart-nav-divider {
            height: 1px;
            background: #245d43;
            margin: 14px 5px;
        }


        .smart-nav-profile {
            background: rgba(255,255,255,0.05);
            border: 1px solid #245d43;
            border-radius: 10px;
            padding: 12px;
            margin-top: 10px;
            margin-bottom: 12px;
        }


        .smart-nav-profile-title {
            color: #7de2a8;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }


        .smart-nav-profile-name {
            color: #ffffff;
            font-weight: bold;
            font-size: 13px;
        }


        /* ================================
           MAKE MAIN PAGE MOVE RIGHT
        ================================= */

        body.smart-nav-added {
            padding-left: 245px !important;
        }


        /* ================================
           CONTACT / MESSAGE PAGE
        ================================= */

        #contactMessagesPage {
            display: none;

            position: fixed;

            left: 245px;
            top: 0;

            width: calc(100% - 245px);
            height: 100vh;

            overflow-y: auto;

            background:
                linear-gradient(
                    135deg,
                    #071b12,
                    #102c20
                );

            z-index: 99990;

            padding: 35px;
        }


        .contact-main-container {
            max-width: 1100px;
            margin: auto;
        }


        .contact-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            gap: 20px;

            margin-bottom: 25px;
        }


        .contact-header h2 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
        }


        .contact-header p {
            color: #9ad8b5;
            margin-top: 6px;
        }


        .contact-close-button {
            border: none;
            background: #176b3a;
            color: white;
            padding: 10px 18px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        }


        .contact-close-button:hover {
            background: #21894d;
        }


        .contact-grid {
            display: grid;

            grid-template-columns:
                minmax(280px, 0.8fr)
                minmax(320px, 1.2fr);

            gap: 25px;
        }


        .contact-card {
            background: rgba(255,255,255,0.06);

            border: 1px solid #245d43;

            border-radius: 15px;

            padding: 25px;

            box-shadow:
                0 10px 30px rgba(0,0,0,0.2);
        }


        .contact-card h3 {
            color: #7de2a8;
            margin-top: 0;
        }


        .contact-info {
            color: #e5fff0;
            margin: 18px 0;
            line-height: 1.7;
        }


        .contact-info strong {
            color: #7de2a8;
        }


        .contact-form label {
            display: block;

            color: #dff8e8;

            margin-bottom: 6px;

            font-size: 13px;

            font-weight: bold;
        }


        .contact-form input,
        .contact-form textarea {

            width: 100%;

            box-sizing: border-box;

            padding: 12px;

            margin-bottom: 15px;

            border-radius: 8px;

            border: 1px solid #2c6f4d;

            background: #071b12;

            color: #ffffff;

            outline: none;

            font-family: inherit;
        }


        .contact-form input:focus,
        .contact-form textarea:focus {
            border-color: #59c987;
            box-shadow:
                0 0 0 2px rgba(89,201,135,0.15);
        }


        .contact-form textarea {
            min-height: 140px;
            resize: vertical;
        }


        .contact-send-button {
            width: 100%;

            border: none;

            background: #176b3a;

            color: white;

            padding: 13px;

            border-radius: 8px;

            cursor: pointer;

            font-size: 15px;

            font-weight: bold;
        }


        .contact-send-button:hover {
            background: #21894d;
        }


        .contact-message-status {
            margin-top: 12px;
            font-weight: bold;
            text-align: center;
        }


        /* ================================
           MESSAGE INBOX
        ================================= */

        #messageInboxPage {
            display: none;

            position: fixed;

            left: 245px;
            top: 0;

            width: calc(100% - 245px);
            height: 100vh;

            overflow-y: auto;

            background:
                linear-gradient(
                    135deg,
                    #071b12,
                    #102c20
                );

            z-index: 99991;

            padding: 35px;
        }


        .message-inbox-container {
            max-width: 1100px;
            margin: auto;
        }


        .message-inbox-header {
            display: flex;

            justify-content: space-between;

            align-items: center;

            margin-bottom: 25px;
        }


        .message-inbox-header h2 {
            color: white;
            margin: 0;
        }


        .message-count {
            background: #176b3a;
            color: white;
            padding: 7px 12px;
            border-radius: 20px;
            font-size: 12px;
        }


        .message-item {
            background: rgba(255,255,255,0.06);

            border: 1px solid #245d43;

            border-radius: 12px;

            padding: 20px;

            margin-bottom: 15px;

            color: #ffffff;
        }


        .message-item.unread {
            border-left: 5px solid #59c987;
        }


        .message-item-header {
            display: flex;

            justify-content: space-between;

            gap: 15px;

            flex-wrap: wrap;
        }


        .message-sender {
            color: #7de2a8;
            font-weight: bold;
        }


        .message-date {
            color: #91a99b;
            font-size: 12px;
        }


        .message-subject {
            font-size: 17px;
            font-weight: bold;
            margin: 10px 0;
        }


        .message-body {
            color: #d7eee0;
            line-height: 1.6;
            white-space: pre-wrap;
        }


        .message-email {
            color: #8fcaa6;
            font-size: 13px;
        }


        .delete-message-button {
            border: none;

            background: #8b2f2f;

            color: white;

            padding: 7px 11px;

            border-radius: 6px;

            cursor: pointer;

            margin-top: 12px;
        }


        .delete-message-button:hover {
            background: #b83d3d;
        }


        .empty-messages {
            text-align: center;

            padding: 70px 20px;

            color: #9ad8b5;

            font-size: 17px;
        }


        /* ================================
           MOBILE
        ================================= */

        @media (max-width: 850px) {

            #smartLeftNav {
                width: 210px;
            }

            body.smart-nav-added {
                padding-left: 210px !important;
            }

            #contactMessagesPage,
            #messageInboxPage {
                left: 210px;
                width: calc(100% - 210px);
                padding: 20px;
            }

            .contact-grid {
                grid-template-columns: 1fr;
            }

        }


        @media (max-width: 600px) {

            #smartLeftNav {
                width: 72px;
                padding: 10px 7px;
            }

            body.smart-nav-added {
                padding-left: 72px !important;
            }

            #smartLeftNav .nav-logo-title,
            #smartLeftNav .nav-logo-subtitle,
            .smart-nav-text,
            .smart-nav-profile {
                display: none;
            }

            .smart-nav-button {
                text-align: center;
                padding: 13px 5px;
            }

            .smart-nav-icon {
                width: auto;
            }

            #contactMessagesPage,
            #messageInboxPage {
                left: 72px;
                width: calc(100% - 72px);
                padding: 15px;
            }

        }

    `;

    document.head.appendChild(style);


    /* =====================================================
       CREATE LEFT NAVIGATION
    ===================================================== */

    const nav = document.createElement("aside");

    nav.id = "smartLeftNav";

    nav.innerHTML = `

        <div class="nav-logo">

            <div class="nav-logo-icon">
                🤖
            </div>

            <div class="nav-logo-title">
                Smart Irrigation
            </div>

            <div class="nav-logo-subtitle">
                Robot Control System
            </div>

        </div>


        <button
            class="smart-nav-button active"
            onclick="smartNavDashboard()"
        >
            <span class="smart-nav-icon">🏠</span>
            <span class="smart-nav-text">Dashboard</span>
        </button>


        <button
            class="smart-nav-button"
            onclick="smartNavSection('robotSection')"
        >
            <span class="smart-nav-icon">🤖</span>
            <span class="smart-nav-text">Robot Movement</span>
        </button>


        <button
            class="smart-nav-button"
            onclick="smartNavSection('soilSection')"
        >
            <span class="smart-nav-icon">🌱</span>
            <span class="smart-nav-text">Soil Moisture</span>
        </button>


        <button
            class="smart-nav-button"
            onclick="smartNavSection('waterSection')"
        >
            <span class="smart-nav-icon">💧</span>
            <span class="smart-nav-text">Water Level</span>
        </button>


        <button
            class="smart-nav-button"
            onclick="smartNavSection('temperatureSection')"
        >
            <span class="smart-nav-icon">🌡️</span>
            <span class="smart-nav-text">Temperature</span>
        </button>


        <button
            class="smart-nav-button"
            onclick="smartNavSection('batterySection')"
        >
            <span class="smart-nav-icon">🔋</span>
            <span class="smart-nav-text">Battery</span>
        </button>


        <button
            class="smart-nav-button"
            onclick="smartNavSection('pumpSection')"
        >
            <span class="smart-nav-icon">🚰</span>
            <span class="smart-nav-text">Pump</span>
        </button>


        <button
            class="smart-nav-button"
            onclick="smartNavSection('alertSection')"
        >
            <span class="smart-nav-icon">🚨</span>
            <span class="smart-nav-text">System Alert</span>
        </button>


        <div class="smart-nav-divider"></div>


        <button
            class="smart-nav-button"
            onclick="openMyProfile()"
        >
            <span class="smart-nav-icon">👤</span>
            <span class="smart-nav-text">My Profile</span>
        </button>


        <button
            class="smart-nav-button"
            onclick="openContactPage()"
        >
            <span class="smart-nav-icon">📩</span>
            <span class="smart-nav-text">Contact Me</span>
        </button>


        <button
            class="smart-nav-button"
            onclick="openMessageInbox()"
        >
            <span class="smart-nav-icon">💬</span>
            <span class="smart-nav-text">
                Messages
            </span>
        </button>


        <div class="smart-nav-divider"></div>


        <button
            class="smart-nav-button"
            onclick="logout()"
        >
            <span class="smart-nav-icon">🚪</span>
            <span class="smart-nav-text">Logout</span>
        </button>

    `;

    document.body.appendChild(nav);

    document.body.classList.add(
        "smart-nav-added"
    );


    /* =====================================================
       CREATE CONTACT PAGE
    ===================================================== */

    const contactPage =
        document.createElement("div");

    contactPage.id =
        "contactMessagesPage";

    contactPage.innerHTML = `

        <div class="contact-main-container">

            <div class="contact-header">

                <div>

                    <h2>
                        📩 Contact Salisu Tanimu Atabs
                    </h2>

                    <p>
                        Send a message directly through
                        the Smart Irrigation Robot system.
                    </p>

                </div>

                <button
                    class="contact-close-button"
                    onclick="closeExtraPages()"
                >
                    ✕ Back
                </button>

            </div>


            <div class="contact-grid">


                <!-- PROFILE CARD -->

                <div class="contact-card">

                    <h3>
                        👤 My Information
                    </h3>

                    <div class="contact-info">

                        <p>
                            <strong>Name:</strong><br>
                            Salisu Tanimu Atabs
                        </p>

                        <p>
                            <strong>Email:</strong><br>
                            tanimusalisuatabs@gmail.com
                        </p>

                        <p>
                            <strong>Contact:</strong><br>
                            08146044906
                        </p>

                        <p>
                            <strong>Project:</strong><br>
                            Smart Irrigation Robot
                        </p>

                    </div>

                </div>


                <!-- CONTACT FORM -->

                <div class="contact-card">

                    <h3>
                        💬 Send Me a Message
                    </h3>

                    <form
                        class="contact-form"
                        onsubmit="sendContactMessage(event)"
                    >

                        <label>
                            Your Name
                        </label>

                        <input
                            type="text"
                            id="visitorName"
                            placeholder="Enter your name"
                            required
                        >


                        <label>
                            Your Email
                        </label>

                        <input
                            type="email"
                            id="visitorEmail"
                            placeholder="Enter your email"
                            required
                        >


                        <label>
                            Subject
                        </label>

                        <input
                            type="text"
                            id="visitorSubject"
                            placeholder="Message subject"
                            required
                        >


                        <label>
                            Message
                        </label>

                        <textarea
                            id="visitorMessage"
                            placeholder="Type your message here..."
                            required
                        ></textarea>


                        <button
                            type="submit"
                            class="contact-send-button"
                        >
                            📤 Send Message
                        </button>


                        <div
                            id="contactMessageStatus"
                            class="contact-message-status"
                        ></div>

                    </form>

                </div>

            </div>

        </div>

    `;

    document.body.appendChild(contactPage);


    /* =====================================================
       CREATE MESSAGE INBOX
    ===================================================== */

    const inboxPage =
        document.createElement("div");

    inboxPage.id =
        "messageInboxPage";

    inboxPage.innerHTML = `

        <div class="message-inbox-container">

            <div class="message-inbox-header">

                <div>

                    <h2>
                        💬 Message Inbox
                    </h2>

                    <p style="
                        color:#9ad8b5;
                        margin-top:6px;
                    ">
                        Messages sent through your
                        Contact Me page appear here.
                    </p>

                </div>

                <div>

                    <span
                        id="messageCount"
                        class="message-count"
                    >
                        0 Messages
                    </span>

                    <button
                        class="contact-close-button"
                        onclick="closeExtraPages()"
                        style="margin-left:10px;"
                    >
                        ✕ Back
                    </button>

                </div>

            </div>


            <div id="messageList">

            </div>

        </div>

    `;

    document.body.appendChild(inboxPage);


    /* =====================================================
       CREATE PROFILE PAGE
    ===================================================== */

    const profilePage =
        document.createElement("div");

    profilePage.id =
        "smartProfilePage";

    profilePage.style.cssText = `

        display:none;

        position:fixed;

        left:245px;

        top:0;

        width:calc(100% - 245px);

        height:100vh;

        overflow-y:auto;

        background:
            linear-gradient(
                135deg,
                #071b12,
                #102c20
            );

        z-index:99992;

        padding:35px;

        box-sizing:border-box;

    `;

    profilePage.innerHTML = `

        <div style="
            max-width:700px;
            margin:auto;
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:25px;
            ">

                <h2 style="
                    color:white;
                    margin:0;
                ">
                    👤 My Profile
                </h2>

                <button
                    class="contact-close-button"
                    onclick="closeExtraPages()"
                >
                    ✕ Back
                </button>

            </div>


            <div class="contact-card"
                style="
                    text-align:center;
                "
            >

                <div style="
                    font-size:70px;
                    margin-bottom:15px;
                ">
                    👨‍💻
                </div>


                <h2 style="
                    color:#ffffff;
                ">
                    Salisu Tanimu Atabs
                </h2>


                <p style="
                    color:#7de2a8;
                    margin-top:10px;
                ">
                    Smart Irrigation Robot Developer
                </p>


                <div
                    class="contact-info"
                    style="
                        text-align:left;
                        margin-top:30px;
                    "
                >

                    <p>
                        <strong>📧 Email:</strong><br>
                        tanimusalisuatabs@gmail.com
                    </p>

                    <p>
                        <strong>📱 Contact:</strong><br>
                        08146044906
                    </p>

                    <p>
                        <strong>🤖 Project:</strong><br>
                        Smart Irrigation Robot
                    </p>

                    <p>
                        <strong>🌱 System:</strong><br>
                        Farm Monitoring and Automatic
                        Irrigation System
                    </p>

                </div>

            </div>

        </div>

    `;

    document.body.appendChild(profilePage);


    /* =====================================================
       MESSAGE FUNCTIONS
    ===================================================== */

    window.getSavedMessages =
        function() {

            try {

                return JSON.parse(
                    localStorage.getItem(
                        "smartIrrigationMessages"
                    )
                ) || [];

            }

            catch(error) {

                console.log(
                    "Message storage error:",
                    error
                );

                return [];

            }

        };


    window.saveMessages =
        function(messages) {

            localStorage.setItem(
                "smartIrrigationMessages",
                JSON.stringify(messages)
            );

        };


    /* =====================================================
       SEND MESSAGE
    ===================================================== */

    window.sendContactMessage =
        function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "visitorName"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "visitorEmail"
                    )
                    .value
                    .trim();


            const subject =
                document
                    .getElementById(
                        "visitorSubject"
                    )
                    .value
                    .trim();


            const message =
                document
                    .getElementById(
                        "visitorMessage"
                    )
                    .value
                    .trim();


            if (
                !name ||
                !email ||
                !subject ||
                !message
            ) {

                return;

            }


            const messages =
                getSavedMessages();


            const newMessage = {

                id:
                    Date.now(),

                name:
                    name,

                email:
                    email,

                subject:
                    subject,

                message:
                    message,

                date:
                    new Date().toLocaleString(),

                unread:
                    true

            };


            messages.unshift(
                newMessage
            );


            saveMessages(
                messages
            );


            document
                .getElementById(
                    "contactMessageStatus"
                )
                .textContent =
                "✅ Message sent successfully!";


            document
                .getElementById(
                    "contactMessageStatus"
                )
                .style.color =
                "#59c987";


            document
                .querySelector(
                    ".contact-form"
                )
                .reset();


            playSound(
                800,
                150
            );


            setTimeout(
                () => {

                    document
                        .getElementById(
                            "contactMessageStatus"
                        )
                        .textContent =
                        "";

                },
                3000
            );

        };


    /* =====================================================
       OPEN CONTACT PAGE
    ===================================================== */

    window.openContactPage =
        function() {

            closeExtraPages();

            document
                .getElementById(
                    "contactMessagesPage"
                )
                .style.display =
                "block";

            updateNavigationButtons(
                "contact"
            );

            playSound(
                700,
                100
            );

        };


    /* =====================================================
       OPEN MESSAGE INBOX
    ===================================================== */

    window.openMessageInbox =
        function() {

            closeExtraPages();

            document
                .getElementById(
                    "messageInboxPage"
                )
                .style.display =
                "block";

            renderMessages();

            updateNavigationButtons(
                "messages"
            );

            playSound(
                750,
                100
            );

        };


    /* =====================================================
       OPEN PROFILE
    ===================================================== */

    window.openMyProfile =
        function() {

            closeExtraPages();

            document
                .getElementById(
                    "smartProfilePage"
                )
                .style.display =
                "block";

            updateNavigationButtons(
                "profile"
            );

            playSound(
                700,
                100
            );

        };


    /* =====================================================
       CLOSE EXTRA PAGES
    ===================================================== */

    window.closeExtraPages =
        function() {

            const pages = [

                "contactMessagesPage",

                "messageInboxPage",

                "smartProfilePage"

            ];


            pages.forEach(
                pageId => {

                    const page =
                        document.getElementById(
                            pageId
                        );

                    if (page) {

                        page.style.display =
                            "none";

                    }

                }
            );

        };


    /* =====================================================
       DASHBOARD
    ===================================================== */

    window.smartNavDashboard =
        function() {

            closeExtraPages();

            updateNavigationButtons(
                "dashboard"
            );

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

            playSound(
                650,
                100
            );

        };


    /* =====================================================
       SECTION NAVIGATION
    ===================================================== */

    window.smartNavSection =
        function(sectionId) {

            closeExtraPages();

            const section =
                document.getElementById(
                    sectionId
                );


            if (section) {

                section.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

                playSound(
                    650,
                    100
                );

            }

        };


    /* =====================================================
       UPDATE ACTIVE NAV BUTTON
    ===================================================== */

    window.updateNavigationButtons =
        function(activeType) {

            document
                .querySelectorAll(
                    ".smart-nav-button"
                )
                .forEach(
                    button => {

                        button.classList
                            .remove(
                                "active"
                            );

                    }
                );


            const buttons =
                document
                    .querySelectorAll(
                        ".smart-nav-button"
                    );


            if (
                activeType ===
                "dashboard"
            ) {

                buttons[0]
                    ?.classList
                    .add("active");

            }


            if (
                activeType ===
                "profile"
            ) {

                buttons[8]
                    ?.classList
                    .add("active");

            }


            if (
                activeType ===
                "contact"
            ) {

                buttons[9]
                    ?.classList
                    .add("active");

            }


            if (
                activeType ===
                "messages"
            ) {

                buttons[10]
                    ?.classList
                    .add("active");

            }

        };


    /* =====================================================
       RENDER MESSAGES
    ===================================================== */

    window.renderMessages =
        function() {

            const messages =
                getSavedMessages();


            const list =
                document.getElementById(
                    "messageList"
                );


            const count =
                document.getElementById(
                    "messageCount"
                );


            if (!list) {
                return;
            }


            count.textContent =
                messages.length +
                (
                    messages.length === 1
                        ? " Message"
                        : " Messages"
                );


            if (
                messages.length === 0
            ) {

                list.innerHTML = `

                    <div
                        class="empty-messages"
                    >

                        💬 No messages yet.

                        <br><br>

                        Messages sent from
                        "Contact Me" will appear
                        here.

                    </div>

                `;

                return;

            }


            list.innerHTML =
                messages
                    .map(
                        message => `

                            <div
                                class="message-item
                                ${
                                    message.unread
                                        ? "unread"
                                        : ""
                                }"
                            >

                                <div
                                    class="message-item-header"
                                >

                                    <div>

                                        <div
                                            class="message-sender"
                                        >
                                            👤
                                            ${escapeMessageText(
                                                message.name
                                            )}
                                        </div>

                                        <div
                                            class="message-email"
                                        >
                                            📧
                                            ${escapeMessageText(
                                                message.email
                                            )}
                                        </div>

                                    </div>


                                    <div
                                        class="message-date"
                                    >
                                        ${
                                            escapeMessageText(
                                                message.date
                                            )
                                        }
                                    </div>

                                </div>


                                <div
                                    class="message-subject"
                                >
                                    ${
                                        escapeMessageText(
                                            message.subject
                                        )
                                    }
                                </div>


                                <div
                                    class="message-body"
                                >
                                    ${
                                        escapeMessageText(
                                            message.message
                                        )
                                    }
                                </div>


                                <button
                                    class="delete-message-button"
                                    onclick="
                                        deleteContactMessage(
                                            ${message.id}
                                        )
                                    "
                                >
                                    🗑️ Delete
                                </button>

                            </div>

                        `
                    )
                    .join("");

        };


    /* =====================================================
       DELETE MESSAGE
    ===================================================== */

    window.deleteContactMessage =
        function(id) {

            const messages =
                getSavedMessages()
                    .filter(
                        message =>
                            message.id !== id
                    );


            saveMessages(
                messages
            );


            renderMessages();

            playSound(
                350,
                120
            );

        };


    /* =====================================================
       SECURITY FOR DISPLAYED MESSAGE TEXT
    ===================================================== */

    window.escapeMessageText =
        function(value) {

            return String(value)
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        };


    /* =====================================================
       MESSAGE COUNT UPDATE
    ===================================================== */

    function updateMessageCount() {

        const messages =
            getSavedMessages();


        const count =
            document.getElementById(
                "messageCount"
            );


        if (count) {

            count.textContent =
                messages.length +
                (
                    messages.length === 1
                        ? " Message"
                        : " Messages"
                );

        }

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateMessageCount();

})();

