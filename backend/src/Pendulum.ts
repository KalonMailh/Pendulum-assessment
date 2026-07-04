import { Point2D } from "./Point2D";

export class Pendulum {
    public id: number;          // pendulum id for next steps
    public angle: number;        // radians
    public angularVelocity: number = 0; // (rad/s)
    public length: number;       // rope length (L)
    public mass: number;         // Masse (m)

    public anchor: Point2D;     // Anchor for next steps

    private g: number = 9.81;    // Gravity


    constructor(id: number, initialAngleDegree: number, length: number, mass: number, anchor: Point2D)
    {
        this.id = id;
        this.angle = initialAngleDegree * (Math.PI / 180);
        this.length = length;
        this.mass = mass;
        this.anchor = anchor;
    }

    /**
     * Update punduluum physics
     */
    public update(dt: number): void
    {
        // angular acceleration: alpha = -(g / L) * sin(theta)
        const angularAcceleration = -(this.g / this.length) * Math.sin(this.angle);

        // Update angular velocity (Velocity = Velocity + Acceleration * dt)
        this.angularVelocity += angularAcceleration * dt;

        // Update the angle (Angle = Angle + Velocity * dt)
        this.angle += this.angularVelocity * dt;
    }

    /**
     * Calculate X, Y Local position
     */
    public getLocalPosition(): Point2D
    {
        return {
            x: this.length * Math.sin(this.angle),
            y: this.length * Math.cos(this.angle)
        };
    }

    /**
   * This applies the anchor translation to the local coordinates
   */
    public getGlobalPosition(): Point2D
    {
        const local = this.getLocalPosition();

        // We shift the local coordinates by adding the anchor's X and Y
        return {
            x: local.x + this.anchor.x,
            y: local.y + this.anchor.y
        };
    }
}