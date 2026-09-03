//canvas setup
const canvas =document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//accesing canva context 
const c = canvas.getContext("2d");

//player class for creting the enmy player and fragments
class BluePrint{
    constructor({
        position = {x,y},
        velocity = {x,y},
        radius ,
        color,
    }){
        this.position = {
            x : position.x,
            y : position.y,
        };
        this.velocity = {
            x : velocity.x,
            y : velocity.y,
        }
        this.radius = radius;
        this.color = color;
        this.alpha = 1;
        this.friction = 0.99;
    }

    //method to draw the object
    draw(){
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }    

    //to decease the color opacity
    aplhaDec(){
        this.alpha -= 0.01;
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
    }

    //to update the position 
    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}


//creating the array to store different item of game
let bullets = [];
let enemies = [];
let fragments = [];

//main body which player with play
const player = new BluePrint({
    position : {
        x:window.innerWidth/2,
        y:window.innerHeight/2,
    },
    velocity:{x:0,y:0},
    radius : 30,
    color : "Blue",
});

//function to create frag
function createFrag({fragposition = {x,y},color}){
    const radius = Math.random()*4;
    const fragvelocity = {
        x :(Math.random() - 0.5) * (Math.random()*8),
        y : (Math.random() - 0.5) * (Math.random()*8),
    }

    //creating fragments using BluePrint class
    const frag = new BluePrint({
        position : fragposition,
        velocity : fragvelocity,
        radius,
        color,
    })
    //storing created fragment in fragments array
    fragments.push(frag);
}

//enemy creation with the time interval of 5sec
function spawnEnemy(){
    setInterval(()=>{
        //enemy data for creation
        const enemyRadius = Math.random()*(60 - 30) + 30 ;
        let x = (Math.random()*window.innerWidth + 1);
        let y ;

        if( x>= window.innerWidth || x <= 0){
            y = (Math.random()*window.innerHeight + 1);
        }else{
            y = (Math.random() >= 0.5) ? window.innerHeight : 0;
        }

        const color = `hsl(${Math.random() * 360},50%,50%)`; //for creating random color 
        const angle = Math.atan2(player.position.y - y , player.position.x - x );

        const velocity = {
            x : Math.cos(angle),
            y : Math.sin(angle),
        }

        //creating enemy using our blue print class 
        const enemy = new BluePrint({
            position : {x,y},
            velocity,
            radius : enemyRadius,
            color,
        })

        //storing enemy in enemies array
        enemies.push(enemy);

    },5000);

};
//bullet creation 
addEventListener("click",(e)=> {
    const bulletAngle = Math.atan2(e.clientY - player.position.y , e.clientX - player.position.x);
    const velocity = {
        x : Math.cos(bulletAngle) *6,
        y : Math.sin(bulletAngle) *6,
    };
    const radius = 5;
    const color = "Red";
    const bullet = new BluePrint({
        position : {
            x:player.position.x,
            y:player.position.y,
        },
        velocity,
        radius,
        color,
    })

    bullets.push(bullet);
})
//main loop for rendering everthing
function anime(){
    const frame = requestAnimationFrame(anime);
    c.fillStyle = "rgba(0,0,0,0.5)"; //creating the drag effect behind the moving bullets and enmy and giving the backkground black color
    c.fillRect(0,0,window.innerWidth,window.innerHeight);

    //rendering the player
    player.position.x = window.innerWidth/2;
    player.position.y = window.innerHeight/2;

    //rendering and checking for collison between enemy and player
    enemies.forEach((enemy,enemyIndex)=>{
        enemy.update();

        //checking for collison between enemy and and player for ending game 
        if(Math.hypot((enemy.position.x - player.position.x),(enemy.position.y - player.position.y)) <= enemy.radius + player.radius){
            //game over
            //stopping all the randering
            cancelAnimationFrame(frame);
            onCollision();
        }

        bullets.forEach((bullet,bulletIndex) =>{

            //checking for collison between bullet and enemy
            if(Math.hypot((bullet.position.x - enemy.position.x),(bullet.position.y - enemy.position.y)) <= bullet.radius + enemy.radius){


                //enemy radius decreases on hitting the bullet
                //gsap is use for smooth transition as without it we get a blink like affect
                gsap.to(enemy,{
                    radius : enemy.radius - 10,
                });

                //removing the bullet on hitting the enemy
                //setTimeout is used make it look smooth 
                setTimeout(()=>{
                    bullets.splice(bulletIndex,1);
                },0)

                //here it is used the createFlag function which is defined above to create the small fragment on hitting the enemy
                for(let i =0 ; i<enemy.radius;i++){
                    createFrag({
                        fragposition : { x :enemy.position.x, y : enemy.position.y},
                        color : enemy.color,

                    })
                }                    


                //it is used to remove the enemy when they shrink below certain radius
                setTimeout(() =>{
                    if(enemy.radius <= 20){
                        enemies.splice(enemyIndex,1);

                        //setting the score when ever enemy is destroyed
                        score += 100;
                        scoreEl.innerHTML = score;
                    }
                },0);
            }
        })
    })

    //It is used to render each bullet on the screen 
    //index is used to remove the the bullets which are going out of screen to decreases the array size thus we have to render those bullets
    bullets.forEach((bullet,index)=>{

        bullet.update();
        if(bullet.position.x - bullet.radius >= window.innerWidth || bullet.position.x + bullet.radius <= 0
            || bullet.position.y - bullet.radius >= window.innerHeight || bullet.position.y + bullet.radius <= 0)
    {
            //remove the bulletl
            setTimeout(()=>{
                bullets.splice(index,1);
            },0);
        }
    })

    //this loop is used to render the fragment which we creted during collison
    fragments.forEach((frag,fragIndex)=>{


        if(frag.alpha <= 0){

            fragments.splice(fragIndex);
        }else{
            frag.update();
            frag.aplhaDec();
        }
    })

    player.draw();
}
