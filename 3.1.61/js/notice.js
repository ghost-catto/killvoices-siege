require.config({
	baseUrl: 'js/',
	waitSeconds: 120,
	paths: {
		'ow-ad': 'http://content.overwolf.com/libs/ads/1/owads.min'
	},
	shim: {
		'ow-ad': {
			exports: 'OwAd'
		}
	}
});

require([
	'libs/ow-window',
	'libs/state',
	'libs/messenger',
	'libs/utils',

	'libs/vue.min',
	'libs/ga',
	'ow-ad',

	'app-config',
	'voice-packs-read',
], function(
	owWindow,
	stateManagers,
	messenger,
	utils,

	Vue,
	ga,
	OwAd,

	appConfig,
	vph
) {

'use strict';

const { state, persState } = stateManagers;

const { delay } = utils;

const
	indexWin	= new owWindow('index'),
	mainWin		= new owWindow('main'),
	noticeWin	= new owWindow('notice');

let	vm;

const winSize = appConfig.windows.notice;

async function init() {
	const game = state.get('gameRunning') || appConfig.games[0];

	if ( ! game ) {
		await noticeWin.close();
		return;
	}

	await vph.init();

	if ( ! persState.get('notFirstRun/notice') ) {
		persState.set('notFirstRun/notice', true);
		await noticeWin.changePosition(50, 100);
	}

	vm = new Vue({
		el : '#window-notice',
		data : {
			ad				: null,
			minimized		: false,
			isStreamer		: !!persState.get('userStreamer'),
			selectedVP		: getSelectedVP(),
			closeTimeout	: null,
			hover			: false
		},
		methods : {
			drag() {
				noticeWin.dragMove();
			},
			close() {
				noticeWin.close();
			},
			async switchVP() {
				await mainWin.restore();
				this.close();
			},
			async getWindowState() {
				const res = await noticeWin.getWindowState();

				if ( res && res.window_state )
					return res.window_state;
				else
					return null;
			},
			startAd() {
				if ( this.ad )
					return;

				this.ad = new OwAd(this.$refs.ad, {size: {width: 400, height: 300}});

				this.ad.addEventListener('play', async () => {
					console.log('ad event: play');
				});
				this.ad.addEventListener('display_ad_loaded', async () => {
					console.log('ad event: display_ad_loaded');
				});
				this.ad.addEventListener('complete', e => {
					this.ad.refreshAd();
				});
				this.ad.addEventListener('error', e => {
					console.error('ad error: '+ e, e);
				});
			},
			stopAd() {
				if ( this.ad ) {
					this.ad.removeAd();
					this.ad = null;
				}
			}
		},
		watch: {
			minimized(isMinimized) {
				if ( !isMinimized && !this.isStreamer )
					this.startAd();
				else
					this.stopAd();
			},
			hover(isHovered) {
				if ( isHovered )
					clearTimeout(this.closeTimeout);
				else
					this.closeTimeout = setTimeout(() => this.close(), 25000);
			}
		},
		async mounted() {
			const windowState = await this.getWindowState();

			this.minimized = (windowState === 'minimized');

			overwolf.windows.onStateChanged.addListener(e => {
				if ( e.window_name !== 'notice' )
					return;

				if ( e.window_state !== e.window_previous_state )
					this.minimized = (e.window_state === 'minimized');
			});

			if ( this.isStreamer )
				await noticeWin.changeSize(420, 262);
			else
				await noticeWin.changeSize(420, 560);

			await delay(50);
			await this.$nextTick();
			document.documentElement.classList.remove('hidden');

			if ( !this.minimized && !this.isStreamer )
				this.startAd();

			this.closeTimeout = setTimeout(() => this.close(), 25000);
		}
	});
}

function getSelectedVP() {
	const game = state.get('gameRunning') || appConfig.games[0];

	if ( ! game )
		return null;

	const
		selectedVPs = vph.selectedVPs,
		id = selectedVPs[game.name] || appConfig.defaultVP;

	if ( ! id )
		return null;

	const vp = vph.get(id);

	if ( vp.vps )
		vp.vpImages = Object.values(vp.vps).filter((v,i,a) => a.indexOf(v) === i);

	return vp;
}

init().catch(e => {
	console.warn('init(): error: '+ e.message, e);
	ga('send', 'event', 'errors', 'notice: init(): error: '+ e.message);
});

});
