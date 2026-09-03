const modelEl = document.querySelector("#modelEl")
const scoreEl = document.querySelector("#score");
const Startbtn = document.querySelector("#Startbtn");
const modelScore = document.querySelector("#modelScore");
let score = 0;
let isallowed = false;


function onCollision(){
    modelEl.style.display = "flex";
    modelScore.innerHTML = score; 
    Startbtn.innerHTML = "Restart";
    isallowed = false;
}

function init(){
     bullets = [];
     enemies = [];
     fragments = [];
    score = 0;
    scoreEl.innerHTML = score;
    modelScore.innerHTML = score;
    isallowed = true;
}

Startbtn.addEventListener("click",(e)=>{
    e.stopImmediatePropagation();
    init();
    anime();
    spawnEnemy();
    modelEl.style.display = "none";
})

