let balls = [];
let startStopFlag = null;

function Ball(canvasContainer, x, y, id, color, aoa, weight) {
    this.posX = x; // cx
    this.posY = y; // cy
    this.color = color;
    this.radius = weight;
    this.jumpSize = 2;
    this.canvasContainer = canvasContainer;
    this.id = id;
    this.aoa = aoa;
    this.weight = weight;
    this.mass = Math.PI*this.radius*this.radius;

    if (!this.aoa)
        this.aoa = Math.PI / 7;
    if (!this.weight)
        this.weight = 10;
    this.radius = this.weight;

    let thisobj = this;

    this.vx = Math.cos(thisobj.aoa) * thisobj.jumpSize; // velocity x
    this.vy = Math.sin(thisobj.aoa) * thisobj.jumpSize; // velocity y

    this.Draw = function () {
        let canvasContainer = thisobj.canvasContainer;
        let ball = document.getElementById(thisobj.id);

        if (!ball) {
            ball = document.createElement('div');
            ball.style.width = thisobj.radius*2+'px';
            ball.style.height = thisobj.radius*2+'px';
            ball.style.background = thisobj.color;
            ball.classList.add('ball');
            ball.setAttribute('id', thisobj.id);
            canvasContainer.appendChild(ball);
        }

        ball.style.left = thisobj.posX - thisobj.radius+'px';
        ball.style.top = thisobj.posY - thisobj.radius+'px';
    };

    this.Move = function () {
        let canvasContainer = thisobj.canvasContainer;

        thisobj.posX += thisobj.vx;
        thisobj.posY += thisobj.vy;

        if (canvasContainer.offsetWidth <= (thisobj.posX + thisobj.radius)) {
            thisobj.posX = canvasContainer.offsetWidth - thisobj.radius - 1;
            thisobj.aoa = Math.PI - thisobj.aoa;
            thisobj.vx = -thisobj.vx;
        }

        if (thisobj.posX < thisobj.radius) {
            thisobj.posX = thisobj.radius+1;
            thisobj.aoa = Math.PI - thisobj.aoa;
            thisobj.vx = -thisobj.vx;
        }

        if (canvasContainer.offsetHeight < (thisobj.posY + thisobj.radius)) {
            thisobj.posY = canvasContainer.offsetHeight - thisobj.radius - 1;
            thisobj.aoa = 2 * Math.PI - thisobj.aoa;
            thisobj.vy = -thisobj.vy;
        }

        if (thisobj.posY < thisobj.radius) {
            thisobj.posY = thisobj.radius+1;
            thisobj.aoa = 2 * Math.PI - thisobj.aoa;
            thisobj.vy = -thisobj.vy;
        }

        if (thisobj.aoa > 2 * Math.PI)
            thisobj.aoa = thisobj.aoa - 2 * Math.PI;
        if (thisobj.aoa < 0)
            thisobj.aoa = 2 * Math.PI + thisobj.aoa;

        thisobj.Draw();
    };
}

function CheckCollision(ball1, ball2) {
    let absx = Math.abs(parseFloat(ball2.posX) - parseFloat(ball1.posX));
    let absy = Math.abs(parseFloat(ball2.posY) - parseFloat(ball1.posY));

    let distance = (absx * absx) + (absy * absy);
    distance = Math.sqrt(distance);

    if (distance < (parseFloat(ball1.radius) + parseFloat(ball2.radius))) {
        return true;
    }
    return false;
}

function ProcessCollision(ball1, ball2) {

    if (ball2 <= ball1)
        return;
    if (ball1 >= (balls.length-1) || ball2 >= balls.length )
        return;

    ball1 = balls[ball1];
    ball2 = balls[ball2];

    if ( CheckCollision(ball1, ball2) ) {
        let m1=ball1.mass;// массы
        let m2=ball2.mass;

        let v1_x=ball1.vx;// скорости
        let v1_y=ball1.vy;
        let v2_x=ball2.vx;
        let v2_y=ball2.vy;

        let p1_x=ball1.posX;// точки центров шаров
        let p1_y=ball1.posY;
        let p2_x=ball2.posX;
        let p2_y=ball2.posY;
// нормаль к удару, касательная
        //let norm_x,norm_y,tang_x,tang_y;

// создаём и нормируем вектор из двух точек
        let pdpx = p2_x - p1_x;
        let pdpy = p2_y - p1_y;
        let Qpdpx = pdpx*pdpx;
        let Qpdpy = pdpy*pdpy;
        let Denom=Qpdpx+Qpdpy;

        let norm_x = (pdpx<0?-Qpdpx:Qpdpx) / Denom;
        let norm_y = (pdpy<0?-Qpdpy:Qpdpy) / Denom;

// находим вектор ортогональный заданному
        let tang_x = norm_y;
        let tang_y = -norm_x;

// проэкции скоростей на нормаль и касательную
        //let v1n_x,v2n_x,v1t_x,v2t_x;
        //let v1n_y,v2n_y,v1t_y,v2t_y;

// vect - что проэцируем, line - куда проэцируем
        let Denomnorm=norm_x*norm_x+norm_y*norm_y;
        let tmpnorm1=(v1_x*norm_x+v1_y*norm_y)/Denomnorm;

        let v1n_x =  norm_x*tmpnorm1;
        let v1n_y =  norm_y*tmpnorm1;

// vect - что проэцируем, line - куда проэцируем
        let tmpnorm2=(v2_x*norm_x+v2_y*norm_y)/Denomnorm;

        let v2n_x =  norm_x*tmpnorm2;
        let v2n_y =  norm_y*tmpnorm2;

        let Denomtang=tang_x*tang_x+tang_y*tang_y;
        let tmptang1=(v1_x*tang_x+v1_y*tang_y)/Denomtang;

        let v1t_x =  tang_x*tmptang1;
        let v1t_y =  tang_y*tmptang1;

// vect - что проэцируем, line - куда проэцируем
        let tmptang2=(v2_x*tang_x+v2_y*tang_y)/Denomtang;

        let v2t_x =  tang_x*tmptang2;
        let v2t_y =  tang_y*tmptang2;

        //let v1res_x,v2res_x;
        //let v1res_y,v2res_y;
// считаем импульсы
        let msm=(m1+m2);
        let mdm=m1-m2;
        let v1res_x=(2*m2*v2n_x+mdm*v1n_x)/msm;
        let v1res_y=(2*m2*v2n_y+mdm*v1n_y)/msm;
        let v2res_x=(2*m1*v1n_x-mdm*v2n_x)/msm;
        let v2res_y=(2*m1*v1n_y-mdm*v2n_y)/msm;

// сумма векторов проэкций = результат
        let vx1 =v1res_x+v1t_x;
        let vy1 =v1res_y+v1t_y;

        let vx2 =v2res_x+v2t_x;
        let vy2=v2res_y+v2t_y;


        ball1.vx = vx1;
        ball1.vy = vy1;
        ball2.vx = vx2;
        ball2.vy = vy2;

        while (CheckCollision(ball1, ball2)) {
            ball1.posX += ball1.vx;
            ball1.posY += ball1.vy;

            ball2.posX += ball2.vx;
            ball2.posY += ball2.vy;
        }
        ball1.Draw();
        ball2.Draw();
    }
}

export function Initialize(container, ballsAmount) {
    const canvasContainer = container;
    const colors = [
        '#1f77b4',
        '#aec7e8',
        '#ff7f0e',
        '#ffbb78',
        '#2ca02c',
        '#98df8a',
        '#d62728',
        '#ff9896',
        '#9467bd',
        '#c5b0d5',
        '#8c564b',
        '#c49c94',
        '#e377c2',
        '#f7b6d2',
        '#7f7f7f',
        '#c7c7c7',
        '#bcbd22',
        '#dbdb8d',
        '#17becf',
        '#9edae5',
        '#1f77b4',
        '#aec7e8',
        '#ff7f0e',
        '#ffbb78',
        '#2ca02c',
        '#98df8a'
    ];

    for (let i = 0; i < ballsAmount; ++i) {
        balls.push(new Ball(canvasContainer, 20*i, 20*i, 'n'+(i+1).toString(), colors[i], Math.PI / (i+1), (i%2) === 0 ? 10 : (10+i)));
    }

    for (let i = 0; i < balls.length; ++i) {
        balls[i].Draw();
    }

    return canvasContainer;
}

export function StartStopGame() {
    if (startStopFlag == null) {
        let timer = setTimeout(function tick() {
            for (let i = 0; i < balls.length; ++i) {
                balls[i].Move();
                for (let j = i + 1; j < balls.length; ++j) {
                    ProcessCollision(i, j);
                }
            }

            timer = setTimeout(tick, 15);

            if (startStopFlag == null) {
                clearTimeout(timer);
                return true;
            }
            else {
                return false;
            }

        }, 15);

        startStopFlag = 1;
    }
    else {
        startStopFlag = null;
    }
}

export function RemoveBalls(container) {
    let canvasContainer = container;

    while (canvasContainer.firstChild) {
        canvasContainer.removeChild(canvasContainer.firstChild);
    }

    startStopFlag = null;

    balls.splice(0, balls.length);
    Initialize(canvasContainer, 0);
}