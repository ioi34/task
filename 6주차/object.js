// 객체
let dic1 = {
    boy: "소년",
    girl: "소녀",
    friend: "친구"
};

let dic2 = {
    boy: "남",
    girl: "여",
    friend: "우정"
}

let list = [dic1, dic2];

console.log(list);
console.log(dic1.boy);
console.log(dic1.girl);
console.log(dic1.friend);

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("찾을 단어를 입력하세요: ", function (key){
    let word =key;
    console.log(dic1[word]);

    rl.close;
});