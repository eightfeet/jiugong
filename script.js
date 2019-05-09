// 奖品假设
var data = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20
];

// 数值处理工具
function getFullNum(num) {
  //处理非数字
  if (isNaN(num)) {
    return num;
  }

  //处理不需要转换的数字
  var str = num.toString();

  if (!/e/i.test(str)) {
    const strArr = str.split(".");
    if (strArr[1]) {
      strArr[1] = strArr[1].slice(0, 3);
    }
    return parseFloat(strArr.join("."));
  }

  return num.toFixed(18).replace(/\.?0+$/, "");
}

// 九宫格补全：
function getGameDataLength(n) {
  if ((n - 4) % 4 === 0 && n !== 4) return n;
  return n + 4 - ((n - 4) % 4);
}

// 获取游戏数据长度
var gameDataLength = getGameDataLength(data.length);

// 补充并重组游戏数据
function supplementingData(data, gameDataLength) {
  var oprationData = [];
  for (var index = 0; index < 10; index++) {
    if (oprationData.length < gameDataLength) {
      oprationData = oprationData.concat(data);
    }
  }
  oprationData = oprationData.slice(0, gameDataLength);
  return oprationData;
}

// 获取游戏数据
var newGameData = supplementingData(data, gameDataLength);

// 游戏布局
function GameLayout(prizes) {
  var sideLength = getFullNum((prizes.length - 4) / 4 + 2);
  var step = getFullNum(100 / sideLength);
  var maxRate = getFullNum((sideLength - 1) * step);
  const loatingThreshold = 0.3;
  let X = 0,
    Y = 0,
    dom = "";
  stepGrown = 1;

  const startDom = `<div id="start" style="background-color:rgba(255, 0, 0, 0.5); width:33.333%; height:33.333%; position: absolute; top: 50%; left: 50%; margin-left:-16.665%; margin-top:-16.665%">&nbsp;</div>`;

  for (let index = 0; index < prizes.length; index++) {
    const element = prizes[index];
    dom = `${dom}<div style="position:absolute; width:${step}%; height:${step}%; box-sizing: border-box; background-color: green; left: ${X}%; top: ${Y}%">${element}</div>`;

    if (stepGrown === 1) {
      X = X + step;
      if (X >= maxRate + loatingThreshold) {
        X = maxRate;
        Y = 0;
        stepGrown = 2;
      }
    }

    if (stepGrown === 2) {
      Y = Y + step;
      if (Y >= maxRate + loatingThreshold) {
        X = maxRate;
        Y = 0;
        stepGrown = 3;
      }
    }

    if (stepGrown === 3) {
      Y = maxRate;
      X = X - step;
      if (X <= 0 - loatingThreshold) {
        X = 0;
        Y = maxRate;
        stepGrown = 4;
      }
    }

    if (stepGrown === 4) {
      Y = Y - step;
      if (Y === step) {
        stepGrown = 1;
      }
    }
  }
  document.getElementById(
    "wrap"
  ).innerHTML = `<div id="gameitems">${dom}</div>${startDom}`;
  document.getElementById("start").onclick = function() {
    lottery()
      .then(res => renderHistory(res))
      .then(res => renderLottery(res))
      .catch(() => {
        isLottery = false;
      });
  };
}

// 抽奖
function lottery() {
  return new Promise((resolve, reject) => {
    if (isLottery) {
      console.error("当前正在抽奖");
      return;
    }
    isLottery = true;
    
    // 这个setTimeout是假设的请求
    setTimeout(function() {
      var iEnd = Math.floor(Math.random() * gameDataLength);
      resolve(newGameData[iEnd]);
    }, 10);
  });
}

// 历史位置
var historyPrizeInd = 0;
// 缓冲阈值
var buffer = 5;
// 正在抽奖
var isLottery = false;

// 游戏布局
GameLayout(newGameData);

// 渲染遗留数据
function renderHistory(data) {
  var itemsDomList = document.getElementById("gameitems").children;
  var surplus = historyPrizeInd;
  return new Promise(resolve => {
    if (surplus <= 0) {
      return resolve(data);
    }
    var timer = null;
    (function run() {
      for (let index = 0; index < gameDataLength; index++) {
        const element = itemsDomList[index];
        element.classList.remove("active");
      }
      itemsDomList[surplus].classList.add("active");
      surplus++;
      timer = setTimeout(function() {
        if (surplus < gameDataLength) {
          run();
        } else {
          resolve(data);
        }
      }, 100 + buffer * 50);
    })();
  });
}

// 渲染抽奖转动
function renderLottery(prize) {
  return new Promise(resolve => {
    var getPrizeInd = 0;
    for (let index = 0; index < newGameData.length; index++) {
      const element = newGameData[index];
      if (element === prize) {
        getPrizeInd = index;
        break;
      }
    }

    var itemsDomList = document.getElementById("gameitems").children;

    var timer = null;
    // 指针位置
    var pointerLocation = 0;
    // 默认几圈
    var defaultCircle = 3;
    // 算出路程
    var pathLength = defaultCircle * gameDataLength + getPrizeInd;

    (function fun() {
      for (let index = 0; index < itemsDomList.length; index++) {
        const element = itemsDomList[index];
        element.classList.remove("active");
      }
      itemsDomList[pointerLocation % gameDataLength].classList.add("active");
      timer = setTimeout(function() {
        pointerLocation++;
        if (pointerLocation < 10 && buffer !== 0) {
          buffer--;
        }
        if (pointerLocation > pathLength - 10) {
          buffer++;
        }
        if (pointerLocation <= pathLength) {
          fun();
        } else {
          pointerLocation = 0;
          buffer = 0;
          resolve();
          historyPrizeInd = getPrizeInd;
          console.log(`中奖${prize}`, `位置${getPrizeInd}`);
          isLottery = false;
        }
      }, 100 + buffer * 50);
    })();
  });
}
