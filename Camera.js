class Camera {
  constructor() {
    this.eye = new Vector3([0, 0, 3]);
    this.at  = new Vector3([0, 0, -100]);
    this.up  = new Vector3([0, 1, 0]);
  }

  forward() {
    let f = new Vector3();
    f.elements[0] = this.at.elements[0] - this.eye.elements[0];
    f.elements[1] = this.at.elements[1] - this.eye.elements[1];
    f.elements[2] = this.at.elements[2] - this.eye.elements[2];
    f.normalize();
    let mx = f.elements[0] * 0.2, mz = f.elements[2] * 0.2;
    if (isWalkable(this.eye.elements[0] + mx, this.eye.elements[2]))       { this.eye.elements[0] += mx; this.at.elements[0] += mx; }
    if (isWalkable(this.eye.elements[0],       this.eye.elements[2] + mz)) { this.eye.elements[2] += mz; this.at.elements[2] += mz; }
  }

  back() {
    let f = new Vector3();
    f.elements[0] = this.at.elements[0] - this.eye.elements[0];
    f.elements[1] = this.at.elements[1] - this.eye.elements[1];
    f.elements[2] = this.at.elements[2] - this.eye.elements[2];
    f.normalize();
    let mx = f.elements[0] * 0.2, mz = f.elements[2] * 0.2;
    if (isWalkable(this.eye.elements[0] - mx, this.eye.elements[2]))       { this.eye.elements[0] -= mx; this.at.elements[0] -= mx; }
    if (isWalkable(this.eye.elements[0],       this.eye.elements[2] - mz)) { this.eye.elements[2] -= mz; this.at.elements[2] -= mz; }
  }

  left() {
    let f = new Vector3();
    f.elements[0] = this.at.elements[0] - this.eye.elements[0]; f.elements[1] = 0;
    f.elements[2] = this.at.elements[2] - this.eye.elements[2];
    f.normalize();
    let s = new Vector3();
    s.elements[0] = f.elements[1]*this.up.elements[2] - f.elements[2]*this.up.elements[1];
    s.elements[1] = f.elements[2]*this.up.elements[0] - f.elements[0]*this.up.elements[2];
    s.elements[2] = f.elements[0]*this.up.elements[1] - f.elements[1]*this.up.elements[0];
    s.normalize();
    let mx = s.elements[0] * 0.2, mz = s.elements[2] * 0.2;
    if (isWalkable(this.eye.elements[0] - mx, this.eye.elements[2]))       { this.eye.elements[0] -= mx; this.at.elements[0] -= mx; }
    if (isWalkable(this.eye.elements[0],       this.eye.elements[2] - mz)) { this.eye.elements[2] -= mz; this.at.elements[2] -= mz; }
  }

  right() {
    let f = new Vector3();
    f.elements[0] = this.at.elements[0] - this.eye.elements[0]; f.elements[1] = 0;
    f.elements[2] = this.at.elements[2] - this.eye.elements[2];
    f.normalize();
    let s = new Vector3();
    s.elements[0] = f.elements[1]*this.up.elements[2] - f.elements[2]*this.up.elements[1];
    s.elements[1] = f.elements[2]*this.up.elements[0] - f.elements[0]*this.up.elements[2];
    s.elements[2] = f.elements[0]*this.up.elements[1] - f.elements[1]*this.up.elements[0];
    s.normalize();
    let mx = s.elements[0] * 0.2, mz = s.elements[2] * 0.2;
    if (isWalkable(this.eye.elements[0] + mx, this.eye.elements[2]))       { this.eye.elements[0] += mx; this.at.elements[0] += mx; }
    if (isWalkable(this.eye.elements[0],       this.eye.elements[2] + mz)) { this.eye.elements[2] += mz; this.at.elements[2] += mz; }
  }

  panLeft(angle = 10) {
    let f = new Vector3();
    f.elements[0] = this.at.elements[0] - this.eye.elements[0];
    f.elements[1] = this.at.elements[1] - this.eye.elements[1];
    f.elements[2] = this.at.elements[2] - this.eye.elements[2];
    let rot = new Matrix4();
    rot.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let fp = rot.multiplyVector3(f);
    this.at.elements[0] = this.eye.elements[0] + fp.elements[0];
    this.at.elements[1] = this.eye.elements[1] + fp.elements[1];
    this.at.elements[2] = this.eye.elements[2] + fp.elements[2];
  }

  panRight(angle = 10) { this.panLeft(-angle); }

  panUpDown(angle) {
    let f = new Vector3();
    f.elements[0] = this.at.elements[0] - this.eye.elements[0];
    f.elements[1] = this.at.elements[1] - this.eye.elements[1];
    f.elements[2] = this.at.elements[2] - this.eye.elements[2];
    let s = new Vector3();
    s.elements[0] = f.elements[1]*this.up.elements[2] - f.elements[2]*this.up.elements[1];
    s.elements[1] = f.elements[2]*this.up.elements[0] - f.elements[0]*this.up.elements[2];
    s.elements[2] = f.elements[0]*this.up.elements[1] - f.elements[1]*this.up.elements[0];
    s.normalize();
    let rot = new Matrix4();
    rot.setRotate(angle, s.elements[0], s.elements[1], s.elements[2]);
    let fp = rot.multiplyVector3(f);
    this.at.elements[0] = this.eye.elements[0] + fp.elements[0];
    this.at.elements[1] = this.eye.elements[1] + fp.elements[1];
    this.at.elements[2] = this.eye.elements[2] + fp.elements[2];
  }
}