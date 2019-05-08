/**
 *
 * 洗牌工具
 * @param { Array } arr
 * @returns
 */
function KdShuffle(arr){
	let len = arr.length,
		i,temp;
	while (len){
		i = Math.floor(Math.random() * len--);
		temp = arr[i];
		arr[i] = arr[len];
		arr[len] = temp;
	}
	return arr;
}

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


var data = [1,2,3,4,5,6];
// 九宫格补全：
function getGameDataLength(n) {
    if ((n-4)%4 === 0 && n !== 4) return n
    return n + 4 - (n-4)%4
}

// 获取游戏数据长度
var gameDataLength = getGameDataLength(data.length);

console.log('gameDataLength', gameDataLength);

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
        dom = `${dom}<div style="position:absolute; width:${step}%; height:${step}%; background-color: green; left: ${X}%; top: ${Y}%">${element}</div>`;

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
    
    var timer = null,
        iNow = -1,
        circle = 1, // 至少要转几圈
        iSpeed = 300,
        count = 0, // 转了多少次
        iLast = gameDataLength; // 最后一次转圈圈

        (function run(){

            // 前3个加速
            if(count > 2){ iSpeed = 100; }

            // 后3个减速
            if(iLast < 2){ iSpeed = 300; }

            iNow++;
            count++;

            if(iNow >= gameDataLength){ iNow = 0; circle--; }
            
            for (let index = 0; index < itemsDomList.length; index++) {
                const element = itemsDomList[index];
                element.classList.remove('active');
            }
            itemsDomList[iNow].classList.add('active');

            timer = setTimeout(run, iSpeed);

            // 得到结果
            if(getPrizeInd !== -1 && circle <= 0 && iNow == getPrizeInd){

                // 为了最后一圈减速，再跑一圈
                iLast--;
                if(iLast == 0){
                    clearTimeout(timer);
                    console.log(`中奖了！${prize}`);
                }
            }
        })();
}