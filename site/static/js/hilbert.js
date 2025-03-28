let curve;
let depth;


function setup(){
  let wh = Math.min(windowHeight, windowWidth);
  c = document.getElementById('target');
  canvas = createCanvas(wh, wh, c);
  canvas.addClass("center");
  canvas.style("pointer-events:none;cursor: not-allowed; ");
  curve = make_curve('a', 0, 0, wh, wh);
  depth = 1;
  noLoop();
} 

let hue = 0;
let max_lines;

function inc_color(){
  hue += 255.0/max_lines;
  if (hue > 255) {
    hue -= 255;
  }
  stroke(hue, 100, 50);
}

function curve_size(c){
  if (c.children.length > 0){
    let children_len = 0;
    for (let child of c.children){
      children_len += curve_size(child);
    }
    return children_len + 3 + 3;
    //                  self  connectors
  }
  return 3;
}

function keyPressed(){
  if (keyCode === 32) {
    advance_curve(curve);
    depth += 1;
    redraw();
  } else if (keyCode === 16){
    depth -= 1;
    if (depth == 0){
      depth = 1;
    }

    let wh = Math.min(windowHeight, windowWidth);
    curve = make_curve('a', 0, 0, wh, wh);
    for (let i = 1; i < depth; i++){
      advance_curve(curve);
    }
    redraw();
  }
}

function mouseClicked(event) {
  if (event.detail > 1) {
    return;
  }
  advance_curve(curve);
  depth += 1;
  redraw();
}

function doubleClicked(){
  depth -= 2;
  if (depth == 0){
    depth = 1;
  }
  let wh = Math.min(windowHeight, windowWidth);
  curve = make_curve('a', 0, 0, wh, wh);
  for (let i = 1; i < depth; i++){
    advance_curve(curve);
  }
  redraw();
}

function draw(){
  colorMode(RGB);
  background(0);
  colorMode(HSL);
  max_lines = curve_size(curve);
  draw_curve(curve);
}

function draw_curve(c){
  // for (conn of c.connectors){
  //   inc_color();
  //   line(conn.x1, conn.y1, conn.x2, conn.y2);
  // }
  if (!c.leaf){
    let i = 0;
    for (child of c.children){
      draw_curve(child);
      let conn = c.connectors[i];
      if (i === 3) {
        continue;
      }
      inc_color();
      line(conn.x1, conn.y1, conn.x2, conn.y2);
      i += 1;
    }
    return;
  }
  x1 = c.x + c.width/4;
  y1 = c.y + c.height/4;
  x2 = c.x + 3*c.width/4;
  y2 = y1;
  x3 = x1;
  y3 = c.y + 3*c.height/4;
  x4 = x2;
  y4 = y3;
  if (c.type == 'a'){
    inc_color();
    line(x3, y3, x1, y1);
    inc_color();
    line(x1, y1, x2, y2);
    inc_color();
    line(x2, y2, x4, y4);
  }  
  else if (c.type == 'b'){
    inc_color();
    line(x2, y2, x1, y1);
    inc_color();
    line(x1, y1, x3, y3);
    inc_color();
    line(x3, y3, x4, y4);
  }  
  else if (c.type == 'c'){
    inc_color();
    line(x2, y2, x4, y4);
    inc_color();
    line(x4, y4, x3, y3);
    inc_color();
    line(x3, y3, x1, y1);
  }  
  else if (c.type == 'd'){
    inc_color();
    line(x3, y3, x4, y4);
    inc_color();
    line(x4, y4, x2, y2);
    inc_color();
    line(x2, y2, x1, y1);
  }  
}

function advance_curve(c){
  if (!c.leaf){
    for (child of c.children){
      advance_curve(child);
    }
    update_ends(c);
    make_connectors(c);
    return;
  }
  c.leaf = false;
  if (c.type == 'a'){
    c1 = make_curve('a', c.x, c.y, c.width/2, c.height/2);
    c2 = make_curve('a', c.x+c.width/2, c.y, c.width/2, c.height/2);
    c3 = make_curve('d', c.x, c.y+c.height/2, c.width/2, c.height/2);
    c4 = make_curve('b', c.x+c.width/2, c.y+c.height/2, c.width/2, c.height/2);
    c.children = [c1, c2, c3, c4];
    c.start = c3.start;
    c.end = c4.end;
  }
  else if (c.type == 'b'){
    c1 = make_curve('b', c.x, c.y, c.width/2, c.height/2);
    c2 = make_curve('c', c.x+c.width/2, c.y, c.width/2, c.height/2);
    c3 = make_curve('b', c.x, c.y+c.height/2, c.width/2, c.height/2);
    c4 = make_curve('a', c.x+c.width/2, c.y+c.height/2, c.width/2, c.height/2);
    c.children = [c1, c2, c3, c4];
    c.start = c2.start;
    c.end = c4.end;
  }
  else if (c.type == 'c'){
    c1 = make_curve('d', c.x, c.y, c.width/2, c.height/2);
    c2 = make_curve('b', c.x+c.width/2, c.y, c.width/2, c.height/2);
    c3 = make_curve('c', c.x, c.y+c.height/2, c.width/2, c.height/2);
    c4 = make_curve('c', c.x+c.width/2, c.y+c.height/2, c.width/2, c.height/2);
    c.children = [c1, c2, c3, c4];
    c.start = c2.start;
    c.end = c1.end;
  }
  else if (c.type == 'd'){
    c1 = make_curve('c', c.x, c.y, c.width/2, c.height/2);
    c2 = make_curve('d', c.x+c.width/2, c.y, c.width/2, c.height/2);
    c3 = make_curve('a', c.x, c.y+c.height/2, c.width/2, c.height/2);
    c4 = make_curve('d', c.x+c.width/2, c.y+c.height/2, c.width/2, c.height/2);
    c.children = [c1, c2, c3, c4];
    c.start = c3.start;
    c.end = c1.end;
  }
  else {
    console.log("Unknown type:", c.type);
  }
  make_connectors(c);
}

function update_ends(c){
  if (c.type == 'a'){
    c.start = c.children[2].start;
    c.end = c.children[3].end;
  }
  else if (c.type == 'b'){
    c.start = c.children[1].start;
    c.end = c.children[3].end;
  }
  else if (c.type == 'c'){
    c.start = c.children[1].start;
    c.end = c.children[0].end;
  }
  else if (c.type == 'd'){
    c.start = c.children[2].start;
    c.end = c.children[0].end;
  }
}

function make_curve(type, x, y, w, h){
  let ret = {
    x: x,
    y: y,
    width: w,
    height: h,
    children: [],
    connectors: [],
    leaf: true,
    type: type
  };
  x1 = x+w/4;
  x2 = x+3*w/4;
  y1 = y+h/4;
  y2 = y+3*h/4;
  if (type == 'a'){
    ret.start = {x: x1, y: y2};
    ret.end   = {x: x2, y: y2};
  }
  else if (type == 'b'){
    ret.start = {x: x2, y: y1};
    ret.end   = {x: x2, y: y2};
  }
  else if (type == 'c'){
    ret.start = {x: x2, y: y1};
    ret.end   = {x: x1, y: y1};
  }
  else if (type == 'd'){
    ret.start = {x: x1, y: y2};
    ret.end   = {x: x1, y: y1};
  }
  return ret;
}

function make_connectors(c){
  if (c.children.length === 0){
    return;
  }
  if (c.type == 'a'){
    c.connectors = [
      make_connector(c.children[2].end, c.children[0].start),
      make_connector(c.children[0].end, c.children[1].start),
      make_connector(c.children[1].end, c.children[3].start)
    ];
  }
  else if (c.type == 'b'){
    c.connectors = [
      make_connector(c.children[1].end, c.children[0].start),
      make_connector(c.children[0].end, c.children[2].start),
      make_connector(c.children[2].end, c.children[3].start)
    ];
  }
  else if (c.type == 'c'){
    c.connectors = [
      make_connector(c.children[1].end, c.children[3].start),
      make_connector(c.children[3].end, c.children[2].start),
      make_connector(c.children[2].end, c.children[0].start)
    ];
  }
  else if (c.type == 'd'){
    c.connectors = [
      make_connector(c.children[2].end, c.children[3].start),
      make_connector(c.children[3].end, c.children[1].start),
      make_connector(c.children[1].end, c.children[0].start)
    ];
  }
}

function make_connector(end, start){
  return {
    x1: end.x,
    y1: end.y,
    x2: start.x,
    y2: start.y
  };
}


