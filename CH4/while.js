var num = 5;
var i = 1;
while(i<10)
{
    console.log(num * i);
    i++;
}

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("단수를 입력하세요: ", function(dan){
    var k = 1;
    while(k<10)
    {
        console.log(dan * k);
        k++;
    }
    rl.close();
})