let balls = [];
let startStopFlag = null;

function Ball(canvasContainer, x, y, id, color, aoa, weight) {
    this.posX = x%(400-2*weight)+weight; // cx
    this.posY = y%(960-2*weight)+weight; // cy
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

    console.log(`Ball #${id} =`,this);

    this.Draw = function () {
        let canvasContainer = thisobj.canvasContainer;
        let ball = document.getElementById(thisobj.id);

        if (!ball) {
            ball = document.createElement('div');
            ball.style.width = thisobj.radius*2+'px';
            ball.style.height = thisobj.radius*2+'px';
            ball.style.background = ((c)=>{
                const r = parseInt(c.slice(1,3), 16);
                const g = parseInt(c.slice(3,5), 16);
                const b = parseInt(c.slice(5,7), 16);
                const [h,s,l] = rgbToHsl(r,g,b);
                const res = `hsla(${h*360},${s*1.8*100}%,${l/2*100}%,${.5})`;
                console.log('ball.style.background =', res);
                return res;
            })(thisobj.color);
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
    //distance = Math.sqrt(distance);
    let qradius =  (parseFloat(ball1.radius) + parseFloat(ball2.radius));
    qradius*=qradius;
    if (distance - qradius < -qradius*0.30) {
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

        // while (CheckCollision(ball1, ball2)) {
        //     ball1.posX += ball1.vx;
        //     ball1.posY += ball1.vy;
        //
        //     ball2.posX += ball2.vx;
        //     ball2.posY += ball2.vy;
        // }
        // ball1.Draw();
        // ball2.Draw();
    }
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: alert('NLO atakked !!!!!');
        }

        h /= 6;
    }

    return [ h, s, l ];
}

export function Initialize(container, ballsAmount) {
    const canvasContainer = container;
    const colors = [
        '#1f77b480',
        '#aec7e880',
        '#ff7f0e80',
        '#ffbb7880',
        '#2ca02c80',
        '#98df8a80',
        '#d6272880',
        '#ff989680',
        '#9467bd80',
        '#c5b0d580',
        '#8c564b80',
        '#c49c9480',
        '#e377c280',
        '#f7b6d280',
        '#7f7f7f80',
        '#c7c7c780',
        '#bcbd2280',
        '#dbdb8d80',
        '#17becf80',
        '#9edae580',
        '#1f77b480',
        '#aec7e880',
        '#ff7f0e80',
        '#ffbb7880',
        '#2ca02c80',
        '#98df8a80'
    ];

    for (let i = 0; i < ballsAmount; ++i) {
        balls.push(new Ball(canvasContainer, 35*i, 35*i, 'n'+(i+1).toString(), colors[i], Math.PI/13 * (i+1), (i%2) === 0 ? 15 : (15+i*2)));
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
            balls.forEach(v=>v.Draw());
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