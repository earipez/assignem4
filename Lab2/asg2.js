// Shaders

// Input: an array of points comes from javascript.
// In this example, think of this array as the variable a_Position;
// Q: Why a_Position is not an array?
// A: Because the GPU process every vertex in parallel
// The language that we use to write the shaders is called GLSL

// Output: sends "an array of points" to the rasterizer.
var VERTEX_SHADER = `
    precision mediump float;

    attribute vec3 a_Position;
    attribute vec3 a_Color;

    varying vec3 v_Color;

    uniform mat4 u_ModelMatrix;

    void main() {
        v_Color = a_Color;
        gl_Position = u_ModelMatrix * vec4(a_Position, 1.0); // return a_Position;
    }
`;

// Input: a fragment (a grid of pixels) comes from the rasterizer.
// It doesn't have vertices as input
// Ouput: a color goes to HTML canvas.
var FRAGMENT_SHADER = `
    precision mediump float;

    varying vec3 v_Color;

    void main() {
        gl_FragColor = vec4(v_Color, 1.0);
    }
`;

// We will use HTML sliders to set this variable
GlobalRotation = 0;
shapes = [];

function animate(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  GlobalRotation += 1;
  //console.log(GlobalRotation);
  //for(let s of shapes){
    //s.rotateY(GlobalRotation);
    //draw(s);
  //}

  shapes[0].rotateY(GlobalRotation);
  draw(shapes[0]);

  shapes[1].rotateY(45+GlobalRotation);
  draw(shapes[1]);

  shapes[2].rotateY(GlobalRotation);
  draw(shapes[2]);

  //shapes[0].rotateY(GlobalRotation);
  //draw(shapes[0]);

  //shapes[1].rotateX(GlobalRotation);
  //draw(shapes[1]);

  //shapes[2].translate(0.75, -0.75+GlobalRotation/100, 0);
  //draw(shapes[2]);

  requestAnimationFrame(animate);

}

function draw(geometry){
  geometry.modelMatrix.multiply(geometry.translationMatrix);
  geometry.modelMatrix.multiply(geometry.rotationMatrix);
  geometry.modelMatrix.multiply(geometry.scaleMatrix);

  let u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  gl.uniformMatrix4fv(u_ModelMatrix, false, geometry.modelMatrix.elements);

  gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);
  // Finally, we can call a Draw function
  gl.drawArrays(gl.TRIANGLES, 0, geometry.vertices.length/6);

  geometry.modelMatrix.setIdentity();
}

function main() {
    let canvas = document.getElementById("webgl");

    // Retrieve WebGl rendering context
    gl = getWebGLContext(canvas);
    if(!gl) {
        console.log("Failed to get WebGL context.")
        return -1;
    }

    gl.enable(gl.DEPTH_TEST);

    // A function to do all the drawing task outside of main
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Actually clear screen
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // We need to define a triangle.
    // A triangle is made out of three points: a, b, c.
    // In webGL, we normally define these points together in one array

    let cube1 = new cube();
    cube1.translate(0, 0.4, 0);
    cube1.scale(0.5, 0.25, 0.25);
    cube1.rotateY(135);

    shapes.push(cube1);

    let cube2 = new cube();
    cube2.translate(0, -0.3, 0);
    cube2.scale(0.1, 0.5, 0.1);
    cube2.rotateY(45);

    shapes.push(cube2);

    let triangle1 = new triangle();
    triangle1.translate(0, 0.75, 0);
    triangle1.scale(.25, .5, 1);
    triangle1.rotateY(30);

    shapes.push(triangle1);

    // Remember that WebGL uses the GPU to render vertices on the screen.
    // Therefore, we need to send these points to the GPU. Because
    // the GPU is a different processing unit in your computer.

    // We have to compile the vertex and fragment shaders and
    // load them in the GPU
    if(!initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER)) {
        console.log("Failed to compile and load shaders.")
        return -1;
    }

    // Specify how to read points a, b and c from the triangle array
    // Create a WebGL buffer (an array in GPU memory), which is similar
    // to a javascript Array.
    let vertexBuffer = gl.createBuffer();
    if(!vertexBuffer) {
        console.log("Can't create buffer");
        return -1;
    }

    // We have to bind this new buffer to the a_Position attribute in the
    // vertex shader.
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // To map this ARRAY_BUFFER called vertexBuffer to our attribute a_Position
    // in the vertex shader.
    // To do that, we first need to access the memory location of the
    // attribute a_Position. Remember that a_Position is a variable in
    // the GPU memory. So we need to grab that location.
    let FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;

    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 6*FLOAT_SIZE, 0*FLOAT_SIZE);
    gl.enableVertexAttribArray(a_Position);

    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 6*FLOAT_SIZE, 3*FLOAT_SIZE);
    gl.enableVertexAttribArray(a_Color);

    // Up to here, we have setup our vertex buffer in the GPU. We need
    // to send our vertices (in this case, a triangle) to this buffer.
    animate();

}
