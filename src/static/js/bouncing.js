let x = 0;
let y = 0;
let afterimage_count = 5;
let circle_count = 15;
let circles = []

function setup(){
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style("pointer-events:none;cursor: not-allowed;");
  init_circles();
  // circles.push({x: 200, y:100, v_x:10, v_y:10, w:25});
  // circles.push({x: 800, y:400, v_x:5, v_y:5, w:40});
} 

function init_circles(){
  for (let i = 0; i < circle_count; i++){
    circles.push({
      x: random(100, width-100),
      y: random(100, height-100),
      v_x: random(-15.0, 15.0),
      v_y: random(-15.0, 15.0),
      w: random(15, 100),
      color: {r: random(0,255), g: random(0,255), b: random(0, 255)}
    });
  }
}

function draw(){
  background(0);
  // for (let i = afterimage_count; i > 0; i--){
  //   x=100*cos((frameCount - (i * 10))/20) + width/2;
  //   y=40*sin((frameCount - (i * 10))/10) + height/2;
  //   circle(x, y, 50);
  // }
  for (c of circles) {
    update_circle(c);
    draw_circle(c);
  }
}

// p = mv
// sp = m(sv)
// p = (m/s)(sv)
// p = (πr^2/s)(sv)
// r1 -> πr^2
// r2 -> r^2/s

const SCALING_FACTOR = 1.05;

function update_circle(c){
  // Update x
  pre_m = momentum(c);
  c.x += c.v_x;
  if (c.x + c.w > width) {
    pre_v = velocity(c);
    c.v_x *= -SCALING_FACTOR;
    post_v = velocity(c);
    c.w /= Math.sqrt(post_v/pre_v);
    c.x = width - c.w;
  } else if (c.x - c.w < 0){
    pre_v = velocity(c);
    c.v_x *= -SCALING_FACTOR;
    post_v = velocity(c);
    c.w /= Math.sqrt(post_v/pre_v);
    c.x = c.w;
  }
  // Update y
  c.y += c.v_y;
  if (c.y + c.w > height) {
    pre_v = velocity(c);
    c.v_y *= -SCALING_FACTOR;
    post_v = velocity(c);
    c.w /= Math.sqrt(post_v/pre_v);
    c.y = height - c.w;
  } else if (c.y - c.w < 0){
    pre_v = velocity(c);
    c.v_y *= -SCALING_FACTOR;
    post_v = velocity(c);
    c.w /= Math.sqrt(post_v/pre_v);
    c.y = c.w;
  }
  post_m = momentum(c);
  if (Math.abs(pre_m - post_m) > 0.000001){
    console.log("OH NO:", pre_m, post_m, pre_m-post_m);
  }
}

function mass(c){
  return c.w * c.w;
}

function velocity(c){
  return Math.sqrt(c.v_x * c.v_x + c.v_y * c.v_y);
}

function momentum(c){
  return mass(c) * velocity(c);
}

function draw_circle(c){
  fill(c.color.r, c.color.g, c.color.b);
  circle(c.x, c.y, c.w*2);
}
