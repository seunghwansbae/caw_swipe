


var swipeGallery = {
	v : {},

	init : function(){
		var v = swipeGallery.v;

		v.target = $('#gallery');
		v.targetWidth = v.target.width();
		v.targetHeight = v.target.height();
		v.targetList = v.target.find('.galleryList');
		v.targetItem = v.targetList.find('.item');
		v.numNow = 0;
		v.numTotal = v.targetItem.length-1;
		v.nowItem = v.targetItem.eq(v.numNow);
		v.targetItemPos = {};

		/* reset */
		v.targetItem.css('left','-10000px');
		v.targetItem.eq(v.numNow).css('left','0');

		swipeGallery.regPos();

		$(window).on('resize',swipeGallery.resize);

		/*
			$(해당 객체).swipeState > 현재 진행 중인지 출력 start,move,end

			전달 인자 설명
			returnstart : function(), // 터치,클릭 함수
			returnmove : function(), // 이동 중 이벤트 함수
			returnend : function(), // 터치,업 완료 함수
			returncancel : function(), // 터치,클릭,이동 취소 함수, 최소 이동거리를 충족하지 못하고 mouseUP이 되는경우 취소 함수 실행, $(object).swipeCancel() < 이와 깉이 실행시 작동
			minDistanceX : number // 최소로 이동해야하는 거리 (default:100px) 해당 수치만큼 이동하지 않을경우 returnend 실행에서 directionX나 directionY의 값은 stop 리턴
			minDistanceY : number // 최소 이동해야하는 거리 y

		*/
		v.target.swipe({
			returnstart : swipeGallery.touchStart,
			returnmove : swipeGallery.touchMove,
			returnend : swipeGallery.touchEnd,
			returncancel : swipeGallery.touchCancel,
			minDistanceX : 100,
			minDistanceY : 100
		});
	},
	touchStart : function(e){
		//console.log(e);

		var v = swipeGallery.v;

		swipeGallery.regPos();
		v.nowItem = $(v.targetItem.eq(v.numNow));
	},
	touchMove : function(e){

		var v = swipeGallery.v,
			posX = v.targetItemPos[v.numNow].x + e.distanceX;

		swipeGallery.drag({
			left: posX - v.targetWidth,
			now: posX,
			right: posX + v.targetWidth
		});

	},
	touchEnd : function(e){
		var v = swipeGallery.v,
			action;
		console.log(e);
		if( e.distanceX > v.targetWidth/2 ){
			action = e.directionX;
		}else{
			action = 'stop';
		}
		//swipeGallery.regPos();
		swipeGallery.move(action);

	},
	touchCancel : function(e){
		//console.log(e);
	},
	regPos : function(){
		var v = swipeGallery.v,
			i;

		for(i = 0; i < v.numTotal; i++){
			v.targetItemPos[i] = {};
			v.targetItemPos[i].x = v.targetItem.eq(i).position().left;
			v.targetItemPos[i].y = v.targetItem.eq(i).position().top;
		}
	},
	resize : function(){
		var v = swipeGallery.v,
			item = swipeGallery.viewItem();

		v.targetWidth = v.target.width();
		v.targetHeight = v.target.outerHeight();

		swipeGallery.drag({
			left: -1 * v.targetWidth,
			now: 0,
			right: v.targetWidth
		});

		swipeGallery.regPos();
	},
	drag : function(pos){
		var v = swipeGallery.v,
			item = swipeGallery.viewItem();

		item.left.css('left', pos.left );
		v.nowItem.css('left', pos.now );
		item.right.css('left', pos.right );
	},
	move : function(action){
		var v = swipeGallery.v,
			item = swipeGallery.viewItem(),
			pos = {},
			animateOpt = {
				duration: 200,
				easing: 'easeOutCubic',
				complete: animateComplete
			};

		switch (action) {
			case 'left' :
				pos.left = -1 * (v.targetWidth * 2);
				pos.now = -1 * v.targetWidth;
				pos.right = 0;
				break;
			case 'right' :
				pos.left = 0;
				pos.now = v.targetWidth;
				pos.right = v.targetWidth * 2;
				break;
			case 'stop' :
				pos.left = -1 * v.targetWidth;
				pos.now = 0;
				pos.right = v.targetWidth;
				break;
		}

		item.left.animate({'left': pos.left},animateOpt);
		v.nowItem.animate({'left': pos.now},animateOpt);
		item.right.animate({'left': pos.right},animateOpt);

		function animateComplete(){

		}
			v.numNow = ( action == 'left' ) ? item.right.index() : item.left.index();
			console.log(v.numNow)
			v.nowItem = v.targetItem.eq(v.numNow);
	},
	viewItem : function(){
		var v = swipeGallery.v,
			returns = {};
		returns.left = (v.numNow == 0) ? v.targetItem.eq(v.numTotal) : v.targetItem.eq(v.numNow - 1),
		returns.right = (v.numNow == v.numTotal) ? v.targetItem.eq(0) : v.targetItem.eq(v.numNow + 1);

		return returns;
	},
	defaultPos : function(){

	}
}


$(document).ready(function(){
	swipeGallery.init( $('#gallery') );
});
