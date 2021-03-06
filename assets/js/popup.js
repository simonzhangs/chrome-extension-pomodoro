//元素获取
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const endBtn = document.getElementById("end-btn");
const countdownTimer = document.getElementById("countdown");

const audio = document.getElementById("audio");
//全局唯一的定时器
let timer = null;

let minutes, seconds;
let pause;
let pomodoro = "pomodoro";

//两端通信 防抖
// let clickFlag = false;

//番茄钟按钮-绑定事件
document.addEventListener("click", (e) => {
    if (!e.target.matches(".button")) return;

    // reset when pomodoro button selected
    pause = true;
    seconds = 60;
    startBtn.innerHTML = "开始";

    chrome.storage.sync.set({ pause: pause, seconds: seconds }, function() {
        if (!chrome.runtime.error) {
            alert("初始化pause、seconds");
        }
    });

    // 定时器初始化
    if (e.target.matches("#pomodoro-btn")) {
        countdownTimer.innerHTML = "25:00";
        pomodoro = "pomodoro";
        minutes = 25;
        chrome.storage.sync.set({ minutes: minutes, countdownTimer: "25:00" },
            function() {
                if (!chrome.runtime.error) {
                    alert("added target pomodoro!");
                }
            }
        );
    }
});

// 开始按钮-绑定事件
startBtn.addEventListener("click", () => {
    // countdown(); 在后台运行，需要取出状态
    debounce(start(), 100);
});

function start() {
    chrome.storage.sync.get("pomoData", ({ pomoData }) => {
        const { minutes, seconds, status } = pomoData;

        chrome.runtime.sendMessage({
                status: "start",
                senderId: "pomo",
                content: {
                    minutes,
                    seconds,
                },
            },
            (response) => {
                console.log(response);

                startBtn.style.display = "none";
                endBtn.style.display = "block";
                getTimer();
            }
        );
    });
}

endBtn.addEventListener("click", () => {
    setTimeout(end, 200);
});

function end() {
    chrome.runtime.sendMessage({
            status: "paused",
            senderId: "pomo",
        },
        (response) => {
            console.log(response);

            startBtn.style.display = "block";
            endBtn.style.display = "none";
            clearTimer();
        }
    );
}

function getTimer() {
    clearTimer();
    timer = setInterval(() => {
        chrome.storage.sync.get("pomoData", ({ pomoData }) => {
            // console.log("pomodata****",pomoData)
            // const{minutes,seconds,countdownTimer} = pomoData;
            countdownTimer.innerHTML = pomoData.countdownTimer;

            //更新后倒计时判断，如果结束则重新初始化界面
            if (pomoData.countdownTimer == "00:00") {

                audio.play();
                //不能放在页面上，要在后台进行
                chrome.runtime.sendMessage({
                        status: "playend",
                        senderId: "pomo",
                    },
                    (response) => {
                        console.log(response, "**************下面");
                        countdownTimer.innerHTML = "25:00";

                        startBtn.style.display = "block";
                        endBtn.style.display = "none";
                        clearTimer();
                    }
                );

            }
        });
    }, 200);

}

function clearTimer() {
    clearInterval(timer);
}

/*
 * fn [function] 需要防抖的函数
 * delay [number] 毫秒，防抖期限值
 */
function debounce(fn, delay) {
    let timer = null; //借助闭包
    return function() {
        if (timer) {
            clearTimeout(timer); //进入该分支语句，说明当前正在一个计时过程中，并且又触发了相同事件。所以要取消当前的计时，重新开始计时
            timer = setTimeout(fn, delay);
        } else {
            timer = setTimeout(fn, delay); // 进入该分支说明当前并没有在计时，那么就开始一个计时
        }
    };
}

// 重置按钮-绑定事件
resetBtn.addEventListener("click", () => {
    setTimeout(() => {
        chrome.runtime.sendMessage({
                status: "reset",
                senderId: "pomo",
            },
            (response) => {
                // console.log(response);
                countdownTimer.innerHTML = "25:00";

                startBtn.style.display = "block";
                endBtn.style.display = "none";
                clearTimer();
            }
        );
    }, 100);
});

//页面反复打开时页面初始化
chrome.storage.sync.get("pomoData", ({ pomoData }) => {
    console.log(pomoData);
    const { status } = pomoData;

    if (status === "start") {
        startBtn.style.display = "none";
        endBtn.style.display = "block";
        getTimer();
    } else if (status === "paused") {
        startBtn.style.display = "block";
        endBtn.style.display = "none";
        chrome.storage.sync.get("pomoData", ({ pomoData }) => {
            countdownTimer.innerHTML = pomoData.countdownTimer;
        });
    } else if (status === "init") {
        chrome.runtime.sendMessage({
            status: "init",
            senderId: "pomo",
        });
        countdownTimer.innerHTML = "25:00";
    } else if (status === 'playend') {
        countdownTimer.innerHTML = "25:00";
    }
});

// 轮播图
let photos = ["../../images/pomo_green.jpeg",
    "../../images/pomo_sky.png",
    "../../images/pomo_waterfall.jpg",
    "../../images/pomo_ocean.jpg",
    "../../images/pomo_light.jpeg",
    "../../images/pomo_leaf.jpeg",
    "../../images/pomo_forest.jpeg",
    "../../images/pomo_fire.jpeg",
    "../../images/pomo_crystal.jpg"
]

let len = photos.length;
// console.log(len);
let index = 0;
document.getElementById('right').addEventListener("click", function() {
    change_r();
});
document.getElementById('left').addEventListener("click", function() {
    change_l();
});

function change_l() {
    index--;
    if (index < 0) {
        index = len - 1;
    }
    change(index);
}

function change_r() {
    index++;
    if (index == len) {
        index = 0;
    }
    change(index);
}

function change(n) {
    document.body.style = "background: url(" + photos[n] + ") no-repeat; background-size: cover; background-position: center;";
}

let t = setInterval(function() {
    change_r();
}, 40000);
