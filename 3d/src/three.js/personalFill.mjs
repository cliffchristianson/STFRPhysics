
import * as THREE from "./three.module.js"
import {lnQuat} from "../lnQuatSq.js"
if( !THREE.REVISION.includes( "d3x0r" ) ) {
}
if( Number(THREE.REVISION) === 74 ) {
}

var vector3Pool = [];
export const Vector3Pool = {
	new : function(x,y,z) {
		var r = vector3Pool.pop();
		if( r ) {
			r.x = x;
			r.y = y;
			r.z = z;
		}
		else{
			r = new THREE.Vector3(x,y,z);
		}
		return r;
	}
}

THREE.Vector3.prototype.delete = function() {
    vector3Pool.push( this );
    return this;
}

var vector4Pool = [];
export const Vector4Pool = {
	new : function(x,y,z,w) {
		var r = vector4Pool.pop();
		if( r ) {
			r.x = x;
			r.y = y;
			r.z = z;
			r.w = w;
		}
		else{
			r = new THREE.Vector4(x,y,z,w);
		}
		return r;
	}
}

THREE.Vector4.prototype.delete = function() {
    vector4Pool.push( this );
    return this;
}

const Vector3Unit = new      THREE.Vector3(  1,  1,  1 );
const Vector3Zero = new      THREE.Vector3(  0,  0,  0 );
const Vector3Right = new     THREE.Vector3( -1,  0,  0 );
const Vector3Backward = new  THREE.Vector3(  0,  0,  1 );
const Vector3Up = new        THREE.Vector3(  0,  1,  0 );
const Vector3Left = new      THREE.Vector3(  1,  0,  0 );
const Vector3Forward = new   THREE.Vector3(  0,  0, -1 );
const Vector3Down = new      THREE.Vector3(  0, -1,  0 );

export const THREE_consts = {
	 Vector3Unit :	 Vector3Unit ,
	Vector3Zero :	Vector3Zero ,
	 Vector3Right:	 Vector3Right, 
	 Vector3Backward:	 Vector3Backward,
	 Vector3Up :	 Vector3Up ,
	 Vector3Left:	 Vector3Left, 
	 Vector3Forward:	 Vector3Forward,
	 Vector3Down:	 Vector3Down 
}

const x = ["Vector3Unit"
,"Vector3Zero"
,"Vector3Right"
,"Vector3Backward"
,"Vector3Up"
,"Vector3Left"
,"Vector3Forward"
,"Vector3Down"].forEach( function(key){
	Object.freeze(THREE_consts[key])
	Object.defineProperty(THREE_consts[key], "x", { writable: false })
	Object.defineProperty(THREE_consts[key], "y", { writable: false })
	Object.defineProperty(THREE_consts[key], "z", { writable: false })
})


const tmpQ = new lnQuat();

export class Motion {
	body  = null;


	speed = new THREE.Vector3();
	acceleration = new THREE.Vector3();
	orientation = new lnQuat();
	rotation = new lnQuat();
	torque = new lnQuat();
	mass = 1.0;


	constructor( body ) {
		this.body = body;
	}

                move ( m, delta ) {

					//this.orientation.spin( this.rotation.θ ,this.rotation.freeSpin( this.torque.θ * delta, this.torque ), delta ).exp( this.body.quaternion, 1 );
					this.torque.update();
					if( this.torque.θ) {
						//console.log( "Updating rotation:", this.rotation, this.torque )
						tmpQ.set( this.torque ).freeSpin( -this.orientation.θ, this.orientation );
						this.rotation.freeSpin( tmpQ.θ * delta, tmpQ );
					}
					this.rotation.update();
					this.orientation.spin( this.rotation.θ * delta, {x:this.rotation.nx,
							y:this.rotation.ny, z:this.rotation.nz } ).exp( this.body.quaternion, 1 );

					this.speed.addScaledVector( this.acceleration, delta );
					var del = this.speed.clone().multiplyScalar( delta );
					const basis = this.orientation.getBasis();
					this.body.position.addScaledVector( basis.forward, del.z );
					this.body.position.addScaledVector( basis.up, del.y );
					this.body.position.addScaledVector( basis.right, -del.x );

					// this is applying internal torque.

					//m.rotateRelative( this_move.x, this_move.y, this_move.z );
					//this_move.delete();
					del.delete();
				}
                freemove( m, delta ) {
					
					var del = this.acceleration.clone().multiplyScalar( delta );
					this.speed.addScaledVector( m.forward, del.z );
					this.speed.addScaledVector( m.up, del.y );
					this.speed.addScaledVector( m.left, del.x );
					del.delete();

					this.body.position.addScaledVector( this.speed, delta );

					this.torque.update();
					if( this.torque.θ) {
						//console.log( "Updating rotation:", this.rotation, this.torque )
						///tmpQ.set( this.torque ).freeSpin( this.orientation.θ, this.orientation );
						//this.rotation.freeSpin( tmpQ.θ * delta, tmpQ );
						this.rotation.freeSpin( this.torque.θ * delta, this.torque ).update();
					}
					this.orientation.spin( this.rotation.θ * delta, {x:this.rotation.nx,
							y:this.rotation.ny, z:this.rotation.nz } ).exp( this.body.quaternion, 1 );
					//this.orientation.add( this.rotation.freeSpin( this.torque.θ * delta, this.torque ), delta ).exp( this.body.rotation, 1 );
				}
				rotate( m, delta ) {
					var iterations = 1;

					var max = Math.abs( this.rotation.x );
					var tmp = Math.abs( this.rotation.y );
					if( tmp > max ) {
						max = tmp;
						tmp = Math.abs( this.rotation.z );
						if( tmp > max ) {
							max = tmp;
							while( ( ( max * delta ) / iterations ) > 0.1 )
								iterations++;
						} else {
							while( ( ( max * delta ) / iterations ) > 0.1 )
								iterations++;
						}
					} else {
						tmp = Math.abs( this.rotation.z );
						if( tmp > max ) {
							max = tmp;
							while( ( ( max * delta ) / iterations ) > 0.1 )
								iterations++;
						} else {
							while( ( ( max * delta ) / iterations ) > 0.1 )
								iterations++;
						}
					}
					var delx = ( this.rotation.x * delta ) / iterations;
					var dely = ( this.rotation.y * delta ) / iterations;
					var delz = ( this.rotation.z * delta ) / iterations;
					for( var n = 0; n < iterations; n++ ) {
						m.rotateRelative( delx, dely, delz );
					}
				  }


			rotate ( m, delta ) {
				var iterations = 1;

				var max = Math.abs( this.rotation.x );
				var tmp = Math.abs( this.rotation.y );
				if( tmp > max ) {
					max = tmp;
					tmp = Math.abs( this.rotation.z );
					if( tmp > max ) {
						max = tmp;
						while( ( ( max * delta ) / iterations ) > 0.1 )
							iterations++;
					} else {
						while( ( ( max * delta ) / iterations ) > 0.1 )
							iterations++;
					}
				} else {
					tmp = Math.abs( this.rotation.z );
					if( tmp > max ) {
						max = tmp;
						while( ( ( max * delta ) / iterations ) > 0.1 )
							iterations++;
					} else {
						while( ( ( max * delta ) / iterations ) > 0.1 )
							iterations++;
					}
				}
				var delx = ( this.rotation.x * delta ) / iterations;
				var dely = ( this.rotation.y * delta ) / iterations;
				var delz = ( this.rotation.z * delta ) / iterations;
				for( var n = 0; n < iterations; n++ ) {
					m.rotateRelative( delx, dely, delz );
				}
			}

}

THREE.Matrix4.prototype.__defineGetter__( "origin", function(){
	if( !this._origin ){
		var self = this;
		this._origin = new THREE.Vector3();
		Object.defineProperty(this, "_origin", { writable:false } );
		Object.defineProperty( this._origin, "x", {
			get : function(){
				return self.elements[12];
			},
			set : function(v){
				self.elements[12] = v;
			}
		})
		Object.defineProperty( this._origin, "y", {
			get : ()=>{
				return self.elements[13];
			},
			set : (v)=>{
				self.elements[13] = v;
			}
		})
		Object.defineProperty( this._origin, "z", {
			get : ()=>{
				return self.elements[14];
			},
			set : (v)=>{
				self.elements[14] = v;
			}
		})
	}
	return this._origin;
} );




	THREE.Matrix4.prototype.Translate = function(x,y,z) {
			this.origin.x = x;
			this.origin.y = y;
			this.origin.z = z;
	};
	THREE.Matrix4.prototype.__defineGetter__( "left", function(){
        	return Vector3Pool.new( this.elements[0], this.elements[1], this.elements[2] );
        } );
	THREE.Matrix4.prototype.__defineGetter__( "right", function(){
		return Vector3Pool.new( -this.elements[0], -this.elements[1], -this.elements[2] );
	} );
	THREE.Matrix4.prototype.__defineGetter__( "up", function(){
        	return Vector3Pool.new( this.elements[4], this.elements[5], this.elements[6] );
        } );
	THREE.Matrix4.prototype.__defineGetter__( "down", function(){
		return Vector3Pool.new( -this.elements[4], -this.elements[5], -this.elements[6] );
        } );
	THREE.Matrix4.prototype.__defineGetter__( "forward", function(){
        	return Vector3Pool.new( -this.elements[8], -this.elements[9], -this.elements[10] );
        } );
	THREE.Matrix4.prototype.__defineGetter__( "backward", function(){
		return Vector3Pool.new( this.elements[8], this.elements[9], this.elements[10] );
        } );
	THREE.Matrix4.prototype.move = function (tick) {
        	if( this.motion )
				this.motion.move( this, tick );
        	//this.origin.addScaledVector( this.forward, z ).addScaledVector( this.up, y ).addScaledVector( this.left, x )
		};
	THREE.Matrix4.prototype.moveNow = function ( x,y,z ) { this.origin.addScaledVector( this.forward, z ).addScaledVector( this.up, y ).addScaledVector( this.left, x ) };
	THREE.Matrix4.prototype.moveForward = function ( n ) { this.origin.addScaledVector( this.forward, n ); };
	THREE.Matrix4.prototype.moveUp = function ( n ) { this.origin.addScaledVector( this.up, n ); };
	THREE.Matrix4.prototype.moveLeft = function ( n ) { this.origin.addScaledVector( this.left, n ); };
	THREE.Matrix4.prototype.moveBackward = function ( n ) { this.origin.addScaledVector( this.backward, n ); };
	THREE.Matrix4.prototype.moveDown = function ( n ) { this.origin.addScaledVector( this.down, n ); };
	THREE.Matrix4.prototype.moveRight = function ( n ) { this.origin.addScaledVector( this.right, n ); };

	THREE.Matrix4.prototype.__defineGetter__( "inv_left", function(){
        	return Vector3Pool.new( this.elements[0], this.elements[4], this.elements[8] );
        } );
	THREE.Matrix4.prototype.__defineGetter__( "inv_up", function(){
        	return Vector3Pool.new( this.elements[1], this.elements[5], this.elements[9] );
        } );
	THREE.Matrix4.prototype.__defineGetter__( "inv_forward", function(){
        	return Vector3Pool.new( this.elements[2], this.elements[6], this.elements[10] );
        } );

	THREE.Matrix4.prototype.getRoll = function( relativeUp ) {
		//if( !relativeUp ) relativeUp = THREE.Vector3Up;
		return Math.asin( this.right.dot( relativeUp ) );
	};
	THREE.Matrix4.prototype.getPitch = function( relativeForward ) {
		//if( !relativeForward ) relativeForward = THREE.Vector3Forward;
		return Math.asin( this.up.dot( relativeForward ) );
	};
	THREE.Matrix4.prototype.getYaw = function( relativeRight ) {
		//if( !relativeRight ) relativeRight = THREE.Vector3Right;
		return Math.asin( this.forward.dot( relativeRight ) );
	};
	THREE.Matrix4.prototype.__defineGetter__( "roll", function(){
		return this.getRoll( Vector3Up );
	} );
	THREE.Matrix4.prototype.__defineGetter__( "pitch", function(){
		return this.getPitch( Vector3Forward );
	} );
	THREE.Matrix4.prototype.__defineGetter__( "yaw", function(){
		return this.getYaw( Vector3Right );
	} );
//}
