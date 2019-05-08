function getFullNum(num){
    //处理非数字
    if(isNaN(num)){return num};
    
    //处理不需要转换的数字
    var str = num.toString();
    
    if(!/e/i.test(str)){
        const strArr = str.split('.');
        if (strArr[1]) {
            strArr[1] = strArr[1].slice(0, 3);
        }
        return parseFloat(strArr.join('.'));
    };

    return (num).toFixed(18).replace(/\.?0+$/, "");
}


var data = [1,2,3,4,5,6,7,8];
// 九宫格补全：
function getGameDataLength(n) {
    if ((n-4)%4 === 0 && n !== 4) return n
    return n + 4 - (n-4)%4
}

// 获取游戏数据长度
var gameDataLength = getGameDataLength(data.length);

console.log('gameDataLength11', gameDataLength);

// 补充游戏数据并洗牌
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

// 重组游戏数据
var newGameData = supplementingData(data, gameDataLength);

// 游戏布局
function GameLayout(prizes) {
    var sideLength = getFullNum((prizes.length-4) / 4 + 2);
    var step = getFullNum(100/sideLength);
    var maxRate = getFullNum((sideLength - 1) * step);
    const loatingThreshold = 0.3;
    let X = 0, Y = 0, dom='';
    stepGrown = 1;

    const startDom = `<div id="start" style="background-color:rgba(255, 0, 0, 0.5); width:33.333%; height:33.333%; position: absolute; top: 50%; left: 50%; margin-left:-16.665%; margin-top:-16.665%">&nbsp;</div>`

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
    document.getElementById('wrap').innerHTML = `<div id="gameitems">${dom}</div>${startDom}`;
    document.getElementById('start').onclick = lottery;
}

function lottery(){
    console.log('开始抽奖');
    // 这个setTimeout是假设的请求
    setTimeout(function(){
        var iEnd = Math.floor(Math.random() * gameDataLength);
        renderLottery(newGameData[iEnd]);
    }, 10);
}

GameLayout(newGameData);

// 开始转动
function renderLottery(prize, oMain, fn){
    
    var getPrizeInd = 0;
    for (let index = 0; index < newGameData.length; index++) {
        const element = newGameData[index];
        if (element === prize) {
            getPrizeInd = index;
            break;
        }
    } 

    var itemsDomList = document.getElementById('gameitems').children;
    
    var timer = null;
        var pointHistoryLocation = 0; // 历史指针位置
        var pointerLocation = 0; // 指针位置
        var defaultCircle = 1; // 默认几圈
        var pathLength = defaultCircle * gameDataLength + getPrizeInd; // 算出路程
        var buffer = 5;
        (function fun(){
            for (let index = 0; index < itemsDomList.length; index++) {
                const element = itemsDomList[index];
                element.classList.remove('active');
            }
            console.log('pointerLocation', pointerLocation);
            itemsDomList[pointerLocation%gameDataLength].classList.add('active');
            timer = setTimeout(function(){
                pointerLocation++;
                if(pointerLocation < 10 && buffer !== 0){
                    buffer--;
                }
                if(pointerLocation > (pathLength-10)){
                    buffer++;
                }
                if(pointerLocation <= pathLength){
                    fun();
                }else{
                    pointerLocation = 0;
                    buffer = 0;
                    pointHistoryLocation = newGameData.length - getPrizeInd;
                    console.log(`恭喜您！${prize}`, `创建历史位置 ${pointHistoryLocation}`)
                }
            },100+buffer*50);
        })();
}