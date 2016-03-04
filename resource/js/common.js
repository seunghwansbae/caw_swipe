(function(){
	'use strict';

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
				minClickDistance : 10,
				pageScroll : 'none' // vertical, horizontal, none 페이지 스크롤이 있을 시 스와이프 처리 하지 않을 스크롤 방향

			*/
			v.target.swipe({
				returnstart : swipeGallery.touchStart,
				returnmove : swipeGallery.touchMove,
				returnend : swipeGallery.touchEnd,
				returncancel : swipeGallery.touchEnd,
				minDistanceX : 0,
				minDistanceY : 0,
				minClickDistance : 4,
				pageScroll : 'vertical'
			});
		},
		touchStart : function(e){
			/*
				e.x : 현재위치(px)
				e.y : 현재위치(px)
			*/
			var v = swipeGallery.v;

			swipeGallery.regPos();
			v.nowItem = $(v.targetItem.eq(v.numNow));
		},
		touchMove : function(e){
			/*
				e.directionX: 이동방향(text)
				e.directionY: 이동방향(text)
				e.distanceX: 이동거리(px)
				e.distanceY: 이동거리(px)
				e.x: 현재위치(px)
				e.y: 햔제위치(px)
			*/

			var v = swipeGallery.v,
				posX = v.targetItemPos[v.numNow].x + e.distanceX;
			swipeGallery.drag({
				left: posX - v.targetWidth,
				now: posX,
				right: posX + v.targetWidth
			});

		},
		touchEnd : function(e){
			/*
				e.directionX: 이동방향(text)
				e.directionY: 이동방향(text)
				e.distanceX: 이동거리(px)
				e.distanceY: 이동거리(px)
				e.speedX: 이동속도(px/ms)
				e.speedY: 이동속도(px/ms)
				e.x: 마지막 위치(px)
				e.y: 마지막 위치(px)
			*/
			var v = swipeGallery.v,
				action;
			$('#speed').html(e.directionX+'이동속도 :'+e.speedX.toFixed(2)+'<br>'+'이동거리: '+e.distanceX+'   OR:  '+ (500-(e.speedX*10)) );

			if( v.target.outerWidth()/2 < e.distanceX || e.speedX > 2){
				action = e.directionX;
			}else{
				action = 'stop';
			}


			swipeGallery.move(action, e.speedX);
		},
		touchCancel : function(e){

		},
		regPos : function(){
			var v = swipeGallery.v,
				i;

			for(i = 0; i <= v.numTotal; i++){
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
		move : function(action, speed){
			var v = swipeGallery.v,
				item = swipeGallery.viewItem(),
				pos = {},
				animateOpt = {
					duration: 200 - ( speed*10 ),
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

			if( action !== 'stop' ){
				v.numNow = ( action === 'left' ) ? item.right.index() : item.left.index();
				v.nowItem = v.targetItem.eq(v.numNow);
			}

			function animateComplete(){

			}
		},
		viewItem : function(){
			var v = swipeGallery.v,
				returns = {};
			returns.left = (v.numNow === 0) ? v.targetItem.eq(v.numTotal) : v.targetItem.eq(v.numNow - 1),
			returns.right = (v.numNow === v.numTotal) ? v.targetItem.eq(0) : v.targetItem.eq(v.numNow + 1);

			return returns;
		},
		defaultPos : function(){

		}
	}


	$(document).ready(function(){
		swipeGallery.init( $('#gallery') );

		$('body').on('click','.item',function(){
			//alert('click');
		});
	});

})();



/* test */
/*var originObj = function(){
	this.testNum = 0;
	//console.log(this);
}

originObj.prototype.add = function(num){
	this.testNum += num;
};

var tmpObj01 = new originObj();
var tmpObj02 = new originObj();

tmpObj01.add(1);
tmpObj02.add(2);
*/
//console.log('obj1 value : '+tmpObj01.testNum+'     obj2 value : '+tmpObj02.testNum);




/*
http://www.nextree.co.kr/p7323/
(5) prototypal한 방식의 재사용

이 방법은 Object.create()를 사용하여 객체를 생성과 동시에 프로토타입객체를 지정합니다.
이 함수는 첫 번째 매개변수는 부모객체로 사용할 객체를 넘겨주고,
두 번째 매개변수는 선택적 매개변수로써 반환되는 자식객체의 속성에 추가되는 부분입니다.
이 함수를 사용함으로 써 객체 생성과 동시에 부모객체를 지정하여 코드의 재활용을 간단하게 구현할 수 있습니다.

*/
/*var person = {
    type : "인간",
    getType : function(){
        return this.type;
    },
    getName : function(){
        return this.name;
    }
};

var joon = Object.create(person);
joon.name = "혁준";
person.type = "미친놈";
console.log(joon)
console.log(joon.getType());  // 인간
console.log(joon.getName());  // 혁준*/


/*
	위 소스 1라인에서 부모 객체에 해당하는 person을 객체 리터럴 방식으로 생성했습니다.
	11라인에서 자식 객체 joon은 Object.create() 함수를 이용하여 첫 번째 매개변수로 person을 넘겨받아
	joon 객체를 생성하였습니다. 한 줄로 객체를 생성함과 동시에 부모객체의 속성도 모두 물려받았습니다. 위의 1 ~ 4번에 해당하는
	classical 방식보다 간단하면서 여러 가지 상황을 생각할 필요도 없습니다. JavaScript에서는 new 연산자와 함수를 통해 생성한
	객체를 사용하는 classical 방식보다 prototypal 방식을 더 선호합니다.
*/
