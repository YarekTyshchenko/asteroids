(this.webpackJsonpasteroids=this.webpackJsonpasteroids||[]).push([[0],{31:function(e,t,n){e.exports=n(64)},36:function(e,t,n){},37:function(e,t,n){},61:function(e,t){},64:function(e,t,n){"use strict";n.r(t);var r=n(0),o=n.n(r),a=n(29),i=n.n(a),c=(n(36),n(37),n(4));function u(e){var t=r.useState(!1),n=Object(c.a)(t,2),o=n[0],a=n[1];return r.useEffect((function(){function t(t){t.key===e&&a(!0)}var n=function(t){t.key===e&&a(!1)};return window.addEventListener("keydown",t),window.addEventListener("keyup",n),function(){window.removeEventListener("keydown",t),window.removeEventListener("keyup",n)}}),[e]),o}var l=function(e){var t=e.socket,n=u("ArrowUp"),o=u("ArrowLeft"),a=u("ArrowRight"),i=u(" ");return r.useEffect((function(){n?t.emit("command","thrust-start"):t.emit("command","thrust-end")}),[t,n]),r.useEffect((function(){o?t.emit("command","turn-left"):t.emit("command","turn-end")}),[t,o]),r.useEffect((function(){a?t.emit("command","turn-right"):t.emit("command","turn-end")}),[t,a]),r.useEffect((function(){i&&t.emit("command","fire")}),[t,i]),r.createElement(r.Fragment,null)},s=n(1),f=n.n(s),m=function(e){var t=e.world,n=e.zoom,o=r.createRef();return function(e){var t=r.useRef(),n=r.useRef();r.useEffect((function(){return t.current=requestAnimationFrame((function r(o){if(void 0!==n.current){var a=o-n.current;e(a)}n.current=o,t.current=requestAnimationFrame(r)})),function(){t.current&&cancelAnimationFrame(t.current)}}),[t,n,e])}((function(e){var r=Date.now(),a=t.ships(r),i=t.shells(),c=o.current;if(c){!function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,n=e.clientWidth*t|0,r=e.clientHeight*t|0;(e.width!==n||e.height!==r)&&(e.width=n,e.height=r,console.log("W: ".concat(e.clientHeight," H: ").concat(e.clientWidth)))}(c);var u=c.getContext("2d"),l=d(u,{x:0,y:0},n);l.text("Delta: ".concat(e),10,10),l.text(t.debug(),10,20),a.forEach((function(e){l.ship(e)})),i.forEach((function(e){l.shell(e)}))}})),r.createElement(r.Fragment,null,r.createElement("canvas",{ref:o}),r.createElement("div",{className:"absolute"}))},d=function(e,t,n){var r=e.canvas.clientWidth,o=e.canvas.clientHeight,a=function(e){return{x:e.x/n-t.x/n+r/2,y:e.y/n-t.y/n+o/2}};e.font="8pt Mono",e.clearRect(0,0,r,o),e.fillStyle="black",e.fillRect(0,0,r,o);var i=function(t){e.moveTo(t+.5,0),e.lineTo(t+.5,o)},u=function(t){e.moveTo(0,t+.5),e.lineTo(r,t+.5)},l=[new f.a(10,0),new f.a(-5,-5),new f.a(-5,5)],s=[new f.a(-5,-2),new f.a(-10,0),new f.a(-5,2)];return{ship:function(t){e.fillStyle="white";var n=a(t.position),r=new f.a(n.x,n.y);e.lineWidth=1,e.strokeStyle="white";var o=l.map((function(e){return e.clone().rotate(t.bearing).add(new f.a(n.x,n.y))})),i=Object(c.a)(o,3),u=i[0],m=i[1],d=i[2];if(e.beginPath(),e.moveTo(u.x,u.y),e.lineTo(m.x,m.y),e.lineTo(d.x,d.y),e.lineTo(u.x,u.y),e.stroke(),t.thrust>0){var h=s.map((function(e){return e.clone().rotate(t.bearing).add(r)})),v=Object(c.a)(h,3),w=v[0],y=v[1],g=v[2];e.beginPath(),e.moveTo(w.x,w.y),e.lineTo(y.x,y.y),e.lineTo(g.x,g.y),e.stroke()}},shell:function(t){e.lineWidth=1,e.strokeStyle="red",e.beginPath();var n=a(t.position),r=new f.a(5,0).rotate(t.bearing).add(new f.a(n.x,n.y));e.moveTo(n.x,n.y),e.lineTo(r.x,r.y),e.stroke()},centreGraduation:function(){e.strokeStyle="#333333",e.lineWidth=1,e.beginPath(),e.moveTo(0,Math.floor(o/2)+.5),e.lineTo(r,Math.floor(o/2)+.5),e.moveTo(Math.floor(r/2)+.5,0),e.lineTo(Math.floor(r/2)+.5,o),e.stroke()},text:function(t,n,r){e.fillStyle="white",e.fillText(t,n,r)},grid:function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:100;e.strokeStyle="#555555",e.lineWidth=1,e.beginPath();for(var a=0;a<r+n;a+=n){var c=Math.floor(a+(r/2-t.x)%n);i(c)}for(var l=0;l<o+n;l+=n){var s=Math.floor(l+(o/2-t.y)%n);u(s)}e.stroke(),e.fillStyle="white";for(var f=0;f<r+n;f+=100){var m=f+(r/2-t.x)%n;e.fillText((Math.ceil((t.x-r/2+f)/n)*n).toFixed(0).toString(),m,100)}for(var d=0;d<o+n;d+=100){var h=d+(o/2-t.y)%n;e.fillText((Math.ceil((t.y-o/2+d)/n)*n).toFixed(0).toString(),5,h)}}}},h=n(30).connect("https://asteroids-3ukqg.ondigitalocean.app/"),v=r.createContext(h).Consumer,w=function(){var e=new Array,t=new Array,n=new Array,r=new Array,o="Debug",a=function(e){return String(Math.round(e)).padStart(3)};return{debug:function(){return o},ships:function(t){return e},shells:function(){return t},update:function(i){e=i.ships,t=i.shells;var c=Date.now()-i.time;n.unshift(i.simulationTime),n.length>60&&n.pop();var u=n.reduce((function(e,t){return e+t}),0)/60;r.unshift(i.sendTime),r.length>60&&r.pop();var l=r.reduce((function(e,t){return e+t}),0)/60;o="Delay: ".concat(a(c),"ms Simulation time: ").concat(a(i.simulationTime),"ms (").concat(a(u),"ms) ").concat(a(u/16.6*100),"%, Inter-frame delay ").concat(a(i.simulationFrameGap),"ms, sendTime: ").concat(a(i.sendTime),"ms (").concat(a(l),"ms) ").concat(a(l/16.6*100),"%, Inter-frame delay: ").concat(a(i.sendTimeFrameGap),"ms")}}}(),y=r.createContext(w),g=y.Consumer,p=function(){return r.createElement("div",{className:"App"},r.createElement("header",{className:"App-header"},r.createElement(g,null,(function(e){return r.createElement(r.Fragment,null,r.createElement(m,{world:e,zoom:1}),r.createElement(v,null,(function(e){return r.createElement(l,{socket:e})})))}))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(o.a.createElement((function(e){var t=e.children;return r.createElement(y.Provider,{value:w},r.createElement(v,null,(function(e){return e.on("update",(function(e){w.update(e)})),r.createElement(r.Fragment,null,t)})))}),null,o.a.createElement(p,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))}},[[31,1,2]]]);
//# sourceMappingURL=main.a7b1ea01.chunk.js.map