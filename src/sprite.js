import PointProxy from "./gfxlib/pointproxy.js";
import {defImage} from "./gfxlib/image.js";
import map from "./map.js";
import * as ma from "./utils/math.js";
import * as mm from "./math.js";

const fromFuncs = [
	mm.leftFrom,
	mm.leftUpFrom,
	mm.rightUpFrom,
	mm.rightFrom,
	mm.rightDownFrom,
	mm.leftDownFrom,
];

export default class Sprite
{
	constructor(img, pos)
	{
		this._installed = false;
		this._oldPos    = new Float32Array(2);
		this._pos       = new Float32Array(2);
		this._posProxy  = new PointProxy(this._pos, () => this.changePos());
		this._img       = defImage;
		this._from      = 0;
		this._way       = 0;
		
		this._posOutdated = true;
		
		this._flatPos = null;
		this._texId   = null;
		this._frameId = null;
		
		if(img) {
			this.img = img;
		}
		
		if(pos) {
			this.pos = pos;
		}
	}
	
	changePos()
	{
		if(this._installed) {
			map.setSprite(this._oldPos, null);
		}
		
		map.setSprite(this._pos, this);
		
		this._oldPos.set(this._pos);
		this._posOutdated = true;
		this._installed   = true;
	}
	
	get pos()
	{
		return this._posProxy;
	}
	
	set pos(p)
	{
		this._posProxy.set(p);
	}
	
	get img()
	{
		return this._img;
	}
	
	set img(img)
	{
		img.ready.then(() => {
			this._img = img;
		});
	}
	
	get from()
	{
		return this._from;
	}
	
	set from(from)
	{
		this._from = from;
		this._posOutdated = true;
	}
	
	get way()
	{
		return this._way;
	}
	
	set way(way)
	{
		this._way = way
		this._posOutdated = true;
	}
	
	update(texId, frameId)
	{
		if(this._installed) {
			let img  = this._img;
			let bbox = img.bbox;
			
			this._texId[0]   = texId;
			this._frameId[0] = frameId;
			
			if(this._posOutdated) {
				let fromFunc = fromFuncs[this._from];
				let toPos    = this._pos;
				let fromPos  = fromFunc(toPos);
				let toVert   = map.getVertex(toPos);
				let fromVert = map.getVertex(fromPos);
				let worldPos = ma.vec3.linear(toVert, fromVert, this._way);
				let flatPos  = ma.vec3.rotateX(worldPos, mm.viewAngle);
				
				this._flatPos[0]  = flatPos[0];
				this._flatPos[1]  = flatPos[1];
				this._posOutdated = false;
			}
		}
	}
}
