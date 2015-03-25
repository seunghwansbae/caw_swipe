
Object.prototype.swipe = function( param ){
	/* prototype add */
	var target = this, //object
		proto = this.__proto__,
		factor = {
			returnstart : function(){}, //터치스타트,마우스 다운 함수
			returnmove : function(){}, //터치무브, 마우스 무브 함수
			returnend : function(){}, //터치종료,마우스업 함수
			returncancel : function(){}, // 터치취소 함수
			minDistanceX : 100, //최소 이동거리 x
			minDistanceY : 100 //최소 이동거리 y
		},
		v = {}; //value object

	init();

	/* setting */
	function init(){
		//객체의 초기상태
		proto.swipeState = 'end';

		/* 좌표 값 및 필요 변수 생성*/
		v.startX = null; //시작 좌표 X
		v.startY = null; //시작 좌표 Y
		v.stateX = null; //진행중 좌표 X
		v.stateY = null; //진행중 좌표 Y
		v.endX = null; //종료시 좌표 X
		v.endY = null; //종료시 좌표 Y
		v.eventType = eventTypeCheck(); //이벤트 타입 지정 ( touch, mouse )

		/* 인자 확장 */
		factor = $.extend(factor,param);

		/* create event */
		target.on(v.eventType.start , actionBegin)
			  .on(v.eventType.move , actionMove)
			  .on(v.eventType.end , actionEnd);
		if(v.eventType.touch) target.on(v.eventType.cancel , proto.swipeCancel); //터치가 가능할때만 터치캔슬 이벤트 적용
	}

	/* start */
	function actionBegin(e){
		var returns = {},
			useEvent = (v.eventType.touch) ? e.originalEvent.touches[0] : e;

		proto.swipeState = 'start';

		returns.x = v.startX = v.stateX = useEvent.pageX;
		returns.y = v.startY = v.stateY = useEvent.pageY;


		factor.returnstart( returns );
		return false;
	}

	/* move */
	function actionMove(e){
		var returns = {
				x : null,
				y : null,
				distanceX : null,
				distanceY : null,
				directionX : null,
				directionY : null
			},
			useEvent = (v.eventType.touch) ? e.originalEvent.touches[0] : e;

		if(proto.swipeState == 'end') return false;
		proto.swipeState = 'move';

		if( v.stateX < useEvent.pageX ){
			returns.directionX = 'right';
		}else if( v.stateX > useEvent.pageX ){
			returns.directionX = 'left';
		}else{
			returns.directionX = 'stop';
		}

		if( v.stateY < useEvent.pageY ){
			returns.directionY = 'down';
		}else if( v.stateY > useEvent.pageY ){
			returns.directionY = 'up';
		}else{
			returns.directionY = 'stop';
		}

		returns.x = v.stateX = useEvent.pageX;
		returns.y = v.stateY = useEvent.pageY;
		returns.distanceX = distance(v.stateX, v.startX, false);
		returns.distanceY = distance(v.stateY, v.startY, false);

		factor.returnmove( returns );

		return false;
	}

	/* end */
	function actionEnd(e){
		var returns = {};

		if(proto.swipeState == 'end') return false;
		proto.swipeState = 'end';

		returns.x = v.endX = v.stateX;
		returns.y = v.endY = v.stateY;
		returns.distanceX = distance(v.endX, v.startX, true);
		returns.distanceY = distance(v.endY, v.startY, true);

		if(returns.distanceX <= factor.minDistanceX || v.startX === v.stateX){
			returns.directionX = 'stop';
		}else if( v.startX < v.stateX ){
			returns.directionX = 'right';
		}else if( v.startX > v.stateX ){
			returns.directionX = 'left';
		}

		if(returns.distanceY <= factor.minDistanceY || v.startY === v.stateY){
			returns.directionY = 'stop';
		}else if( v.startY < v.stateY ){
			returns.directionY = 'down';
		}else if( v.startY > v.stateY ){
			returns.directionY = 'up';
		}

		factor.returnend( returns );

		return false;
	}

	/* cancel */
	proto.swipeCancel = function(){
		proto.swipeState = 'end';
		factor.returncancel();
		return false;
	}

	/* 움직인 거리를 리턴 */
	function distance(start,end,math){
		var returns = (math) ? Math.abs(start - end) : start - end;
		return returns;
	}

	function eventTypeCheck(){
		var re = {};

		re = {
			touch : isTouch = 'ontouchstart' in window,
			pointer10 : window.navigator.msPointerEnabled && !window.navigator.pointerEnabled,
			pointer : window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
			start : isTouch ? (re.pointer ? (re.pointer10 ? 'MSPointerDown' : 'pointerdown') : 'touchstart') : 'mousedown',
			move : isTouch ? (re.pointer ? (re.pointer10 ? 'MSPointerMove' : 'pointermove') : 'touchmove' ) : 'mousemove',
			end : isTouch ? (re.pointer ? (re.pointer10 ? 'MSPointerUp' : 'pointerup') : 'touchend') : 'mouseup mouseleave',
			cancel : (re.pointer ? (re.pointer10 ? 'MSPointerCancel' : 'pointercancel') : 'touchcancel')
		};

		return re;
	}

};






