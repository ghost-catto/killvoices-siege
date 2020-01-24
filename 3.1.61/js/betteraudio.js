define(
	[
		"libs/howler",
	],
	function (HowlerLib) {
		Sound2 = function () {
			this.music = new Howl({
				src      : [
					"sounds/mus/TENDYN.ogg",
				],
				preload  : false,
				autoplay : false,
				loop     : true,
				volume   : 1.0,
				onload   : function () {
					music.play();
				},
			});

			this.yeah = new Howl({
				src      : [
					"sounds/mus/TENDYN.ogg",
				],
				autoplay : false,
				loop     : false,
				volume   : 1,
				onend    : function () {},
			});

			this.victory = new Howl({
				src      : [
					"sounds/mus/TENDYN.ogg",
				],
				autoplay : false,
				loop     : true,
				volume   : 1,
				onend    : function () {},
			});

			this.init2 = function () {
				var self = this;
			};
		};
		return new Sound2();
	},
);
