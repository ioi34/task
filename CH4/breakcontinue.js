var dan = 2;
outside : while(dan < 10)
{
    var num = 1;
    while(num < 10)
    {
        if(dan >= 6)
            break outside;
        else
            console.log(num * dan);
            num++;
    }
    dan++;
}