/*
	v 1.0 작업중
		이동했을경우 클릭함수 실행 혹은 비실행 처리 해야됨 < 처리된듯
		_this.find('img').on('dragstart',function(){ 이 함수를 네이티브로 변경해야함 << 처리된듯
		터치 엔드시 리턴값에 속도 리턴 < 처리함
	
	스와이프 방향 값 지정으로 브라우저 스크롤 막기 처리된듯 ;;
	
	속도 계산

		1. 터치 스타트 시 배열생성
		2. 드래그시 해당 배열에 현재 위치값 삽입 (쉬프트, 배열 1칸은 1/1000초)
		3. 터치 엔드시 특정 순간 부터 마지막 엔드 까지의 배열 구간의 거리를 계산
		4. 움직인 거리 / 측정한 배열의 길이(시간) = **px/ms
		5. duration을 지정하기위해서 한번 더 계산이 필요함 (남은 거리 등)
		6. transform 플러그인 사용해야됨 안망함



*/
$.fn.swipe = function( param ){
	'use strict';

	var _this = this, //element object
		factor = { //option object
			returnstart : function(){}, //터치스타트,마우스 다운 함수
			returnmove : function(){}, //터치무브, 마우스 무브 함수
			returnend : function(){}, //터치엔드,마우스업 함수
			returncancel : function(){}, //터치캔슬 함수
			minDistanceX : 100, //리턴값에 방향이 'stop'이 되는 최소 이동거리 x
			minDistanceY : 100, //리턴값에 방향이 'stop'이 되는 최소 이동거리 y
			minClickDistance : 10, //클릭이벤트로 넘어가는 이동거리
			pageScroll : 'none' //비활성화할 터치 스크롤 방향 vertical, horizontal, none
		},
		v = {}; //좌표 값 및 필요 변수 생성
		v.startX = null; //시작 좌표 X
		v.startY = null; //시작 좌표 Y
		v.stateX = null; //진행중 좌표 X
		v.stateY = null; //진행중 좌표 Y
		v.endX = null; //종료시 좌표 X
		v.endY = null; //종료시 좌표 Y
		v.eventType = null; //이벤트 타입 지정 ( touch, mouse )
		v.removeClickEvent = false; //클릭이벤트를 지울것인지 여부
		v.moveTime = 0; //이동시간
		v.verticalScroll = null; //세로스크롤 할것인지 여부
		v.horizontalScroll = null; //가로 스크롤 할것인지 여부
		v.moveArrayX = null; //이동거리 배열
		v.moveArrayY = null; //이동거리 배열
		v.moveArrayLimit = 1000;

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

		if(v.eventType.touch) _this.on(v.eventType.cancel, _this.swipeCancel); //터치가 가능할때 터치캔슬 이벤트 적용

		//기본 이벤트 컨트롤
		_this.defaultEventControl();
	};

	this.defaultEventControl = function(){
		var targetObj = _this.get(0);

		//터치 디바이스의 경우 기본 터치무브 이벤트 컨트롤		
		if(v.eventType.touch){
			document.addEventListener('touchmove',function(e){
				if(  v.horizontalScroll === true || v.verticalScroll === true ){
					e.preventDefault();
				}
			});
		}

		//터치디바이스가 아닌경우 클릭, 드래그 이벤트 컨트롤 
		if(!v.eventType.touch){
			if(document.addEventListener) {   // more ie9 or other
				targetObj.addEventListener('click', defaultEvent);
				targetObj.addEventListener('dragstart', falseEvent);
			}else if(document.attachEvent) {    // upto ie9
				targetObj.attachEvent('onclick', defaultEvent);
				targetObj.attachEvent('ondragstart', falseEvent);
			}
		}	
		function defaultEvent(e){
			if( v.removeClickEvent === true ){
				preventDefault(e);
				stopPropagation(e);
				v.removeClickEvent = false;
			}
		}
		function falseEvent(e){
			var targetObj = (e.target !== undefined) ? e.target : e.srcElement;
			if( targetObj.tagName === 'IMG' ){
				preventDefault(e);
				stopPropagation(e);
				return false;
			}
		}
	};

	/* start */
	this.actionStart = function(e){
		var returns = {},
			useEvent = (v.eventType.touch) ? e.originalEvent.touches[0] : e;

		_this.swipeState = 'start';
		returns.x = v.startX = v.stateX = useEvent.pageX;
		returns.y = v.startY = v.stateY = useEvent.pageY;
		v.moveArrayX = [];
		v.moveArrayY = [];
		factor.returnstart( returns );
		_this.startTime();

		//마우스 다운 이벤트 발생시에 클릭이벤트
		if( !v.eventType.touch ){
			return false;
		}
	};

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
			useEvent = (v.eventType.touch) ? e.originalEvent.touches[0] : e,
			mathDtcX,
			mathDtcY;

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

		//이동거리 절대값으로 변환
		mathDtcX = Math.abs(returns.distanceX);
		mathDtcY = Math.abs(returns.distanceY);

		if( !v.eventType.touch ){
			//마우스 무브일경우 이미지 복사기능 작동 방지
			factor.returnmove( returns );
			return false;
		}else{
			//옵션 방향별 이동거리 미달 시 스크롤 되도록 변수 제어
			if( factor.pageScroll === 'vertical' && v.horizontalScroll === null ){
				if( mathDtcX > 5 || mathDtcY > 5 && mathDtcX > mathDtcY ){
					v.horizontalScroll = true;
				}else if( mathDtcX < 5 || mathDtcY < 5 && mathDtcX < mathDtcY ){
					v.horizontalScroll = false;
				}
			}else if( factor.pageScroll === 'horizontal'  && v.verticalScroll === null ){
				if( mathDtcY > 5 || mathDtcX > 5 && mathDtcY > mathDtcX ){
					v.verticalScroll = true;
				}else if( mathDtcY < 5 || mathDtcX < 5 && mathDtcY < mathDtcX ){
					v.verticalScroll = false;
				}
			}

			//옵션으로 적용된 스크롤 방향으로 스와이핑 되지 않을때만 이동 함수처리
			if( (v.horizontalScroll === true && factor.pageScroll === 'vertical') ||
				(v.verticalScroll === true && factor.pageScroll === 'horizontal') ||
				factor.pageScroll === 'none' ){
					factor.returnmove( returns );
			}

		}
	};

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

		//이동속도 계산
		returns.speedX = returns.distanceX / v.moveTime;
		returns.speedY = returns.distanceY / v.moveTime;
		console.log(v.moveArrayX[0])
		console.log(v.moveArrayX[v.moveArrayLimit])
		
		_this.endTime();

		//PC에서 마우스업 이벤트 시 클릭이벤트를 없앨것인지 변수값 설정
		if(returns.distanceX >= factor.minClickDistance || returns.distanceY >= factor.minClickDistance){
			v.removeClickEvent = true;

			//return
			if(v.horizontalScroll !== false && v.verticalScroll !== false){
				factor.returnend( returns );
			}
		}else{
			
		}

		_this.resetScrollDirection();
	};

	/* scroll direction reset */
	this.resetScrollDirection = function(){
		v.verticalScroll = v.horizontalScroll = null;
	};

	/* cancel */
	this.swipeCancel = function(){
		_this.swipeState = 'end';
		this.endTime();
		factor.returncancel();
		return false;
	};

	/* 움직인 거리를 리턴 */
	this.distance = function(start,end,math){
		var returns = (math) ? Math.abs(start - end) : start - end;
		return returns;
	};

	/* 브라우저 이벤트 타입 리턴 */
	this.eventTypeCheck = function(){
		var re = {},
			isTouch;
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
	};

	//속도 계산을 위한 시간 체크
	this.moveInterval = null;

	this.startTime = function(){
		this.moveInterval = setInterval(function(i){
			v.moveTime += 1;
			//속도체크를 위한 배열에 삽입
			v.moveArrayX.push(v.stateX);
			v.moveArrayY.push(v.stateY);
			if(v.moveArrayX.length-1 > v.moveArrayLimit ){
				console.log('지움')
				v.moveArrayX.shift();
				v.moveArrayY.shift();
			}
		},0);
	};

	this.endTime = function(){
		clearInterval(this.moveInterval)
		this.moveInterval = null;
		v.moveTime = 0;
		v.moveArrayX = [];
		v.moveArrayY = [];
	};

	function preventDefault(e){
		if( e.preventDefault !== undefined ){
			e.preventDefault();
		}else{
			e.returnValue = false;
		}
	}
	function stopPropagation(e){
		if( e.stopPropagation !== undefined ){
			e.stopPropagation();
		}else{
			e.cancelBubble = true;
		}
	}

	this.init();

};
