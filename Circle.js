class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -1;
  }

  render() {
    var rgba = this.color;
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front face  
    drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0], _n6( 0, 0,-1));
    drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1], _n6( 0, 0,-1));
    // Top face   
    drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], _n6( 0, 1, 0));
    drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0], _n6( 0, 1, 0));
    // Back face   
    drawTriangle3DUVNormal([0,0,1, 1,1,1, 1,0,1], [1,0, 0,1, 0,0], _n6( 0, 0, 1));
    drawTriangle3DUVNormal([0,0,1, 0,1,1, 1,1,1], [1,0, 1,1, 0,1], _n6( 0, 0, 1));
    // Bottom face 
    drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0], [0,1, 1,0, 1,1], _n6( 0,-1, 0));
    drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1], [0,1, 0,0, 1,0], _n6( 0,-1, 0));
    // Left face   
    drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,0,1], [1,0, 0,1, 0,0], _n6(-1, 0, 0));
    drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1], [1,0, 1,1, 0,1], _n6(-1, 0, 0));
    // Right face  
    drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1], _n6( 1, 0, 0));
    drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], _n6( 1, 0, 0));
  }
}


function _n6(nx, ny, nz) {
  return [nx,ny,nz, nx,ny,nz, nx,ny,nz];
}