
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
		console.log(e);

		var v = swipeGallery.v;

		swipeGallery.regPos();
		v.nowItem = $(v.targetItem.eq(v.numNow));
	},
	touchMove : function(e){

		var v = swipeGallery.v,
			posX = v.targetItemPos[v.numNow].x + e.distanceX;

		swipeGallery.move({
			left: posX - v.targetWidth,
			now: posX,
			right: posX + v.targetWidth
		});

	},
	touchEnd : function(e){
		console.log(e);

		swipeGallery.regPos();

	},
	touchCancel : function(e){
		console.log(e);
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

		swipeGallery.move({
			left: -1 * v.targetWidth,
			now: 0,
			right: v.targetWidth
		});

		swipeGallery.regPos();
	},
	move : function(pos){
		var v = swipeGallery.v,
			item = swipeGallery.viewItem();

		item.left.css('left', pos.left );
		v.nowItem.css('left', pos.now );
		item.right.css('left', pos.right );
	},
	viewItem : function(){
		var v = swipeGallery.v,
			returns = {};
		returns.left = (v.numNow == 0) ? v.targetItem.eq(v.numTotal) : v.targetItem.eq(v.numNow - 1),
		returns.right = (v.numNow == v.numTotal) ? v.targetItem.eq(0) : v.targetItem.eq(v.numNow + 1);

		return returns;
	},
	convertCss : function(action){
		// if(action == 'left') {
		// 	return {'left'};
		// }
	},
	checkTransform : function(){

	}
}


$(document).ready(function(){
	swipeGallery.init( $('#gallery') );
});
