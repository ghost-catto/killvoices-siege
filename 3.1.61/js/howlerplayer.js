	var Sound = function () {
		this.music = new Howl({
			src: [],
			autoplay: false,
			loop: true,
			volume: 0.2,
			onend: function () {},
		});

		this.kill = new Howl({
			src: track.path,
			autoplay: false,
			loop: false,
			volume: Settings.defaultVolumeSound,
			onend: function () {},
		});

		this.victory = new Howl({
			src: track.path,
			autoplay: false,
			loop: true,
			volume: Settings.defaultVolumeSound,
			onend: function () {},
		});

		this.init = function () {
			var self = this;
		};

		this.update = function () {
			if (Keyboard.M.down) {
				Keyboard.M.down = false;
				this.toggleMute();
			}
		};

		this.toggleMute = function () {
			Global.mute = !Global.mute;
			if (Global.mute) {
				Howler.mute();
				this.buttonMute.alpha = 0.5;
			} else {
				Howler.unmute();
				this.buttonMute.alpha = 1;
			}
		};
	};

	return new Sound();
});
