class Sphere {
  constructor() {
    this.type       = 'sphere';
    this.color      = [1.0, 1.0, 1.0, 1.0];
    this.matrix     = new Matrix4();
    this.textureNum = -2;
    this.verts      = [];
    this.normals    = [];
    this._build(24, 24);
  }
  _build(stacks, slices) {
    this.verts   = [];
    this.normals = [];
    for (let i = 0; i < stacks; i++) {
      let phi1 = (i       / stacks) * Math.PI - Math.PI / 2;
      let phi2 = ((i + 1) / stacks) * Math.PI - Math.PI / 2;
      for (let j = 0; j < slices; j++) {
        let th1 = (j       / slices) * 2 * Math.PI;
        let th2 = ((j + 1) / slices) * 2 * Math.PI;

        
        let p = [
          [Math.cos(phi1)*Math.cos(th1), Math.sin(phi1), Math.cos(phi1)*Math.sin(th1)],
          [Math.cos(phi2)*Math.cos(th1), Math.sin(phi2), Math.cos(phi2)*Math.sin(th1)],
          [Math.cos(phi2)*Math.cos(th2), Math.sin(phi2), Math.cos(phi2)*Math.sin(th2)],
          [Math.cos(phi1)*Math.cos(th2), Math.sin(phi1), Math.cos(phi1)*Math.sin(th2)],
        ];

        [0,1,2].forEach(k => { this.verts.push(...p[k]); this.normals.push(...p[k]); });
        [0,2,3].forEach(k => { this.verts.push(...p[k]); this.normals.push(...p[k]); });
      }
    }
  }

  render() {
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, ...this.color);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    drawTriangle3DUVNormal(this.verts, this.verts, this.normals);
  }
}