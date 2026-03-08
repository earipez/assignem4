class Cube {
  constructor() {
    this.type       = 'cube';
    this.color      = [1.0, 1.0, 1.0, 1.0];
    this.matrix     = new Matrix4();
    this.textureNum = -2;
  }

  render() {
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0], _n3( 0, 0,-1));
    drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1], _n3( 0, 0,-1));
   
    drawTriangle3DUVNormal([0,0,1, 1,1,1, 1,0,1], [1,0, 0,1, 0,0], _n3( 0, 0, 1));
    drawTriangle3DUVNormal([0,0,1, 0,1,1, 1,1,1], [1,0, 1,1, 0,1], _n3( 0, 0, 1));
    
    drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], _n3( 0, 1, 0));
    drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0], _n3( 0, 1, 0));
   
    drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0], [0,1, 1,0, 1,1], _n3( 0,-1, 0));
    drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1], [0,1, 0,0, 1,0], _n3( 0,-1, 0));
    // Left 
    drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,0,1], [1,0, 0,1, 0,0], _n3(-1, 0, 0));
    drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1], [1,0, 1,1, 0,1], _n3(-1, 0, 0));
    // Right  
    drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1], _n3( 1, 0, 0));
    drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], _n3( 1, 0, 0));
  }
}

function _n3(nx, ny, nz) {
  return [nx,ny,nz, nx,ny,nz, nx,ny,nz];
}