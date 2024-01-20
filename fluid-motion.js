const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set the number of particles based on the device type
const isMobile = window.innerWidth <=768; // You can adjust this threshold as needed
const numberOfParticles = isMobile ? 100 : 500;

const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(1,'white');
gradient.addColorStop(0.5,'gold');
gradient.addColorStop(1,'darkorange');
ctx.fillStyle = gradient;
ctx.strokeStyle = 'white';





class Particle{
    constructor(effect){
        this.effect = effect;
        this.radius = Math.floor(Math.random() * 15+1);
        this.x = this.radius + Math.random() * (this.effect.width - this.radius *2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius *2);
        this.vx = Math.random()*4-2;
        this.vy = Math.random()*4-2;
        this.pushX = 0;
        this.pushY = 0;
        this.friction = 0.95;
        this.hue = 0;
        
    }
    draw(context){
        // context.fillStyle = 'hsl('+this.x*0.5+',100%,50%)';
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x,this.y,this.radius,0,Math.PI*2);
        
        context.fill();
    }
    update(){
        if(this.effect.mouse.pressed){
            const dx = this.x - this.effect.mouse.x;
            const dy = this.y - this.effect.mouse.y;
            const distance = Math.hypot(dx,dy);
            const force = (this.effect.mouse.radius/distance);
            
            if(distance < this.effect.mouse.radius){
                const angle = Math.atan2(dy,dx);
                this.pushX += Math.cos(angle) * force;
                this.pushY += Math.sin(angle) * force;
                
            }
            
            this.hue = this.x;
            this.color = 'hsl('+this.hue+', 100%,50%)';
        }
        this.x += (this.pushX *= this.friction) + this.vx;
        

        if(this.x > this.effect.width-this.radius || this.x < this.radius) this.vx *=-1;
        
        this.y += (this.pushY *= this.friction) + this.vy;
        if(this.y > this.effect.height-this.radius || this.y < this.radius) this.vy *=-1;
        this.x += this.vx;
        this.y += this.vy;

    }
    reset(){
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
    }
}

class Effect{
    constructor(canvas,context){
        this.canvas = canvas;
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = numberOfParticles;
        this.createParticles();
        if(isMobile){
            this.mouse = {
            x : 0,
            y: 0,
            pressed: false,
            radius: 120
        }
        }else{
            this.mouse = {
            x : 0,
            y: 0,
            pressed: false,
            radius: 150
        }
        }
        

        window.addEventListener('resize', e =>{
            this.resize(e.target.window.innerWidth, e.target.window.innerHeight);
        });

        window.addEventListener('mousemove', e=>{
            if(this.mouse.pressed){
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            }

        });
        window.addEventListener('mousedown', e=>{
            this.mouse.pressed = true;
            this.mouse.x = e.x;
            this.mouse.y = e.y;

        });

        window.addEventListener('mouseover',e=>{
            this.mouse.pressed = true;
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        })
    }
    createParticles(){
        for(let i = 0;i<this.numberOfParticles;i++){
            this.particles.push(new Particle(this));
        }
    }
    handleParticle(context){
        this.connectParticles(context);
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
    }
    connectParticles(context){
        const maxDistance = 150;
        for(let a = 0;a<this.particles.length;a++){
            for(let b = a;b<this.particles.length;b++){
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y;

                const distance = Math.hypot(dx,dy);
                if(distance < maxDistance){
                    context.save();
                    const opacity =1- (distance/maxDistance);
                    context.globalAlpha = opacity;
                    context.beginPath();
                    context.moveTo(this.particles[a].x, this.particles[a].y);
                    context.lineTo(this.particles[b].x, this.particles[b].y);
                    context.stroke();
                    context.restore();
                }
            }
        }
    }
    resize(width,height){
        this.canvas.width = width;
        this.canvas.height  = height;
        this.width = width;
        this.height = height;
        this.context.fillStyle = 'blue';
       
        const gradient = this.context.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(1,'white');
        gradient.addColorStop(0.5,'gold');
        gradient.addColorStop(1,'orangered');
        this.context.fillStyle = gradient;
        this.context.strokeStyle = 'white';
        this.particles.forEach(particle => {
            particle.reset();
        });
    }
}
const effect = new Effect(canvas,ctx);

function animation(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    effect.handleParticle(ctx);
    
    requestAnimationFrame(animation);
}
window.addEventListener('resize', () => {
    effect.resize(window.innerWidth, window.innerHeight);
});
animation();