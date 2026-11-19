(function(){
"use strict";
var canvas=document.getElementById("world"),notice=document.getElementById("notice");
var bootStatus=document.getElementById("boot-status");
var fatalError=document.getElementById("fatal-error");

function showFatal(message){
  if(fatalError){fatalError.textContent=message;fatalError.style.display="block";}
  if(bootStatus){bootStatus.textContent=message;}
  say(message);
}
window.onerror=function(message){
  showFatal("Error del juego: "+message);
};
var scene,camera,renderer,started=false,keys={},joy={x:0,y:0},joystickPointer=null;
var player={x:0,z:18,y:1.65,yaw:0,pitch:0,targetYaw:0,health:100,money:0,stamina:100,vertical:0,grounded:true};
var controls={};
var clock=new THREE.Clock();

function say(text){notice.textContent=text;clearTimeout(say.timer);say.timer=setTimeout(function(){notice.textContent="";},2200);}

function init(){
try{
if(!window.THREE||typeof THREE.WebGLRenderer!=="function")throw new Error("Librería Three.js no disponible");
if(!document.createElement("canvas").getContext("webgl")&&!document.createElement("canvas").getContext("experimental-webgl"))throw new Error("WebGL no está disponible en este dispositivo");
scene=new THREE.Scene();scene.background=new THREE.Color(0x77b7d8);scene.fog=new THREE.Fog(0x77b7d8,35,90);
camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.05,180);
try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:"high-performance"});}
catch(e){renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:false,powerPreference:"low-power"});}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=false;
scene.add(new THREE.HemisphereLight(0xfff4cf,0x26384a,.85));
var sun=new THREE.DirectionalLight(0xffffff,.8);sun.position.set(-20,35,12);scene.add(sun);
var ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0x3b5f3c,roughness:.9}));
ground.rotation.x=-Math.PI/2;scene.add(ground);
var roadMat=new THREE.MeshStandardMaterial({color:0x30343a,roughness:.95});
for(var i=-60;i<=60;i+=20){
var road1=new THREE.Mesh(new THREE.BoxGeometry(12,.03,180),roadMat);road1.position.set(i,.02,0);scene.add(road1);
var road2=new THREE.Mesh(new THREE.BoxGeometry(180,.03,12),roadMat);road2.position.set(0,.03,i);scene.add(road2);
}
var buildingMat=new THREE.MeshStandardMaterial({color:0x6a6f73,roughness:.7});
for(var bx=-70;bx<=70;bx+=20){
for(var bz=-70;bz<=70;bz+=20){
if(Math.abs(bx%40)<1&&Math.abs(bz%40)<1)continue;
var h=8+Math.abs((bx*bz)%18);
var building=new THREE.Mesh(new THREE.BoxGeometry(12,h,12),buildingMat);
building.position.set(bx,h/2,bz);scene.add(building);
}
}
var playerMesh=new THREE.Mesh(new THREE.CapsuleGeometry?new THREE.CapsuleGeometry(.45,1.1,4,8):new THREE.CylinderGeometry(.45,.45,1.1,8),new THREE.MeshStandardMaterial({color:0x2478a8}));
playerMesh.position.set(player.x,1.4,player.z);scene.add(playerMesh);player.mesh=playerMesh;
animate();return true;
}catch(error){showFatal("Error 3D: "+error.message);return false;}
}

var base=document.getElementById("joystick"),stick=document.getElementById("stick");
function updateJoy(e){var r=base.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),max=44,d=Math.hypot(dx,dy);if(d>max){dx=dx/d*max;dy=dy/d*max;}joy.x=dx/max;joy.y=dy/max;stick.style.transform="translate("+dx+"px,"+dy+"px)";}
base.addEventListener("pointerdown",function(e){joystickPointer=e.pointerId;base.setPointerCapture&&base.setPointerCapture(e.pointerId);updateJoy(e);});
base.addEventListener("pointermove",function(e){if(joystickPointer===e.pointerId)updateJoy(e);});
["pointerup","pointercancel","pointerleave"].forEach(function(t){base.addEventListener(t,function(e){if(joystickPointer===e.pointerId){joystickPointer=null;joy={x:0,y:0};stick.style.transform="translate(0,0)";}})});
window.addEventListener("keydown",function(e){keys[e.code]=true;});
window.addEventListener("keyup",function(e){keys[e.code]=false;});
window.addEventListener("contextmenu",function(e){e.preventEventDefault?e.preventEventDefault():e.preventDefault();});

var lookPointer=null,lastLook={x:0,y:0};
canvas.addEventListener("pointerdown",function(e){var r=base.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)return;lookPointer=e.pointerId;lastLook={x:e.clientX,y:e.clientY};});
canvas.addEventListener("pointermove",function(e){
  if(lookPointer===e.pointerId){
    player.targetYaw-=(e.clientX-lastLook.x)*.004;
    player.pitch=Math.max(-.55,Math.min(.55,player.pitch-(e.clientY-lastLook.y)*.003));
    lastLook={x:e.clientX,y:e.clientY};
  }
});
["pointerup","pointercancel"].forEach(function(t){canvas.addEventListener(t,function(e){if(lookPointer===e.pointerId)lookPointer=null;});});

["run","jump","shoot"].forEach(function(id){var el=document.getElementById(id);if(!el)return;el.addEventListener("pointerdown",function(e){e.preventEventDefault?e.preventEventDefault():e.preventDefault();if(id==="run")controls.run=true;if(id==="jump"&&player.grounded){player.vertical=5;player.grounded=false;}if(id==="shoot"){document.getElementById("weapon").textContent="Disparo";if(navigator.vibrate)navigator.vibrate(40);}});});
["run"].forEach(function(id){var el=document.getElementById(id);["pointerup","pointercancel","pointerleave"].forEach(function(t){el.addEventListener(t,function(){controls.run=false;});});});
document.getElementById("weaponButton").addEventListener("click",function(){document.getElementById("weapon").textContent=document.getElementById("weapon").textContent==="PUÑOS"?"BLÁSTER":"PUÑOS";});

if(bootStatus){
  bootStatus.textContent=window.THREE?"Motor Three.js r128 local cargado":"Motor Three.js no cargado";
}

function animate(){
requestAnimationFrame(animate);if(!started)return;
var dt=Math.min(clock.getDelta(),.08);
player.yaw+=(player.targetYaw-player.yaw)*Math.min(1,10*dt);
var forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-joy.y;
var turn=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joy.x;
if(turn!==0)player.targetYaw-=turn*1.15*dt;
var fx=-Math.sin(player.yaw),fz=-Math.cos(player.yaw),speed=(controls.run?7:4)*dt;
var dx=fx*forward*speed,dz=fz*forward*speed;
player.x+=dx;player.z+=dz;
if(!player.grounded){player.vertical-=11*dt;player.y+=player.vertical*dt;if(player.y<=1.65){player.y=1.65;player.vertical=0;player.grounded=true;}}
player.mesh.position.set(player.x,player.y-.25,player.z);
camera.position.set(player.x,player.y,player.z);camera.rotation.order="YXZ";camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;
document.getElementById("health").textContent=Math.ceil(player.health);
document.getElementById("money").textContent="$"+String(player.money).padStart(6,"0");
renderer.render(scene,camera);
}
document.getElementById("start").addEventListener("click",function(){
  var ok=init();
  if(ok){
    started=true;
    document.getElementById("menu").classList.add("hidden");
    say("Bienvenido a la ciudad");
  }
});
})();
