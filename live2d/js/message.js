const live2d_path = document.location.protocol +'//' + window.document.location.hostname + ((window.document.location.port==80)?(''):(':'+window.document.location.port)) + '/live2d/';
const userAgent = window.navigator.userAgent.toLowerCase();

let norunFlag = false;
if(!window.WebGLRenderingContext) {
	norunFlag = true;
}

if(!norunFlag) {
	let hitFlag = false;
	let AIFadeFlag = false;
	let liveTlakTimer = null;
	let sleepTimer_ = null;
	let AITalkFlag = false;
	(function () {
		function renderTip(template, context) {
			let tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;
			return template.replace(tokenReg, function (word, slash1, token, slash2) {
				if (slash1 || slash2) {
					return word.replace('\\', '');
				}
				let variables = token.replace(/\s/g, '').split('.');
				let currentObject = context;
				let i, length, variable;
				for (i = 0, length = variables.length; i < length; ++i) {
					variable = variables[i];
					currentObject = currentObject[variable];
					if (currentObject === undefined || currentObject === null) return '';
				}
				return currentObject;
			});
		}

		String.prototype.renderTip = function (context) {
			return renderTip(this, context);
		};

		$(document).on('copy', function () {
			showMessage('你都复制了些什么呀，转载要记得加上出处哦~', 5000);
		});

		function initTips() {
			$.ajax({
				cache: true,
				url: live2d_path + 'message.json',
				dataType: "json",
				success: function (result) {
					$.each(result.click, function (index, tips) {
						$(tips.selector).click(function () {
							if(hitFlag) {
								return false;
							}
							hitFlag = true;
							setTimeout(function() {
								hitFlag = false;
							}, 3000);
							let text = tips.text;
							if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];
							text = text.renderTip({text: $(this).text()});
							showMessage(text, 3000);
						});
						clearInterval(liveTlakTimer);
						liveTlakTimer = null;
						if(!liveTlakTimer) {
							liveTlakTimer = window.setInterval(function() {
								showHitokoto();
							}, 15000);
						};
					});
				}
			});
		}
		initTips();

		let now = (new Date()).getHours();
		let text = '';
		if (now > 23 || now <= 5) {
			text = '你是夜猫子呀？这么晚还不睡觉，明天起的来嘛？';
		} else if (now > 5 && now <= 7) {
			text = '早上好！一日之计在于晨，美好的一天就要开始了！';
		} else if (now > 7 && now <= 11) {
			text = '上午好！工作顺利嘛，不要久坐，多起来走动走动哦！';
		} else if (now > 11 && now <= 14) {
			text = '中午了，工作了一个上午，现在是午餐时间！';
		} else if (now > 14 && now <= 17) {
			text = '午后很容易犯困呢，今天的运动目标完成了吗？';
		} else if (now > 17 && now <= 19) {
			text = '傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红~~';
		} else if (now > 19 && now <= 21) {
			text = '晚上好，今天过得怎么样？';
		} else if (now > 21 && now <= 23) {
			text = '已经这么晚了呀，早点休息吧，晚安~~';
		} else {
			text = '嗨~ 快来逗我玩吧！';
		}
		showMessage(text, 12000);
	})();

	liveTlakTimer = setInterval(function() {
		showHitokoto();
	}, 15000);

	function showHitokoto() {
		if(sessionStorage.getItem("Sleepy")!=="1") {
			if(!AITalkFlag) {
				$.getJSON('https://v1.hitokoto.cn/', function(result) {
					talkValTimer();
					showMessage(result.hitokoto, 0);
				});
			}
		}else{
			hideMessage(0);
			if(!sleepTimer_) {
				sleepTimer_ = setInterval(function() {
					checkSleep();
				}, 200);
			}
		}
	}

	function checkSleep() {
		let sleepStatu = sessionStorage.getItem("Sleepy");
		if(sleepStatu!=='1') {
			talkValTimer();
			showMessage('你回来啦~', 0);
			clearInterval(sleepTimer_);
			sleepTimer_= null;
		}
	}

	function showMessage(text, timeout) {
		if(Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1)-1];
		$('.message').stop();
		$('.message').html(text);
		$('.message').fadeTo(200, 1);
	}
	function talkValTimer() {
		$('#live_talk').val('1');
	}

	function hideMessage(timeout) {
		if (timeout === null) timeout = 5000;
		$('.message').delay(timeout).fadeTo(200, 0);
	}

	function initLive2d () {
		$('#hideButton').on('click', function() {
			if(AIFadeFlag) {
				return false;
			}else{
				AIFadeFlag = true;
				localStorage.setItem("live2dhidden", "0");
				$('#landlord').fadeOut(200);
				$('#open_live2d').delay(200).fadeIn(200);
				setTimeout(function() {
					AIFadeFlag = false;
				}, 300);
			}
		});
		$('#open_live2d').on('click', function() {
			if(AIFadeFlag) {
				return false;
			}else{
				AIFadeFlag = true;
				localStorage.setItem("live2dhidden", "1");
				$('#open_live2d').fadeOut(200);
				$('#landlord').delay(200).fadeIn(200);
				setTimeout(function() {
					AIFadeFlag = false;
				}, 300);
			}
		});
		$('#youduButton').on('click', function() {
			if($('#youduButton').hasClass('doudong')) {
				let typeIs = $('#youduButton').attr('data-type');
				$('#youduButton').removeClass('doudong');
				$('body').removeClass(typeIs);
				$('#youduButton').attr('data-type', '');
			}else{
				let duType = $('#duType').val();
				let duArr = duType.split(',');
				let dataType = duArr[Math.floor(Math.random() * duArr.length)];

				$('#youduButton').addClass('doudong');
				$('#youduButton').attr('data-type', dataType);
				$('body').addClass(dataType);
			}
		});
	}
	$(document).ready(function() {
		let AIimgSrc = [
			live2d_path + "model/rem/remu2048/texture_00.png"
		]
		let images = [];
		let imgLength = AIimgSrc.length;
		let loadingNum = 0;
		for(let i=0;i<imgLength;i++) {
			images[i] = new Image();
			images[i].src = AIimgSrc[i];
			images[i].onload = function() {
				loadingNum++;
				if(loadingNum===imgLength) {
					let live2dhidden = localStorage.getItem("live2dhidden");
					if(live2dhidden==="0") {
						setTimeout(function() {
							$('#open_live2d').fadeIn(200);
						}, 1300);
					}else{
						setTimeout(function() {
							$('#landlord').fadeIn(200);
						}, 1300);
					}
					setTimeout(function() {
						loadlive2d("live2d", live2d_path + "model/rem/rem.json");
					}, 1000);
					initLive2d();
					images = null;
				}
			}
		}
	});
} 