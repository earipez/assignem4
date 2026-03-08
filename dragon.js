class Dragon {
  constructor() {
    this.type       = 'dragon';
    this.color      = [0.8, 0.3, 0.1, 1.0]; 
    this.matrix     = new Matrix4();
    this.textureNum = -2;
    this.verts      = [];
    this.normals    = [];
    this.loaded     = false;
  }

  
  load(url, cb) {
    fetch(url)
      .then(r => r.text())
      .then(text => {
        this._parse(text);
        this.loaded = true;
        if (cb) cb();
      })
      .catch(err => console.error('Failed to load OBJ:', err));
  }

  _parse(text) {
    const positions = [];  
    const normals   = [];  
    const outVerts  = [];  
    const outNorms  = [];

    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (line.startsWith('v ')) {
        const [, x, y, z] = line.split(/\s+/);
        positions.push(parseFloat(x), parseFloat(y), parseFloat(z));
      } else if (line.startsWith('vn ')) {
        const [, x, y, z] = line.split(/\s+/);
        normals.push(parseFloat(x), parseFloat(y), parseFloat(z));
      } else if (line.startsWith('f ')) {
        
        const tokens = line.split(/\s+/).slice(1);
        const face = tokens.map(t => {
          const parts = t.split('/');
          return {
            vi: parseInt(parts[0]) - 1,
            ni: parts[2] ? parseInt(parts[2]) - 1 : -1,
          };
        });
        // Fan-triangulate (handles tris and quads)
        for (let i = 1; i < face.length - 1; i++) {
          for (const idx of [face[0], face[i], face[i + 1]]) {
            const vi = idx.vi * 3;
            outVerts.push(positions[vi], positions[vi+1], positions[vi+2]);
            if (idx.ni >= 0) {
              const ni = idx.ni * 3;
              outNorms.push(normals[ni], normals[ni+1], normals[ni+2]);
            } else {
              outNorms.push(0, 1, 0); 
            }
          }
        }
      }
    }
    if (normals.length === 0) {
      outNorms.length = 0;
      for (let i = 0; i < outVerts.length; i += 9) {
        const ax = outVerts[i],   ay = outVerts[i+1], az = outVerts[i+2];
        const bx = outVerts[i+3], by = outVerts[i+4], bz = outVerts[i+5];
        const cx = outVerts[i+6], cy = outVerts[i+7], cz = outVerts[i+8];

        const ex = bx-ax, ey = by-ay, ez = bz-az;
        const fx = cx-ax, fy = cy-ay, fz = cz-az;
        let nx = ey*fz - ez*fy;
        let ny = ez*fx - ex*fz;
        let nz = ex*fy - ey*fx;
        const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
        nx /= len; ny /= len; nz /= len;
        for (let v = 0; v < 3; v++) outNorms.push(nx, ny, nz);
      }
    }

    this.verts   = outVerts;
    this.normals = outNorms;
    console.log(`Dragon loaded: ${outVerts.length/3} vertices`);
  }

  render() {
    if (!this.loaded) return;
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, ...this.color);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    drawTriangle3DUVNormal(this.verts, this.verts, this.normals);
  }
}