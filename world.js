var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV      = a_UV;
    v_Normal  = normalize(vec3(u_ModelMatrix * vec4(a_Normal, 0.0)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;

  uniform vec3  u_LightPos;
  uniform vec3  u_LightColor;
  uniform vec3  u_CameraPos;
  uniform int   u_LightOn;
  uniform int   u_ShowNormals;

  uniform int   u_SpotOn;
  uniform vec3  u_SpotPos;
  uniform vec3  u_SpotDir;
  uniform float u_SpotCutoff;

  void main() {
    vec4 baseColor;
    if      (u_whichTexture == -2) baseColor = u_FragColor;
    else if (u_whichTexture == -1) baseColor = vec4(v_UV, 1.0, 1.0);
    else if (u_whichTexture ==  0) baseColor = texture2D(u_Sampler0, v_UV);
    else if (u_whichTexture ==  1) baseColor = texture2D(u_Sampler1, v_UV);
    else if (u_whichTexture ==  2) baseColor = texture2D(u_Sampler2, v_UV);
    else if (u_whichTexture ==  3) baseColor = texture2D(u_Sampler3, v_UV);
    else                           baseColor = vec4(1.0, 0.2, 0.2, 1.0);

    if (u_ShowNormals == 1) {
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
      return;
    }

    if (u_LightOn == 0 && u_SpotOn == 0) {
      gl_FragColor = baseColor;
      return;
    }

    vec3 N = normalize(v_Normal);
    vec3 V = normalize(u_CameraPos - vec3(v_VertPos));
    vec3 totalLight = vec3(0.0);
    float ambient = 0.3;

    if (u_LightOn == 1) {
      vec3  L    = normalize(u_LightPos - vec3(v_VertPos));
      vec3  R    = reflect(-L, N);
      float diff = max(dot(N, L), 0.0);
      float spec = pow(max(dot(R, V), 0.0), 32.0) * 0.8;
      totalLight += u_LightColor * (ambient + diff + spec);
    } else {
      totalLight += vec3(ambient);
    }

    if (u_SpotOn == 1) {
      totalLight += vec3(0.1);
      vec3  L2    = normalize(u_SpotPos - vec3(v_VertPos));
      float theta = dot(-L2, normalize(u_SpotDir));
      if (theta > u_SpotCutoff) {
        float intensity = pow(theta, 2.0);
        vec3  R2    = reflect(-L2, N);
        float diff2 = max(dot(N, L2), 0.0);
        float spec2 = pow(max(dot(R2, V), 0.0), 32.0) * 0.8;
        totalLight += vec3(1.0, 1.0, 0.8) * intensity * (diff2 + spec2);
      }
    }

    gl_FragColor = vec4(baseColor.rgb * totalLight, baseColor.a);
  }`

let canvas, gl;
let a_Position, a_UV, a_Normal;
let u_FragColor;
let u_ModelMatrix, u_ProjectionMatrix, u_ViewMatrix, u_GlobalRotateMatrix;
let u_Sampler0, u_Sampler1, u_Sampler2, u_Sampler3, u_whichTexture;
let u_LightPos, u_LightColor, u_CameraPos, u_LightOn, u_ShowNormals;
let u_SpotOn, u_SpotPos, u_SpotDir, u_SpotCutoff;
let g_camera;
let g_globalAngle  = 0;

let g_lightPos     = [0, 3, 0];
let g_lightColor   = [1.0, 1.0, 1.0];
let g_lightOn      = true;
let g_showNormals  = false;
let g_lightAngle   = 0;
let g_animateLight = true;

let g_spotOn  = false;
let g_spotPos = [2.5, 3, -2];   
let g_spotDir = [0, -1, 0];     

let g_dragon = null;

let MAP_SIZE = 10;
let g_map    = [];

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) { console.log('Failed to get WebGL context'); return; }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.'); return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  a_UV       = gl.getAttribLocation(gl.program, 'a_UV');
  a_Normal   = gl.getAttribLocation(gl.program, 'a_Normal');

  u_FragColor          = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix        = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  u_ViewMatrix         = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjectionMatrix   = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  u_Sampler0           = gl.getUniformLocation(gl.program, 'u_Sampler0');
  u_Sampler1           = gl.getUniformLocation(gl.program, 'u_Sampler1');
  u_Sampler2           = gl.getUniformLocation(gl.program, 'u_Sampler2');
  u_Sampler3           = gl.getUniformLocation(gl.program, 'u_Sampler3');
  u_whichTexture       = gl.getUniformLocation(gl.program, 'u_whichTexture');
  u_LightPos           = gl.getUniformLocation(gl.program, 'u_LightPos');
  u_LightColor         = gl.getUniformLocation(gl.program, 'u_LightColor');
  u_CameraPos          = gl.getUniformLocation(gl.program, 'u_CameraPos');
  u_LightOn            = gl.getUniformLocation(gl.program, 'u_LightOn');
  u_ShowNormals        = gl.getUniformLocation(gl.program, 'u_ShowNormals');
  u_SpotOn             = gl.getUniformLocation(gl.program, 'u_SpotOn');
  u_SpotPos            = gl.getUniformLocation(gl.program, 'u_SpotPos');
  u_SpotDir            = gl.getUniformLocation(gl.program, 'u_SpotDir');
  u_SpotCutoff         = gl.getUniformLocation(gl.program, 'u_SpotCutoff');

  var id = new Matrix4();
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, id.elements);
  gl.uniformMatrix4fv(u_ViewMatrix,       false, id.elements);
}


function addActionsForHtmlUI() {
  document.getElementById('angleSlide').addEventListener('input', function() {
    g_globalAngle = this.value; renderAllShapes();
  });

  document.getElementById('lightSlide').addEventListener('input', function() {
    g_animateLight = false;
    g_lightAngle   = this.value;
    let r = 5;
    g_lightPos[0] = r * Math.cos(g_lightAngle * Math.PI / 180);
    g_lightPos[2] = r * Math.sin(g_lightAngle * Math.PI / 180);
    renderAllShapes();
  });

  document.getElementById('lightRedSlide').addEventListener('input',   function() { g_lightColor[0] = this.value/100; renderAllShapes(); });
  document.getElementById('lightGreenSlide').addEventListener('input', function() { g_lightColor[1] = this.value/100; renderAllShapes(); });
  document.getElementById('lightBlueSlide').addEventListener('input',  function() { g_lightColor[2] = this.value/100; renderAllShapes(); });

  document.getElementById('lightOnButton').onclick  = () => { g_lightOn = true;  renderAllShapes(); };
  document.getElementById('lightOffButton').onclick = () => { g_lightOn = false; renderAllShapes(); };

  document.getElementById('normalOnButton').onclick  = () => { g_showNormals = true;  renderAllShapes(); };
  document.getElementById('normalOffButton').onclick = () => { g_showNormals = false; renderAllShapes(); };

  document.getElementById('spotOnButton').onclick  = () => { g_spotOn = true;  renderAllShapes(); };
  document.getElementById('spotOffButton').onclick = () => { g_spotOn = false; renderAllShapes(); };
}

function setupMouseHandlers() {
  canvas.onmousemove = ev => {
    let rect = ev.target.getBoundingClientRect();
    let cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    let dx = (ev.clientX - cx) / (rect.width/2);
    let dy = (ev.clientY - cy) / (rect.height/2);
    if (Math.abs(dx) < 0.1) dx = 0;
    if (Math.abs(dy) < 0.1) dy = 0;
    if (dx !== 0) g_camera.panRight(dx * 4.0);
    if (dy !== 0) g_camera.panUpDown(-dy * 4.0);
  };
}


function initTextures() {
  [
    { src: 'sky.jpg',    unit: gl.TEXTURE0, sampler: u_Sampler0, idx: 0 },
    { src: 'ground.jpg', unit: gl.TEXTURE1, sampler: u_Sampler1, idx: 1 },
    { src: 'wall.jpg',   unit: gl.TEXTURE2, sampler: u_Sampler2, idx: 2 },
  ].forEach(({ src, unit, sampler, idx }) => {
    var img = new Image();
    img.onload = () => {
      var tex = gl.createTexture();
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.activeTexture(unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.uniform1i(sampler, idx);
    };
    img.src = src;
  });
}


function initMap() {
  for (let x = 0; x < MAP_SIZE; x++) {
    g_map[x] = [];
    for (let z = 0; z < MAP_SIZE; z++) {
      if (x==0||x==MAP_SIZE-1||z==0||z==MAP_SIZE-1) g_map[x][z] = 1;
      else if (Math.abs(x-MAP_SIZE/2)<2 && Math.abs(z-MAP_SIZE/2)<2) g_map[x][z] = 0;
      else g_map[x][z] = Math.random() < 0.08 ? 1 : 0;
    }
  }
}

function isWalkable(x, z) {
  let gx = Math.floor(x + MAP_SIZE/2), gz = Math.floor(z + MAP_SIZE/2);
  if (gx < 0 || gx >= MAP_SIZE || gz < 0 || gz >= MAP_SIZE) return false;
  return g_map[gx][gz] !== 1;
}

var reuseCube = null;

function drawMap() {
  for (let x = 0; x < MAP_SIZE; x++) {
    for (let z = 0; z < MAP_SIZE; z++) {
      if (g_map[x][z] == 1) {
        reuseCube.textureNum = 2;
        reuseCube.color = [1, 1, 1, 1];
        reuseCube.matrix.setTranslate(x - MAP_SIZE/2, -0.75, z - MAP_SIZE/2);
        reuseCube.render();
      }
    }
  }
}


function addBlock() {
  let f = new Vector3([
    g_camera.at.elements[0] - g_camera.eye.elements[0],
    g_camera.at.elements[1] - g_camera.eye.elements[1],
    g_camera.at.elements[2] - g_camera.eye.elements[2]
  ]); f.normalize();
  let x = Math.floor(g_camera.eye.elements[0] + f.elements[0]*1.2 + MAP_SIZE/2);
  let z = Math.floor(g_camera.eye.elements[2] + f.elements[2]*1.2 + MAP_SIZE/2);
  if (x>=0 && x<MAP_SIZE && z>=0 && z<MAP_SIZE) g_map[x][z] = 1;
}

function deleteBlock() {
  let f = new Vector3([
    g_camera.at.elements[0] - g_camera.eye.elements[0],
    0,
    g_camera.at.elements[2] - g_camera.eye.elements[2]
  ]); f.normalize();
  let x = Math.floor(g_camera.eye.elements[0] + f.elements[0]*1.2 + MAP_SIZE/2);
  let z = Math.floor(g_camera.eye.elements[2] + f.elements[2]*1.2 + MAP_SIZE/2);
  if (x>=0 && x<MAP_SIZE && z>=0 && z<MAP_SIZE) g_map[x][z] = 0;
}


function main() {
  setupWebGL();
  connectVariablesToGLSL();
  reuseCube = new Cube();
  g_camera     = new Camera();
  g_camera.eye = new Vector3([0, 0, 0]);
  g_camera.at  = new Vector3([0, 0, -1]);
  initMap();
  addActionsForHtmlUI();
  setupMouseHandlers();
  canvas.onclick = () => canvas.requestPointerLock();
  document.onkeydown = keydown;
  initTextures();

  g_dragon = new Dragon();
  g_dragon.load('dragon.obj', () => { renderAllShapes(); });

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds   = 0;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  if (g_animateLight) {
    g_lightAngle += 0.5;
    let r = 5;
    g_lightPos[0] = r * Math.cos(g_lightAngle * Math.PI / 180);
    g_lightPos[2] = r * Math.sin(g_lightAngle * Math.PI / 180);
    g_lightPos[1] = 2 + Math.sin(g_seconds) * 1.5;
  }

  renderAllShapes();
  requestAnimationFrame(tick);
  g_camera.eye.elements[1] = 0.0;
}

function keydown(ev) {
  if      (ev.keyCode==39||ev.keyCode==68) g_camera.right();
  else if (ev.keyCode==37||ev.keyCode==65) g_camera.left();
  else if (ev.keyCode==87) g_camera.forward();
  else if (ev.keyCode==83) g_camera.back();
  else if (ev.keyCode==81) deleteBlock();
  else if (ev.keyCode==69) addBlock();
  renderAllShapes();
}


function renderAllShapes() {
  var t0 = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
    g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false,
    new Matrix4().rotate(g_globalAngle, 0, 1, 0).elements);

  gl.uniform3fv(u_LightPos,   g_lightPos);
  gl.uniform3fv(u_LightColor, g_lightColor);
  gl.uniform3f (u_CameraPos,
    g_camera.eye.elements[0],
    g_camera.eye.elements[1],
    g_camera.eye.elements[2]);
  gl.uniform1i(u_LightOn,     g_lightOn     ? 1 : 0);
  gl.uniform1i(u_ShowNormals, g_showNormals ? 1 : 0);

  gl.uniform1i (u_SpotOn,     g_spotOn ? 1 : 0);
  gl.uniform3fv(u_SpotPos,    g_spotPos);
  gl.uniform3fv(u_SpotDir,    g_spotDir);
  gl.uniform1f (u_SpotCutoff, Math.cos(35 * Math.PI / 180));

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Sky
  var sky = new Cube();
  sky.textureNum = 0;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  // Floor
  var floor = new Cube();
  floor.textureNum = 1;
  floor.matrix.translate(0, -0.75, 0);
  floor.matrix.scale(MAP_SIZE, 0, MAP_SIZE);
  floor.matrix.translate(-0.5, -0.5, -0.5);
  floor.render();

  // Map walls
  drawMap();

  // Dragon
  if (g_dragon && g_dragon.loaded) {
    g_dragon.color      = [0.2, 0.6, 1.0, 1.0];
    g_dragon.textureNum = -2;
    g_dragon.matrix     = new Matrix4();
    g_dragon.matrix.translate(2.5, -0.75, -2);
    g_dragon.matrix.scale(0.5, 0.5, 0.5);
    g_dragon.render();
  }

  // Orange sphere
  var sp2 = new Sphere();
  sp2.color = [1.0, 0.4, 0.2, 1.0];
  sp2.matrix.translate(-2.5, 0, -2);
  sp2.render();

  // Point-light indicator cube
  var lc = new Cube();
  lc.textureNum = -2;
  lc.color = [g_lightColor[0], g_lightColor[1], g_lightColor[2], 1.0];
  lc.matrix.translate(g_lightPos[0]-0.1, g_lightPos[1]-0.1, g_lightPos[2]-0.1);
  lc.matrix.scale(0.2, 0.2, 0.2);
  lc.render();

  
  if (g_spotOn) {
    var sc = new Cube();
    sc.textureNum = -2;
    sc.color = [1.0, 1.0, 0.0, 1.0];
    sc.matrix.translate(g_spotPos[0]-0.1, g_spotPos[1]-0.1, g_spotPos[2]-0.1);
    sc.matrix.scale(0.2, 0.2, 0.2);
    sc.render();
  }

  sendTextToHTML(
    " ms: " + Math.floor(performance.now() - t0) +
    " fps: " + Math.floor(1000 / Math.max(performance.now() - t0, 1)),
    "numdot");
}

function sendTextToHTML(text, id) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = text;
}