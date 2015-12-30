/* cancel
	v 1.0 작업중
		이동했을경우 클릭함수 실행 혹은 비실행 처리 해야됨 < 처리된듯
		_this.find('img').on('dragstart',function(){ 이 함수를 네이티브로 변경해야함 << 처리된듯

	터치 엔드시 리턴값에 가속도 리턴
	스크롤 방향 값 지정으로 브라우저 스크롤 막기




*/
$.fn.swipe = function( param ){

	var _this = this, //object
		factor = {
			returnstart : function(){}, //터치스타트,마우스 다운 함수
			returnmove : function(){}, //터치무브, 마우스 무브 함수
			returnend : function(){}, //터치엔드,마우스업 함수
			returncancel : function(){}, //터치캔슬 함수
			minDistanceX : 100, //리턴값에 방향이 'stop'이 되는 최소 이동거리 x
			minDistanceY : 100, //리턴값에 방향이 'stop'이 되는 최소 이동거리 y
			minClickDistance : 10 //클릭이벤트로 넘어가는 이동거리
		},
		v = {}; //좌표 값 및 필요 변수 생성
		v.startX = null; //시작 좌표 X
		v.startY = null; //시작 좌표 Y
		v.stateX = null; //진행중 좌표 X
		v.stateY = null; //진행중 좌표 Y
		v.endX = null; //종료시 좌표 X
		v.endY = null; //종료시 좌표 Y
		v.eventType = null; //이벤트 타입 지정 ( touch, mouse )
		_this.swipeState = 'end'; //객체의 초기상태

	/* setting */
	this.init = function(){
		v.eventType = _this.eventTypeCheck(); //이벤트 타입 지정 ( touch, mouse )
		factor = $.extend(factor,param);//인자 확장

		/* create event */
		_this
			.on(v.eventType.start , _this.actionStart)
			.on(v.eventType.move , _this.actionMove)
			.on(v.eventType.end , _this.actionEnd);

		if(v.eventType.touch) _this.on(v.eventType.cancel , _this.swipeCancel); //터치가 가능할때 터치캔슬 이벤트 적용

		//움직였을때 클릭이벤트
		_this.addClickEvent();
	}

	/* start */
	this.actionStart = function(e){
		var returns = {},
			useEvent = (v.eventType.touch) ? e.originalEvent.touches[0] : e;

		_this.swipeState = 'start';

		returns.x = v.startX = v.stateX = useEvent.pageX;
		returns.y = v.startY = v.stateY = useEvent.pageY;

		factor.returnstart( returns );
		
		//마우스 다운 이벤트 발생시에 클릭이벤트
		if( !v.eventType.touch ){
			return false;
		}
	}

	/* move */
	this.actionMove = function(e){
		var returns = {
				x : null,
				y : null,
				distanceX : null,
				distanceY : null,
				directionX : null,
				directionY : null
			},
			useEvent = (v.eventType.touch) ? e.originalEvent.touches[0] : e;

		if(_this.swipeState === 'end') {
			return false;
		}
		
		_this.swipeState = 'move';
		if( v.startX < useEvent.pageX ){
			returns.directionX = 'right';
		}else if( v.startX > useEvent.pageX ){
			returns.directionX = 'left';
		}else{
			returns.directionX = 'stop';
		}

		if( v.startY < useEvent.pageY ){
			returns.directionY = 'down';
		}else if( v.startY > useEvent.pageY ){
			returns.directionY = 'up';
		}else{
			returns.directionY = 'stop';
		}

		returns.x = v.stateX = useEvent.pageX;
		returns.y = v.stateY = useEvent.pageY;
		returns.distanceX = _this.distance(v.stateX, v.startX, false);
		returns.distanceY = _this.distance(v.stateY, v.startY, false);

		factor.returnmove( returns );

		//마우스 무브일경우 이미지 복사기능 작동 방지
		if( !v.eventType.touch ){
			return false;
		}else{
			e.preventDefault();
		}
	}

	/* end */
	this.actionEnd = function(e){
		var returns = {};

		if(_this.swipeState == 'end') return false;
		_this.swipeState = 'end';

		returns.x = v.endX = v.stateX;
		returns.y = v.endY = v.stateY;
		returns.distanceX = _this.distance(v.endX, v.startX, true);
		returns.distanceY = _this.distance(v.endY, v.startY, true);

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

		//마우스업, 터치엔드 시 클릭이벤트를 없앨것인지 변수값 설정
		if(returns.distanceX >= factor.minClickDistance || returns.distanceY >= factor.minClickDistance){
			_this.removeClickEvent = true;
		}
	}

	this.removeClickEvent = false;

	this.addClickEvent = function(){
		var targetEl = _this.get(0);

		if(!v.eventType.touch){
			if(document.addEventListener) {   // all browsers except IE before version 9
				document.addEventListener('click', defaultEvent, false);
				targetEl.addEventListener('dragstart', falseEvent);
	        }else if(document.attachEvent) {    // IE before version 9
				document.attachEvent('onclick', defaultEvent);
				targetEl.attachEvent('ondragstart', falseEvent);
	        }
	        
	        function defaultEvent(e){
	        	if( _this.removeClickEvent === true ){
		        	e.preventDefault();
		        	_this.removeClickEvent = false;
	        	}
	        }
	        function falseEvent(e){
	        	if( e.target.tagName === 'IMG' ){
	        		e.preventDefault()
		        	return false;
	        	}
	        }
		}

	};

	/* cancel */
	this.swipeCancel = function(){
		_this.swipeState = 'end';
		factor.returncancel();
		return false;
	}

	/* 움직인 거리를 리턴 */
	this.distance = function(start,end,math){
		var returns = (math) ? Math.abs(start - end) : start - end;
		return returns;
	}

	/* 브라우저 이벤트 타입 리턴 */
	this.eventTypeCheck = function(){
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

	this.init();

};
