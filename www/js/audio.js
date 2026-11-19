(function(global){
"use strict";
var ctx=null,master=null,enabled=true;
function ensure(){if(!ctx){var C=window.AudioContext||window.webkitAudioContext;if(!C)return false;ctx=new C;master=ctx.createGain();master.gain.value=.25;master.connect(ctx.destination);}if(ctx.state==="suspended")ctx.resume();return true;}
global.CityAudio={
 unlock:ensure,
 setEnabled:function(v){enabled=!!v;if(master)master.gain.value=enabled?.25:0;},
 ambience:function(){ensure();},
 shot:function(){if(!ensure||!enabled)return;var o=ctx.createOscillator(),g=ctx.createGain();o.type="sawtooth";o.frequency.setValueAtTime(140,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(45,ctx.currentTime+.12);g.gain.setValueAtTime(.16,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.13);o.connect(g);g.connect(master);o.start();o.stop(ctx.currentTime+.14);},
 hit:function(){if(!ensure||!enabled)return;var o=ctx.createOscillator(),g=ctx.createGain();o.type="square";o.frequency.setValueAtTime(70,ctx.currentTime);g.gain.setValueAtTime(.18,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.14);o.connect(g);g.connect(master);o.start();o.stop(ctx.currentTime+.15);}
};
["pointerdown","click"].forEach(function(type){window.addEventListener(type,ensure,{once:true});});
})(window);
